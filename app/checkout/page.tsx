import { CheckoutClient } from "./_components/checkout-client";

export const metadata = {
  title: "Checkout — Three Gems",
  description: "Complete your Three Gems plugin purchase securely.",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plugin?: string; plan?: string }>;
}) {
  const sp = await searchParams;
  return <CheckoutClient slug={sp.plugin ?? null} planId={sp.plan ?? null} />;
}
