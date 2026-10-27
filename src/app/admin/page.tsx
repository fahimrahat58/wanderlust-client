import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AdminInfoClient from "./AdminInfoClient";

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
    <Suspense fallback={<div className="p-6">Loading admin dashboard...</div>}>
      <AdminContent />
    </Suspense>
  );
}
