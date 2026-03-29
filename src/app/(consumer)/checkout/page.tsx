import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { CheckoutClient } from "@/components/cart/CheckoutClient";

export default async function CheckoutPage() {
  const session = await getSession();
  if (!session || session.userType !== "consumer") {
    redirect("/auth/client/login");
  }

  return <CheckoutClient />;
}
