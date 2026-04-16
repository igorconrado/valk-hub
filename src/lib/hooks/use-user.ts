"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type UserData = {
  id: string;
  auth_id: string;
  email: string;
  name: string;
  role: "admin" | "operator" | "stakeholder";
  company_role: string | null;
  avatar_url: string | null;
};

export function useUser() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function fetchUser() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        setIsLoading(false);
        return;
      }

      const { data, error: dbError } = await supabase
        .from("users")
        .select("id, auth_id, email, name, role, company_role, avatar_url")
        .eq("auth_id", authUser.id)
        .maybeSingle();

      if (dbError) {
        setError(dbError.message);
      } else {
        setUser(data);
      }

      setIsLoading(false);
    }

    fetchUser();
  }, []);

  return { user, isLoading, error };
}
