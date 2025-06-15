import { supabase } from '@/integrations/supabase/client';

// Email configuration
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// Email content
interface EmailContent {
  to: string;
  subject: string;
  html: string;
}

// Email service class
class EmailService {
  private initialized: boolean = false;
  private from: string = '';
  private config: EmailConfig | null = null;

  constructor() {
    // No direct nodemailer initialization in browser
  }

  // Initialize the email service with credentials
  async initialize(config: EmailConfig, fromEmail: string): Promise<boolean> {
    try {
      this.config = config;
      this.from = fromEmail;
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      return false;
    }
  }

  // Initialize with Gmail using app password
  async initializeWithGmail(email: string, appPassword: string): Promise<boolean> {
    const config: EmailConfig = {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: email,
        pass: appPassword
      }
    };
    
    return this.initialize(config, email);
  }

  // Send an email using Supabase Edge Function
  async sendEmail(content: EmailContent): Promise<boolean> {
    if (!this.initialized || !this.config) {
      console.error('Email service not initialized');
      return false;
    }

    try {
      // Call the Supabase Edge Function to send the email
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: JSON.stringify({
          from: this.from,
          to: content.to,
          subject: content.subject,
          html: content.html,
          config: this.config
        })
      });

      if (error) {
        console.error('Error calling send-email function:', error);
        return false;
      }

      return data?.success || false;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // Log email notification in the database
  async logEmailNotification(
    userId: string,
    contractId: string,
    notificationType: string,
    daysRemaining: number,
    emailTo: string,
    emailSubject: string,
    emailBody: string,
    status: string
  ): Promise<void> {
    try {
      await supabase.from('email_notification_logs').insert({
        user_id: userId,
        contract_id: contractId,
        notification_type: notificationType,
        days_remaining: daysRemaining,
        email_to: emailTo,
        email_subject: emailSubject,
        email_body: emailBody,
        status: status
      });
    } catch (error) {
      console.error('Failed to log email notification:', error);
    }
  }
}

// Create a singleton instance
const emailService = new EmailService();
export default emailService; 