"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useSession } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api";

type AdminRouteGuardProps = {
  children: ReactNode;
};

export default function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isPending) return;

    let cancelled = false;

    async function verifyAdmin() {
      if (!session?.user) {
        router.replace("/sign-in");
        setIsChecking(false);
        return;
      }

      try {
        const response = await apiFetch("/users/me");

        if (!response.ok) {
          if (response.status === 401) {
            router.replace("/sign-in");
          } else {
            router.replace("/destinations");
          }

          return;
        }

        const result = await response.json();

        if (result.isAdmin !== true) {
          router.replace("/destinations");
          return;
        }

        if (!cancelled) {
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error("Admin verification failed:", error);

        if (!cancelled) {
          router.replace("/destinations");
        }
      } finally {
        if (!cancelled) {
          setIsChecking(false);
        }
      }
    }

    void verifyAdmin();

    return () => {
      cancelled = true;
    };
  }, [isPending, session?.user, router]);

  if (isPending || isChecking) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
