
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

    console.log('Backend API response status:', response.status);
    console.log('Backend API response headers:', Object.fromEntries(response.headers.entries()));
    
    // Get response text first to handle both JSON and non-JSON responses
    const responseText = await response.text();
    console.log('Backend API response body (text):', responseText);
    
    if (response.ok) {
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('Password reset successful via backend API:', result);
      } catch (parseError) {
        console.log('Response is not JSON, treating as success message');
        result = { message: responseText || "Password reset successful" };
      }
      
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
      console.error('Backend API error status:', response.status);
      console.error('Backend API error body:', responseText);
      
      let errorMessage = "Failed to reset password";
      
      // Try to parse as JSON for structured error
      try {
        const errorData = JSON.parse(responseText);
        if (response.status === 422 && errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // FastAPI validation errors
            const validationErrors = errorData.detail.map((err: any) => {
              const field = err.loc ? err.loc[err.loc.length - 1] : 'unknown';
              const message = err.msg || err.message || 'Validation error';
              return `${field}: ${message}`;
            }).join(', ');
            errorMessage = `Validation error: ${validationErrors}`;
          } else {
            errorMessage = errorData.detail;
          }
        } else {
          errorMessage = errorData.detail || errorData.message || errorData.error || errorMessage;
        }
      } catch (parseError) {
        // If not JSON, use the raw response text
        if (responseText.includes("Internal Server Error")) {
          errorMessage = "Server error occurred. Please try again later.";
        } else if (responseText.includes("502 Bad Gateway")) {
          errorMessage = "Service temporarily unavailable. Please try again later.";
        } else if (responseText.includes("404")) {
          errorMessage = "Reset service not found. Please contact support.";
        } else {
          errorMessage = responseText || errorMessage;
        }
      }
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: errorMessage
      }), {
        status: 200, // Return 200 to avoid function error, but indicate failure in body
        headers: {
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      });
    }
  } catch (error: any) {
    console.error("Error in reset-password function:", error);
    
    let errorMessage = "Failed to reset password";
    
    if (error.message) {
      if (error.message.includes("Failed to fetch")) {
        errorMessage = "Unable to connect to the reset service. Please check your connection and try again.";
      } else if (error.message.includes("NetworkError")) {
        errorMessage = "Network error occurred. Please try again later.";
      } else {
        errorMessage = error.message;
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage
      }),
      {
        status: 200, // Return 200 to avoid function error
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
