
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE public.user_role AS ENUM ('admin', 'legal', 'viewer');
CREATE TYPE public.contract_status AS ENUM ('draft', 'review', 'approved', 'signed', 'executed', 'expired', 'terminated');
CREATE TYPE public.template_category AS ENUM ('nda', 'employment', 'service', 'purchase', 'partnership', 'other');
CREATE TYPE public.workflow_status AS ENUM ('active', 'paused', 'completed', 'failed');
CREATE TYPE public.notification_type AS ENUM ('contract_expiry', 'approval_required', 'workflow_update', 'system');
CREATE TYPE public.audit_action AS ENUM ('created', 'updated', 'deleted', 'approved', 'signed', 'exported');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'viewer',
    department TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create contracts table
CREATE TABLE public.contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    contract_number TEXT UNIQUE,
    status contract_status DEFAULT 'draft',
    template_id UUID,
    created_by UUID REFERENCES public.profiles(id),
    assigned_to UUID REFERENCES public.profiles(id),
    counterparty TEXT,
    counterparty_email TEXT,
    start_date DATE,
    end_date DATE,
    value DECIMAL(15,2),
    currency TEXT DEFAULT 'USD',
    auto_renewal BOOLEAN DEFAULT FALSE,
    renewal_period_months INTEGER,
    file_url TEXT,
    signed_file_url TEXT,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create contract templates table
CREATE TABLE public.contract_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category template_category DEFAULT 'other',
    content TEXT,
    fields JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id),
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workflows table
CREATE TABLE public.workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    trigger_conditions JSONB DEFAULT '{}',
    actions JSONB DEFAULT '{}',
    status workflow_status DEFAULT 'active',
    created_by UUID REFERENCES public.profiles(id),
    execution_count INTEGER DEFAULT 0,
    last_executed TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create workflow executions table
CREATE TABLE public.workflow_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending',
    result JSONB DEFAULT '{}',
    error_message TEXT,
    executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT,
    type notification_type DEFAULT 'system',
    related_contract_id UUID REFERENCES public.contracts(id),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit trail table
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id),
    action audit_action NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create contract versions table for version control
CREATE TABLE public.contract_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content TEXT,
    changes_summary TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create contract approvals table
CREATE TABLE public.contract_approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    approver_id UUID REFERENCES public.profiles(id),
    status TEXT DEFAULT 'pending',
    comments TEXT,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create folders table for organization
CREATE TABLE public.folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    parent_id UUID REFERENCES public.folders(id),
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create contract folder assignments
CREATE TABLE public.contract_folders (
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    folder_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
    PRIMARY KEY (contract_id, folder_id)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_folders ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND role = _role
  )
$$;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for contracts
CREATE POLICY "Users can view contracts" ON public.contracts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Legal and admin can create contracts" ON public.contracts FOR INSERT TO authenticated WITH CHECK (
  public.has_role(auth.uid(), 'legal') OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Legal and admin can update contracts" ON public.contracts FOR UPDATE TO authenticated USING (
  public.has_role(auth.uid(), 'legal') OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Admin can delete contracts" ON public.contracts FOR DELETE TO authenticated USING (
  public.has_role(auth.uid(), 'admin')
);

-- Create RLS policies for templates
CREATE POLICY "Users can view templates" ON public.contract_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Legal and admin can manage templates" ON public.contract_templates FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'legal') OR public.has_role(auth.uid(), 'admin')
);

-- Create RLS policies for workflows
CREATE POLICY "Users can view workflows" ON public.workflows FOR SELECT TO authenticated USING (true);
CREATE POLICY "Legal and admin can manage workflows" ON public.workflows FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'legal') OR public.has_role(auth.uid(), 'admin')
);

-- Create RLS policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Create RLS policies for audit logs
CREATE POLICY "Users can view audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Create RLS policies for other tables
CREATE POLICY "Users can view contract versions" ON public.contract_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Legal and admin can manage contract versions" ON public.contract_versions FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'legal') OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can view contract approvals" ON public.contract_approvals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage contract approvals" ON public.contract_approvals FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view folders" ON public.folders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Legal and admin can manage folders" ON public.folders FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'legal') OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can view contract folders" ON public.contract_folders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Legal and admin can manage contract folders" ON public.contract_folders FOR ALL TO authenticated USING (
  public.has_role(auth.uid(), 'legal') OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can view workflow executions" ON public.workflow_executions FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can manage workflow executions" ON public.workflow_executions FOR ALL TO authenticated USING (true);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'viewer')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON public.contract_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON public.workflows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for contract files
INSERT INTO storage.buckets (id, name, public) VALUES ('contracts', 'contracts', false);

-- Create storage policies
CREATE POLICY "Authenticated users can upload contract files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'contracts');
CREATE POLICY "Authenticated users can view contract files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'contracts');
CREATE POLICY "Legal and admin can delete contract files" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'contracts' AND (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('legal', 'admin'))
  )
);

-- Create indexes for better performance
CREATE INDEX idx_contracts_status ON public.contracts(status);
CREATE INDEX idx_contracts_created_by ON public.contracts(created_by);
CREATE INDEX idx_contracts_end_date ON public.contracts(end_date);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_contract_versions_contract_id ON public.contract_versions(contract_id);
