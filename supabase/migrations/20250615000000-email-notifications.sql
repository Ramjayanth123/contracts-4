-- Enable necessary extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create email notification settings table
CREATE TABLE public.email_notification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    contract_expiry_enabled BOOLEAN DEFAULT TRUE,
    contract_renewal_enabled BOOLEAN DEFAULT TRUE,
    days_before_expiry INTEGER[] DEFAULT '{30, 14, 7, 3, 1}',
    days_before_renewal INTEGER[] DEFAULT '{30, 14, 7, 3, 1}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create email notification logs table
CREATE TABLE public.email_notification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    contract_id UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL,
    days_remaining INTEGER,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    email_to TEXT NOT NULL,
    email_subject TEXT NOT NULL,
    email_body TEXT NOT NULL,
    status TEXT NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_email_settings_user_id ON public.email_notification_settings(user_id);
CREATE INDEX idx_email_logs_user_id ON public.email_notification_logs(user_id);
CREATE INDEX idx_email_logs_contract_id ON public.email_notification_logs(contract_id);

-- Add trigger to update the updated_at column
CREATE TRIGGER update_email_settings_updated_at 
BEFORE UPDATE ON public.email_notification_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings for existing users
INSERT INTO public.email_notification_settings (user_id)
SELECT id FROM public.profiles; 