import { NextResponse } from "next/server";
// import { createClient } from "@/lib/supabase/server";
// import { getStripe } from "@/lib/stripe/client";

// Activate when Stripe configured
// This webhook receives events from Stripe and syncs metrics
// to the metrics_snapshots table with source='stripe'.
//
// Required env vars:
//   STRIPE_SECRET_KEY — Stripe API key
//   STRIPE_WEBHOOK_SECRET — webhook signing secret
//
// Stripe webhook URL: https://<domain>/api/stripe/webhook
// Events to subscribe: invoice.paid, customer.subscription.created,
//   customer.subscription.updated, customer.subscription.deleted

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook not configured" },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  // Activate when Stripe configured:
  //
  // const stripe = getStripe();
  // if (!stripe) {
  //   return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
  // }
  //
  // let event: Stripe.Event;
  // try {
  //   event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  // } catch (err) {
  //   const message = err instanceof Error ? err.message : "Invalid signature";
  //   return NextResponse.json({ error: message }, { status: 400 });
  // }
  //
  // const supabase = await createClient();
  //
  // switch (event.type) {
  //   case "invoice.paid": {
  //     // Extract MRR from invoice
  //     // const invoice = event.data.object as Stripe.Invoice;
  //     // const productId = invoice.lines.data[0]?.price?.product as string;
  //     //
  //     // Find project by stripe_product_id
  //     // const { data: project } = await supabase
  //     //   .from("projects")
  //     //   .select("id")
  //     //   .eq("stripe_product_id", productId)
  //     //   .maybeSingle();
  //     //
  //     // if (project) {
  //     //   const today = new Date().toISOString().split("T")[0];
  //     //   await supabase.from("metrics_snapshots").upsert({
  //     //     project_id: project.id,
  //     //     date: today,
  //     //     data_json: {
  //     //       mrr: (invoice.amount_paid ?? 0) / 100,
  //     //     },
  //     //     source: "stripe",
  //     //   }, { onConflict: "project_id,date" });
  //     // }
  //     break;
  //   }
  //
  //   case "customer.subscription.created":
  //   case "customer.subscription.updated": {
  //     // Update paying_customers count
  //     // const subscription = event.data.object as Stripe.Subscription;
  //     // const productId = subscription.items.data[0]?.price?.product as string;
  //     //
  //     // const { data: project } = await supabase
  //     //   .from("projects")
  //     //   .select("id")
  //     //   .eq("stripe_product_id", productId)
  //     //   .maybeSingle();
  //     //
  //     // if (project) {
  //     //   // Count active subscriptions for this product via Stripe API
  //     //   // const subs = await stripe.subscriptions.list({
  //     //   //   status: "active",
  //     //   //   price: subscription.items.data[0]?.price?.id,
  //     //   //   limit: 1,
  //     //   // });
  //     //   //
  //     //   // const today = new Date().toISOString().split("T")[0];
  //     //   // await supabase.from("metrics_snapshots").upsert({
  //     //   //   project_id: project.id,
  //     //   //   date: today,
  //     //   //   data_json: { paying_customers: subs.data.length },
  //     //   //   source: "stripe",
  //     //   // }, { onConflict: "project_id,date" });
  //     // }
  //     break;
  //   }
  //
  //   case "customer.subscription.deleted": {
  //     // Subscription cancelled — update metrics
  //     // Same pattern as above, re-count active subscriptions
  //     break;
  //   }
  // }

  return NextResponse.json({ received: true });
}
