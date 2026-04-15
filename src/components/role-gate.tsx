"use client";

import { useRole } from "@/lib/hooks/use-role";

type RoleGateProps = {
  allowed: ("admin" | "operator" | "stakeholder")[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function RoleGate({ allowed, children, fallback = null }: RoleGateProps) {
  const { role, isLoading } = useRole();

  if (isLoading) return null;
  if (!role || !allowed.includes(role)) return <>{fallback}</>;

  return <>{children}</>;
}
