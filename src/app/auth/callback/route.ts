import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Provider returned an error (e.g. user cancelled OAuth)
  if (errorParam) {
    console.error("[auth-callback]", errorParam, errorDescription);
    return NextResponse.redirect(
      `${origin}/login?error=auth_provider&message=${encodeURIComponent(errorDescription || errorParam)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[auth-callback] exchange error:", error.message);
    return NextResponse.redirect(
      `${origin}/login?error=auth_failed&message=${encodeURIComponent(error.message)}`
    );
  }

  if (data.user) {
    // Link auth_id to the users table if not yet linked
    const { data: existingUser } = await supabase
      .from("users")
      .select("id, auth_id")
      .eq("email", data.user.email!)
      .maybeSingle();

    if (existingUser && !existingUser.auth_id) {
      await supabase
        .from("users")
        .update({ auth_id: data.user.id })
        .eq("id", existingUser.id);
    }
  }

  return NextResponse.redirect(origin);
}
