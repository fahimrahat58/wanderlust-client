import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AddDestinationClient from "./AddDestinationClient";

export default async function AdminPage() {
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
  return <AddDestinationClient />;
}
