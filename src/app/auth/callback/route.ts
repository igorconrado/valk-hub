import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Link auth_id to the users table if not yet linked
      const { data: existingUser } = await supabase
        .from("users")
        .select("id, auth_id")
        .eq("email", data.user.email!)
        .single();

      if (existingUser && !existingUser.auth_id) {
        await supabase
          .from("users")
          .update({ auth_id: data.user.id })
          .eq("id", existingUser.id);
      }

      return NextResponse.redirect(origin);
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
