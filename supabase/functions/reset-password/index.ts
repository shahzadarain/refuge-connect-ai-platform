
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  token: string;
  new_password: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, token, new_password }: PasswordResetRequest = await req.json();

    console.log('Processing password reset for email:', email);
    console.log('Token received:', token);
    console.log('Password length:', new_password?.length);

    // Call your backend API to reset the password
    const response = await fetch('https://ab93e9536acd.ngrok.app/api/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        email: email,
        verification_code: token,
        new_password: new_password
      })
    });

    const result = await response.json();
    
    console.log('Backend API response status:', response.status);
    console.log('Backend API response body:', result);
    
    if (response.ok) {
      console.log('Password reset successful via backend API:', result);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: result.message || "Password reset successful" 
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    } else {
      console.error('Backend API error:', result);
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: result.detail || result.message || result.error || "Failed to reset password" 
      }), {
        status: response.status,
        headers: {
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      });
    }
  } catch (error: any) {
    console.error("Error in reset-password function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to reset password" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
