#!/bin/bash

# Deploy the send-email function
echo "Deploying send-email function..."
supabase functions deploy send-email --no-verify-jwt

echo "Function deployed successfully!" 