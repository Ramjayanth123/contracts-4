// Follow this setup guide to integrate the Deno runtime and Supabase Functions:
// https://supabase.com/docs/guides/functions/deno-runtime

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts';

interface EmailRequest {
  from: string;
  to: string;
  subject: string;
  html: string;
  config: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    }
  }
}

Deno.serve(async (req) => {
  // Check if request method is POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Get the request body
    const emailRequest = await req.json() as EmailRequest;
    
    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );
    
    // Get the user from the request
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    // Check if user is authenticated
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create SMTP client
    const client = new SmtpClient();
    
    // Connect to SMTP server
    await client.connectTLS({
      hostname: emailRequest.config.host,
      port: emailRequest.config.port,
      username: emailRequest.config.auth.user,
      password: emailRequest.config.auth.pass,
    });
    
    // Send email
    await client.send({
      from: emailRequest.from,
      to: emailRequest.to,
      subject: emailRequest.subject,
      content: emailRequest.html,
      html: emailRequest.html,
    });
    
    // Close connection
    await client.close();
    
    // Log the email in the database
    const { error: logError } = await supabaseClient
      .from('email_notification_logs')
      .insert({
        user_id: user.id,
        email_to: emailRequest.to,
        email_subject: emailRequest.subject,
        email_body: emailRequest.html,
        status: 'sent',
        notification_type: 'api_call',
      });
      
    if (logError) {
      console.error('Error logging email:', logError);
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Return error response
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}); 