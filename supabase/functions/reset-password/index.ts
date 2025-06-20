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

    // Validate inputs
    if (!email || !token || !new_password) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Missing required fields" 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Validate token format (should be 6 digits)
    if (!/^\d{6}$/.test(token)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Invalid verification code format. Please enter the 6-digit code from your email." 
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

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
        verification_code: token, // This is correct!
        new_password: new_password
      })
    });

    console.log('Backend API response status:', response.status);
    
    // Get response text first to handle both JSON and non-JSON responses
    const responseText = await response.text();
    console.log('Backend API response body:', responseText);
    
    if (response.ok) {
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        result = { message: responseText || "Password reset successful" };
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: result.message || "Password reset successful",
        user_type: result.user_type // Include user type for routing
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } else {
      console.error('Backend API error:', response.status, responseText);
      
      let errorMessage = "Failed to reset password";
      
      try {
        const errorData = JSON.parse(responseText);
        
        // Handle specific error cases
        if (response.status === 400) {
          if (errorData.detail?.includes("Invalid reset code")) {
            errorMessage = "Invalid or expired verification code. Please check and try again.";
          } else if (errorData.detail?.includes("expired")) {
            errorMessage = "Verification code has expired. Please request a new one.";
          } else if (errorData.detail?.includes("already been used")) {
            errorMessage = "This verification code has already been used.";
          } else {
            errorMessage = errorData.detail || errorMessage;
          }
        } else if (response.status === 403) {
          errorMessage = errorData.detail || "Account is deactivated. Please contact support.";
        } else if (response.status === 404) {
          errorMessage = "User not found. Please check your email address.";
        } else if (response.status === 422) {
          // Validation errors
          if (Array.isArray(errorData.detail)) {
            const validationErrors = errorData.detail.map((err: any) => {
              const field = err.loc ? err.loc[err.loc.length - 1] : 'unknown';
              const message = err.msg || 'Validation error';
              return `${field}: ${message}`;
            }).join(', ');
            errorMessage = validationErrors;
          } else {
            errorMessage = errorData.detail;
          }
        } else {
          errorMessage = errorData.detail || errorData.message || errorMessage;
        }
      } catch (parseError) {
        // Handle non-JSON responses
        if (response.status === 500) {
          errorMessage = "Server error occurred. Please try again later.";
        } else if (response.status === 502 || response.status === 503) {
          errorMessage = "Service temporarily unavailable. Please try again later.";
        }
      }
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: errorMessage
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  } catch (error: any) {
    console.error("Error in reset-password function:", error);
    
    let errorMessage = "Failed to reset password";
    
    if (error.message?.includes("Failed to fetch")) {
      errorMessage = "Unable to connect to the server. Please try again later.";
    } else if (error.message?.includes("NetworkError")) {
      errorMessage = "Network error occurred. Please check your connection.";
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);