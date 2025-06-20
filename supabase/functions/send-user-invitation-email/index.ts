
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UserInvitationEmailRequest {
  to: string;
  name: string;
  temporary_password: string;
  company_id: string;
  company_name?: string;
  invited_by?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      to, 
      name, 
      temporary_password, 
      company_id, 
      company_name = "Your Company",
      invited_by = "Team Admin"
    }: UserInvitationEmailRequest = await req.json();

    console.log('Sending user invitation email to:', to, 'for company:', company_name);

    // Use the correct SITE_URL environment variable
    const baseUrl = Deno.env.get('SITE_URL') || 'https://refuge-connect-ai-platform.lovable.app';

    const emailResponse = await resend.emails.send({
      from: "JobApp <onboarding@resend.dev>",
      to: [to],
      subject: `Welcome to ${company_name} - Activate Your Account`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to ${company_name}!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your account has been created</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333; margin: 0 0 20px 0;">Hello ${name}!</h2>
            
            <p><strong>${invited_by}</strong> has created an account for you at <strong>${company_name}</strong>. To get started, you'll need to activate your account and set up your password.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #495057;">🔐 Temporary Login Credentials</h3>
              <div style="margin-bottom: 10px;">
                <strong>Email:</strong> <span style="color: #007bff;">${to}</span>
              </div>
              <div style="margin-bottom: 15px;">
                <strong>Temporary Password:</strong> 
                <code style="background: #e9ecef; padding: 6px 12px; border-radius: 4px; font-size: 16px; color: #dc3545; display: inline-block; margin-left: 10px;">
                  ${temporary_password}
                </code>
              </div>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>⚠️ Important Security Notice:</strong> This is a temporary password. For your security, please change it immediately after logging in.
              </p>
            </div>
            
            <div style="margin: 25px 0;">
              <h3 style="color: #333; margin: 0 0 15px 0;">📋 Account Activation Steps:</h3>
              <ol style="margin: 0; padding-left: 20px; color: #555;">
                <li style="margin-bottom: 8px;">Click the "Activate Account" button below</li>
                <li style="margin-bottom: 8px;">Log in using your email and the temporary password above</li>
                <li style="margin-bottom: 8px;">You'll be prompted to change your password - choose a strong, secure password</li>
                <li style="margin-bottom: 8px;">Complete your profile setup</li>
                <li style="margin-bottom: 8px;">Start exploring your company dashboard!</li>
              </ol>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/" 
                 style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);">
                🚀 Activate Your Account
              </a>
            </div>
            
            <div style="background: #e7f3ff; border: 1px solid #b3d9ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; color: #0c5aa6;">
                <strong>💡 Need Help?</strong> If you have any questions or encounter any issues during setup, don't hesitate to reach out to <strong>${invited_by}</strong> or our support team.
              </p>
            </div>
            
            <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px; color: #6c757d; font-size: 14px;">
              <p style="margin-bottom: 10px;"><strong>What you'll have access to:</strong></p>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Company dashboard and team directory</li>
                <li>Job posting and candidate management tools</li>
                <li>Communication and collaboration features</li>
                <li>Reporting and analytics</li>
              </ul>
              
              <p style="margin-top: 20px; font-size: 12px; color: #999;">
                If you didn't expect this invitation or believe this email was sent in error, please contact us immediately at your company's support channel.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("User invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-user-invitation-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
