"use client";

import { useUser } from "./use-user";

export function useRole() {
  const { user, isLoading } = useUser();
  const role = user?.role ?? null;

  return {
    role,
    isAdmin: role === "admin",
    isOperator: role === "operator",
    isStakeholder: role === "stakeholder",
    isLoading,
  };
}
