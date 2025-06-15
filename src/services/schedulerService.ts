import contractNotificationService from './contractNotificationService';
import emailService from './emailService';

class SchedulerService {
  private notificationInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private intervalMs: number = 24 * 60 * 60 * 1000; // Default: once per day (24 hours)

  // Start the scheduler
  start(emailConfig: { email: string, appPassword: string }, intervalHours?: number): void {
    if (this.isRunning) {
      console.log('Scheduler already running');
      return;
    }

    // Initialize email service
    emailService.initializeWithGmail(emailConfig.email, emailConfig.appPassword)
      .then(success => {
        if (!success) {
          console.error('Failed to initialize email service. Scheduler not started.');
          return;
        }

        // Set interval if provided
        if (intervalHours) {
          this.intervalMs = intervalHours * 60 * 60 * 1000;
        }

        // Run once immediately
        this.runNotificationCheck();

        // Then set up interval
        this.notificationInterval = setInterval(() => {
          this.runNotificationCheck();
        }, this.intervalMs);

        this.isRunning = true;
        console.log(`Scheduler started. Running every ${this.intervalMs / (60 * 60 * 1000)} hours.`);
      })
      .catch(error => {
        console.error('Error initializing email service:', error);
      });
  }

  // Stop the scheduler
  stop(): void {
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
      this.notificationInterval = null;
      this.isRunning = false;
      console.log('Scheduler stopped');
    }
  }

  // Run the notification check manually
  async runNotificationCheck(): Promise<void> {
    console.log('Running contract notification check:', new Date().toISOString());
    try {
      await contractNotificationService.checkAndSendNotifications();
      console.log('Contract notification check completed');
    } catch (error) {
      console.error('Error running notification check:', error);
    }
  }

  // Check if scheduler is running
  isActive(): boolean {
    return this.isRunning;
  }

  // Get current interval in hours
  getIntervalHours(): number {
    return this.intervalMs / (60 * 60 * 1000);
  }
}

// Create a singleton instance
const schedulerService = new SchedulerService();
export default schedulerService; 