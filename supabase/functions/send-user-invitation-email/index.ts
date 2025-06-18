
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

    const emailResponse = await resend.emails.send({
      from: "JobApp <onboarding@resend.dev>",
      to: [to],
      subject: `Welcome to ${company_name} - Your JobApp Account`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">👋 Welcome!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">You've been invited to join ${company_name}</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333; margin: 0 0 20px 0;">Hello ${name}!</h2>
            
            <p>${invited_by} has invited you to join <strong>${company_name}</strong> on JobApp. Your account has been created and you can now access the company dashboard.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #495057;">Your Login Credentials</h3>
              <div style="margin-bottom: 10px;">
                <strong>Email:</strong> <span style="color: #007bff;">${to}</span>
              </div>
              <div style="margin-bottom: 10px;">
                <strong>Temporary Password:</strong> 
                <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-size: 16px; color: #dc3545;">
                  ${temporary_password}
                </code>
              </div>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>⚠️ Important:</strong> Please change your password after your first login for security.
              </p>
            </div>
            
            <div style="margin: 25px 0;">
              <h3 style="color: #333; margin: 0 0 15px 0;">Getting Started:</h3>
              <ol style="margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 10px;">Click the login button below</li>
                <li style="margin-bottom: 10px;">Use the email and temporary password provided</li>
                <li style="margin-bottom: 10px;">Update your password and profile information</li>
                <li style="margin-bottom: 10px;">Explore your company dashboard and team</li>
              </ol>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app') || 'https://your-app.lovable.app'}/login" 
                 style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Login to JobApp
              </a>
            </div>
            
            <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px; color: #6c757d; font-size: 14px;">
              <p>If you have any questions or need help getting started, please don't hesitate to reach out to your team admin or our support team.</p>
              <p>If you didn't expect this invitation, please contact us immediately.</p>
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
