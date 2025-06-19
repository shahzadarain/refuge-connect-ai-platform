
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CompanyApprovalEmailRequest {
  to: string;
  company_name: string;
  verification_code: string;
  expires_in_days: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, company_name, verification_code, expires_in_days }: CompanyApprovalEmailRequest = await req.json();

    console.log('Sending company approval email to:', to, 'for company:', company_name);

    // Construct the proper setup URL with all required parameters using SITE_URL
    const baseUrl = Deno.env.get('SITE_URL') || 'https://refuge-connect-ai-platform.lovable.app';
    const setupUrl = `${baseUrl}/company-setup?email=${encodeURIComponent(to)}&code=${encodeURIComponent(verification_code)}&action=setup`;

    const emailResponse = await resend.emails.send({
      from: "JobApp <onboarding@resend.dev>",
      to: [to],
      subject: `${company_name} - Company Approved! Setup Your Admin Account`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations!</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Your company has been approved</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px;">
            <h2 style="color: #333; margin: 0 0 20px 0;">Welcome to JobApp, ${company_name}!</h2>
            
            <p>Great news! Your company registration has been approved and you can now set up your admin account.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <h3 style="margin: 0 0 10px 0; color: #495057;">Your Verification Code</h3>
              <div style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 3px; font-family: monospace;">
                ${verification_code}
              </div>
              <p style="margin: 10px 0 0 0; color: #6c757d; font-size: 14px;">
                Valid for ${expires_in_days} days
              </p>
            </div>
            
            <div style="margin: 25px 0;">
              <h3 style="color: #333; margin: 0 0 15px 0;">Next Steps:</h3>
              <ol style="margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 10px;">Click the setup button below</li>
                <li style="margin-bottom: 10px;">Your email and verification code will be pre-filled</li>
                <li style="margin-bottom: 10px;">Choose a secure password for your admin account</li>
                <li style="margin-bottom: 10px;">Start managing your company profile and team</li>
              </ol>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${setupUrl}" 
                 style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Setup Admin Account
              </a>
            </div>
            
            <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px; color: #6c757d; font-size: 14px;">
              <p><strong>Important:</strong> This verification code will expire in ${expires_in_days} days. If you don't complete the setup process within this time, you'll need to contact support.</p>
              <p>If you didn't request this or have any questions, please contact our support team.</p>
              <p style="margin-top: 15px;"><strong>Direct link:</strong> <a href="${setupUrl}" style="color: #007bff; word-break: break-all;">${setupUrl}</a></p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Company approval email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-company-approval-email function:", error);
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
