import { supabase } from '@/integrations/supabase/client';
import { differenceInDays, parseISO, format } from 'date-fns';
import emailService from './emailService';

interface Contract {
  id: string;
  title: string;
  contract_number: string | null;
  counterparty: string | null;
  end_date: string | null;
  auto_renewal: boolean | null;
  renewal_period_months: number | null;
  status: 'draft' | 'review' | 'approved' | 'signed' | 'executed' | 'expired' | 'terminated';
}

interface User {
  id: string;
  email: string;
  full_name: string | null;
}

interface NotificationSettings {
  contract_expiry_enabled: boolean;
  contract_renewal_enabled: boolean;
  days_before_expiry: number[];
  days_before_renewal: number[];
}

export class ContractNotificationService {
  // Check for contracts nearing expiry or renewal and send notifications
  async checkAndSendNotifications(): Promise<void> {
    try {
      // Get all active contracts
      const { data: contracts, error: contractsError } = await supabase
        .from('contracts')
        .select('*')
        .in('status', ['approved', 'signed', 'executed'])
        .not('end_date', 'is', null);

      if (contractsError || !contracts) {
        console.error('Failed to fetch contracts:', contractsError);
        return;
      }

      // Process each contract
      for (const contract of contracts) {
        await this.processContract(contract as Contract);
      }
    } catch (error) {
      console.error('Error in contract notification service:', error);
    }
  }

  // Process a single contract for notifications
  private async processContract(contract: Contract): Promise<void> {
    if (!contract.end_date) return;
    
    const endDate = parseISO(contract.end_date);
    const today = new Date();
    const daysUntilExpiry = differenceInDays(endDate, today);
    
    // Skip if contract is already expired
    if (daysUntilExpiry < 0) return;
    
    // Get assigned user for this contract
    const { data: assignedUser, error: userError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', contract.assigned_to)
      .single();
    
    if (userError || !assignedUser) {
      console.error('Failed to fetch assigned user:', userError);
      return;
    }

    // Get notification settings for the user
    const { data: settings, error: settingsError } = await supabase
      .from('email_notification_settings')
      .select('*')
      .eq('user_id', assignedUser.id)
      .single();
    
    if (settingsError || !settings) {
      console.error('Failed to fetch notification settings:', settingsError);
      return;
    }

    // Check and send expiry notifications if enabled
    if (settings.contract_expiry_enabled && 
        settings.days_before_expiry.includes(daysUntilExpiry)) {
      await this.sendExpiryNotification(contract, assignedUser, daysUntilExpiry);
    }
    
    // Check and send renewal notifications if enabled and contract has auto-renewal
    if (settings.contract_renewal_enabled && 
        contract.auto_renewal && 
        settings.days_before_renewal.includes(daysUntilExpiry)) {
      await this.sendRenewalNotification(contract, assignedUser, daysUntilExpiry);
    }
  }

  // Send expiry notification email
  private async sendExpiryNotification(
    contract: Contract, 
    user: User, 
    daysRemaining: number
  ): Promise<void> {
    const subject = `Contract Expiry Alert: ${contract.title} expires in ${daysRemaining} days`;
    
    const html = `
      <h2>Contract Expiry Notification</h2>
      <p>Hello ${user.full_name || 'there'},</p>
      <p>This is a reminder that the following contract is expiring soon:</p>
      <ul>
        <li><strong>Contract:</strong> ${contract.title}</li>
        <li><strong>Contract Number:</strong> ${contract.contract_number || 'N/A'}</li>
        <li><strong>Counterparty:</strong> ${contract.counterparty || 'N/A'}</li>
        <li><strong>Expiry Date:</strong> ${format(parseISO(contract.end_date!), 'MMMM dd, yyyy')}</li>
        <li><strong>Days Remaining:</strong> ${daysRemaining}</li>
      </ul>
      <p>Please review this contract and take appropriate action.</p>
      <p>Thank you,<br>Contract Management System</p>
    `;
    
    const success = await emailService.sendEmail({
      to: user.email,
      subject,
      html
    });
    
    // Log the notification
    await emailService.logEmailNotification(
      user.id,
      contract.id,
      'contract_expiry',
      daysRemaining,
      user.email,
      subject,
      html,
      success ? 'sent' : 'failed'
    );
  }

  // Send renewal notification email
  private async sendRenewalNotification(
    contract: Contract, 
    user: User, 
    daysRemaining: number
  ): Promise<void> {
    const subject = `Contract Renewal Alert: ${contract.title} renews in ${daysRemaining} days`;
    
    const html = `
      <h2>Contract Renewal Notification</h2>
      <p>Hello ${user.full_name || 'there'},</p>
      <p>This is a reminder that the following contract is set for automatic renewal:</p>
      <ul>
        <li><strong>Contract:</strong> ${contract.title}</li>
        <li><strong>Contract Number:</strong> ${contract.contract_number || 'N/A'}</li>
        <li><strong>Counterparty:</strong> ${contract.counterparty || 'N/A'}</li>
        <li><strong>Renewal Date:</strong> ${format(parseISO(contract.end_date!), 'MMMM dd, yyyy')}</li>
        <li><strong>Days Until Renewal:</strong> ${daysRemaining}</li>
        <li><strong>Renewal Period:</strong> ${contract.renewal_period_months} months</li>
      </ul>
      <p>If you wish to prevent automatic renewal, please take action before the renewal date.</p>
      <p>Thank you,<br>Contract Management System</p>
    `;
    
    const success = await emailService.sendEmail({
      to: user.email,
      subject,
      html
    });
    
    // Log the notification
    await emailService.logEmailNotification(
      user.id,
      contract.id,
      'contract_renewal',
      daysRemaining,
      user.email,
      subject,
      html,
      success ? 'sent' : 'failed'
    );
  }
}

// Create a singleton instance
const contractNotificationService = new ContractNotificationService();
export default contractNotificationService; 