import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminInfoClient from "./AddDestinationClient";

export const instant = false;

async function AdminContent() {
  const requestHeaders = await headers();

  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const userEmail = session.user.email?.trim().toLowerCase();

  if (!adminEmail || userEmail !== adminEmail) {
    redirect("/destinations");
  }

  return <AdminInfoClient />;
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-sm text-gray-500">Loading admin dashboard...</p>
        </div>
      }
    >
      <AdminContent />
    </Suspense>
  );
}
