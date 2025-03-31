
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is missing");
    }

    // Create a Supabase client with admin privileges
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the webhook payload
    const payload = await req.json();
    const { type, record } = payload;

    // Only process new user events
    if (type !== "INSERT" || !record || !record.id) {
      return new Response(JSON.stringify({ message: "Not a new user event" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Get the user's profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", record.id)
      .single();

    if (profileError) {
      throw new Error(`Error fetching profile: ${profileError.message}`);
    }

    // Generate a temporary password
    const tempPassword = generateRandomPassword();

    // Update the user with the temporary password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      record.id,
      { password: tempPassword }
    );

    if (updateError) {
      throw new Error(`Error updating user password: ${updateError.message}`);
    }

    // Send welcome email with temporary password
    const emailResponse = await sendWelcomeEmail(
      profile.email,
      profile.name,
      tempPassword,
      resendApiKey
    );

    return new Response(
      JSON.stringify({
        message: "Welcome email sent successfully",
        emailId: emailResponse.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

// Generate a random password
function generateRandomPassword() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Send welcome email using Resend
async function sendWelcomeEmail(email: string, name: string, password: string, apiKey: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Welcome to RelatiumX - Your Account Details",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h1 style="color: #333; margin-bottom: 20px;">Welcome to RelatiumX!</h1>
          <p>Hello ${name},</p>
          <p>Your account has been created successfully. Here are your login details:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> ${password}</p>
          </div>
          <p style="margin-top: 20px;">For security reasons, we recommend changing your password after your first login.</p>
          <p>Thank you for joining RelatiumX!</p>
          <p>Best regards,<br>The RelatiumX Team</p>
        </div>
      `,
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(`Failed to send email: ${JSON.stringify(data)}`);
  }
  
  return data;
}
