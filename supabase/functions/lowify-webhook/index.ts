import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    console.log("Lowify webhook received:", JSON.stringify(body));

    // Lowify sends different event formats - extract email from common patterns
    const email =
      body?.customer?.email ||
      body?.buyer?.email ||
      body?.email ||
      body?.data?.customer?.email ||
      body?.data?.buyer?.email ||
      body?.data?.email;

    const transactionId =
      body?.transaction_id ||
      body?.order_id ||
      body?.id ||
      body?.data?.transaction_id ||
      body?.data?.order_id;

    const status =
      body?.status ||
      body?.event ||
      body?.data?.status ||
      "approved";

    if (!email) {
      console.error("No email found in webhook payload");
      return new Response(
        JSON.stringify({ error: "Email not found in payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Normalize status to check if it's an approved purchase
    const normalizedStatus = status.toLowerCase();
    const isApproved =
      normalizedStatus.includes("approved") ||
      normalizedStatus.includes("paid") ||
      normalizedStatus.includes("completed") ||
      normalizedStatus.includes("purchase_approved") ||
      normalizedStatus.includes("confirmed");

    if (isApproved) {
      const { error } = await supabase
        .from("approved_purchases")
        .upsert(
          {
            email: email.toLowerCase().trim(),
            status: "approved",
            lowify_transaction_id: transactionId?.toString() || null,
          },
          { onConflict: "email" }
        );

      if (error) {
        console.error("Error inserting approved purchase:", error);
        return new Response(
          JSON.stringify({ error: "Failed to save purchase" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Purchase approved for email: ${email}`);
    } else {
      console.log(`Event status "${status}" is not an approval, skipping.`);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
