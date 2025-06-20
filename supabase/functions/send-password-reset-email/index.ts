
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  reset_url: string;
}

// Generate a secure random token
function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, reset_url }: PasswordResetRequest = await req.json();

    console.log('Sending password reset email to:', email);

    // Generate a secure token
    const secureToken = generateSecureToken();
    
    // Replace the placeholder with the actual secure token
    const actualResetUrl = reset_url.replace('SECURE_TOKEN_HERE', secureToken);

    console.log('Generated secure reset URL:', actualResetUrl);

    const emailResponse = await resend.emails.send({
      from: "WorkConnect <onboarding@resend.dev>",
      to: [email],
      subject: "Reset Your Password - WorkConnect",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Reset Your Password</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #0066cc; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background-color: #0066cc; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 20px 0;
            }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reset Your Password</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>You requested to reset your password for your WorkConnect account.</p>
              <p>Click the button below to reset your password. This link will expire in 3 hours.</p>
              
              <div style="text-align: center;">
                <a href="${actualResetUrl}" class="button">Reset Password</a>
              </div>
              
              <p>If you can't click the button, copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background-color: #eee; padding: 10px; border-radius: 3px;">
                ${actualResetUrl}
              </p>
              
              <p><strong>If you didn't request this password reset, you can safely ignore this email.</strong></p>
            </div>
            <div class="footer">
              <p>This email was sent by WorkConnect</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Password reset email sent successfully",
      email_id: emailResponse.data?.id,
      token: secureToken // Return token for reference (in production, store this in database)
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-password-reset-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send password reset email" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
