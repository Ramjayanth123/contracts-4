# Email Notification System

This document explains how to set up and use the email notification system for contract expiry and renewal reminders.

## Overview

The email notification system automatically sends alerts to users when their contracts are about to expire or renew. The system checks for contracts nearing expiration at regular intervals and sends emails based on user-defined settings.

## Architecture

This system uses a browser-compatible approach:

1. The frontend collects email configuration and content
2. A Supabase Edge Function handles the actual email sending using SMTP
3. Email logs are stored in the database

## Features

- **Contract Expiry Notifications**: Alerts sent when contracts are about to expire
- **Contract Renewal Notifications**: Alerts sent when contracts with auto-renewal are about to renew
- **Customizable Alert Schedule**: Configure how many days before expiry/renewal to send alerts
- **Email Logging**: All sent emails are logged in the database for tracking
- **User-specific Settings**: Each user can configure their own notification preferences

## Setup Instructions

### 1. Database Setup

Run the database migration to create the required tables:

```bash
# From your project root
cd supabase
npx supabase migration up
```

This will create:
- `email_notification_settings` table to store user preferences
- `email_notification_logs` table to track sent emails

### 2. Deploy Supabase Edge Function

Deploy the email sending function to Supabase:

```bash
# From your project root
cd supabase/functions
chmod +x deploy.sh
./deploy.sh
```

### 3. Environment Configuration

Copy the environment variables from `email-config.example.env` to your `.env` file:

```bash
# Email Service Configuration
VITE_EMAIL_SERVICE_ENABLED=true
VITE_EMAIL_ADDRESS=your-email@gmail.com
VITE_EMAIL_APP_PASSWORD=your-google-app-password
VITE_EMAIL_CHECK_INTERVAL_HOURS=24
```

### 4. Google App Password

The system uses Gmail SMTP with an App Password (not your regular Gmail password):

1. Go to your [Google Account Security settings](https://myaccount.google.com/security)
2. Enable 2-Step Verification if not already enabled
3. Go to [App Passwords](https://myaccount.google.com/apppasswords)
4. Select "Mail" and your device
5. Generate and copy the 16-character password
6. Add this password to your `.env` file as `VITE_EMAIL_APP_PASSWORD`

## Usage

### User Settings

Users can configure their notification preferences in the Settings page:

1. Go to the Settings page
2. Under "Notifications" > "Contract Email Notifications"
3. Enable/disable expiry and renewal notifications
4. Set the days before expiry/renewal to receive alerts (e.g., "30, 14, 7, 3, 1")
5. Click "Save Notification Settings"

### Starting the Email Service

The email service can be started in two ways:

1. **Automatically on application start**: If environment variables are configured
2. **Manually from the Settings page**:
   - Enter the email address and app password
   - Set the check interval (in hours)
   - Click "Start Email Service"

## Technical Details

### Components

- **EmailService**: Frontend service that interfaces with the Supabase Edge Function
- **ContractNotificationService**: Checks for contracts nearing expiry/renewal
- **SchedulerService**: Runs checks at regular intervals
- **Supabase Edge Function**: Handles the actual email sending using SMTP

### Email Templates

The system sends HTML emails with the following information:

- Contract title and number
- Counterparty information
- Expiry/renewal date
- Days remaining
- Action required

### Logging

All email notifications are logged in the `email_notification_logs` table with:

- User ID
- Contract ID
- Notification type
- Days remaining
- Email content
- Send status

## Troubleshooting

### Common Issues

1. **Emails not sending**:
   - Check that `VITE_EMAIL_SERVICE_ENABLED` is set to `true`
   - Verify the email and app password are correct
   - Check if your Google account has any security restrictions
   - Check the browser console for errors from the Supabase function call

2. **Service not starting**:
   - Check browser console for errors
   - Verify the email service is properly initialized in the application

3. **Missing notifications**:
   - Verify contract end dates are properly set
   - Check user notification settings
   - Ensure the contract status is active (approved, signed, or executed)

4. **Supabase Function Errors**:
   - Check Supabase dashboard for function logs
   - Verify function deployment was successful
   - Ensure the function has proper permissions

## Support

For any issues or questions about the email notification system, please contact the development team. 