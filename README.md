# 📋 Contract Management System

<div align="center">

![Contract Management](https://img.shields.io/badge/Contract-Management-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase)

*A comprehensive, enterprise-grade contract lifecycle management platform built with modern web technologies*

[🚀 Live Demo](https://lovable.dev/projects/6392f85b-671f-48d4-82ad-8cbf450ef07c) • [📖 Documentation](#documentation) • [🛠️ Installation](#installation) • [🤝 Contributing](#contributing)

</div>

---

## ✨ Features

### 🎯 **Core Contract Management**
- **📄 Contract Lifecycle Management** - Complete contract creation, review, approval, and execution workflow
- **📝 Template Library** - Pre-built contract templates (NDAs, Employment, Service Agreements, etc.)
- **🔄 Version Control** - Track contract changes with comprehensive version history
- **📊 Advanced Analytics** - Real-time dashboards with KPIs and contract trends
- **🔍 Smart Search** - Advanced search with filters, tags, and metadata
- **🤖 AI-Powered Clause Extraction** - Automatically identify and categorize key contract clauses

### 🚀 **Advanced Workflow Engine**
- **⚡ Visual Workflow Builder** - Drag-and-drop workflow creation
- **✅ Approval Workflows** - Multi-stage approval processes with role-based access
- **🤝 Negotiation Interface** - Real-time contract negotiation and comparison tools
- **👥 Collaboration Tools** - Team workspaces with task assignment and notifications

### 🔐 **Security & Compliance**
- **🛡️ Role-Based Access Control** - Admin, Legal, and Viewer roles with granular permissions
- **📋 Audit Trail** - Complete activity logging for compliance
- **🔔 Smart Notifications** - Contract expiry alerts and workflow updates
- **✍️ E-Signature Integration** - Secure digital signature capabilities

### 📁 **Organization & Management**
- **🗂️ Folder Organization** - Hierarchical contract organization
- **🏷️ Tagging System** - Flexible contract categorization
- **📈 Reporting Dashboard** - Comprehensive analytics and insights
- **🌙 Dark/Light Theme** - Modern UI with theme switching

---

## 🛠️ Technology Stack

### **Frontend**
- **⚛️ React 18** - Modern React with hooks and functional components
- **📘 TypeScript** - Type-safe development with full IntelliSense
- **⚡ Vite** - Lightning-fast build tool and dev server
- **🎨 Tailwind CSS** - Utility-first CSS framework
- **🧩 shadcn/ui** - Beautiful, accessible component library
- **📊 Recharts** - Responsive chart library for analytics

### **Backend & Database**
- **🗄️ Supabase** - PostgreSQL database with real-time subscriptions
- **🔐 Supabase Auth** - Authentication and authorization
- **📡 React Query** - Server state management and caching
- **🧠 OpenAI API** - AI-powered contract analysis and clause extraction

### **UI/UX Libraries**
- **🎭 Radix UI** - Unstyled, accessible UI primitives
- **🎨 Lucide React** - Beautiful icon library
- **📱 Responsive Design** - Mobile-first approach
- **🌈 Class Variance Authority** - Type-safe component variants

---

## 🚀 Installation

### **Prerequisites**
- Node.js 18+ and npm
- Git

### **Quick Start**

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Available Scripts**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:dev    # Build in development mode
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

---

## 📖 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── access/          # Authentication & authorization
│   ├── approval/        # Contract approval workflows
│   ├── audit/           # Audit trail components
│   ├── charts/          # Analytics and reporting charts
│   ├── collaboration/   # Team collaboration features
│   ├── contract-*/      # Contract management modules
│   ├── negotiation/     # Contract negotiation tools
│   ├── notifications/   # Alert and notification system
│   ├── organization/    # File and folder organization
│   ├── search/          # Advanced search functionality
│   ├── signature/       # E-signature integration
│   ├── templates/       # Contract template management
│   ├── theme/           # Theme provider and toggle
│   ├── ui/              # shadcn/ui components
│   ├── workflow/        # Workflow builder and engine
│   └── workspace/       # Team workspace management
├── hooks/               # Custom React hooks
├── integrations/        # External service integrations
│   └── supabase/       # Supabase client and types
├── lib/                 # Utility functions
├── pages/               # Application pages/routes
└── main.tsx            # Application entry point
```

---

## 🎯 Key Features Deep Dive

### **📊 Dashboard Analytics**
- Real-time KPI tracking (Total Contracts, Pending Reviews, Executed Contracts, Contract Value)
- Interactive charts showing contract trends and performance metrics
- Activity feed with recent contract activities
- Role-based dashboard customization

### **📋 Contract Management**
- **Create**: Step-by-step contract creation wizard with template selection
- **Review**: Collaborative review process with comments and suggestions
- **Approve**: Multi-level approval workflows with automated routing
- **Execute**: E-signature integration for contract execution
- **Monitor**: Track contract performance and compliance
- **Analyze**: AI-powered clause extraction categorized by department (Legal, Commercial, Compliance, Operational)

### **🔄 Workflow Automation**
- Visual workflow builder with drag-and-drop interface
- Pre-built workflow templates for common processes
- Conditional logic and branching
- Integration with approval and notification systems

### **👥 Collaboration Features**
- Team workspaces for project-based collaboration
- Real-time notifications and updates
- Task assignment and tracking
- Comment and annotation system

---

## 🔧 Configuration

### **Environment Setup**
The application uses Supabase for backend services and OpenAI for AI features. Configure your environment:

1. **Supabase Project**: Set up your Supabase project
2. **Database**: Run the provided migrations in `/supabase/migrations/`
3. **Authentication**: Configure authentication providers
4. **Environment Variables**: 
   - Update Supabase URL and keys in the client configuration
   - Add your OpenAI API key to the `.env` file as `VITE_OPENAI_API_KEY`

### **Database Schema**
The application includes comprehensive database schema with:
- User profiles and role management
- Contract lifecycle tracking
- Template management
- Workflow definitions
- Audit logging
- Notification system

---

## 🚀 Deployment

### **Lovable Platform** (Recommended)
1. Visit [Lovable Project](https://lovable.dev/projects/6392f85b-671f-48d4-82ad-8cbf450ef07c)
2. Click Share → Publish
3. Configure custom domain if needed

### **Manual Deployment**
```bash
# Build the application
npm run build

# Deploy the dist/ folder to your hosting provider
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **🍴 Fork** the repository
2. **🌿 Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **💾 Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **📤 Push** to the branch (`git push origin feature/amazing-feature`)
5. **🔄 Open** a Pull Request

### **Development Guidelines**
- Follow TypeScript best practices
- Use the existing component patterns
- Add proper error handling
- Include appropriate tests
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Supabase** for the robust backend infrastructure
- **Radix UI** for accessible UI primitives
- **Tailwind CSS** for the utility-first styling approach
- **React Query** for excellent server state management

---

<div align="center">

**Built with ❤️ for modern contract management**

[⭐ Star this repo](https://github.com/your-repo) • [🐛 Report Bug](https://github.com/your-repo/issues) • [💡 Request Feature](https://github.com/your-repo/issues)

</div>
