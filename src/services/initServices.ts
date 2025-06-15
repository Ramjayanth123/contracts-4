import { supabase } from '@/integrations/supabase/client';
import schedulerService from './schedulerService';

// Configuration for email service from environment variables
const EMAIL_SERVICE_ENABLED = import.meta.env.VITE_EMAIL_SERVICE_ENABLED === 'true';
const EMAIL_ADDRESS = import.meta.env.VITE_EMAIL_ADDRESS || '';
const EMAIL_APP_PASSWORD = import.meta.env.VITE_EMAIL_APP_PASSWORD || '';
const EMAIL_CHECK_INTERVAL_HOURS = parseInt(import.meta.env.VITE_EMAIL_CHECK_INTERVAL_HOURS || '24');

/**
 * Initialize all application services
 */
export const initializeServices = async () => {
  console.log('Initializing application services...');
  
  // Initialize email notification service if enabled
  if (EMAIL_SERVICE_ENABLED && EMAIL_ADDRESS && EMAIL_APP_PASSWORD) {
    console.log('Email notification service is enabled. Initializing...');
    
    try {
      schedulerService.start(
        { 
          email: EMAIL_ADDRESS, 
          appPassword: EMAIL_APP_PASSWORD 
        },
        EMAIL_CHECK_INTERVAL_HOURS
      );
      
      console.log(`Email notification service initialized. Checking every ${EMAIL_CHECK_INTERVAL_HOURS} hours.`);
    } catch (error) {
      console.error('Failed to initialize email notification service:', error);
    }
  } else {
    console.log('Email notification service is not enabled or missing configuration.');
  }
};

export default initializeServices; 