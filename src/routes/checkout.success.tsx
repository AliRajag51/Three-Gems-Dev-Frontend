/**
 * /checkout/success — Stripe redirects here after a successful payment.
 *
 * The Stripe webhook (`checkout.session.completed`) is what actually creates
 * our local Order + issues the License. That webhook is processed
 * asynchronously, so when the customer first lands here, the Order may not
 * exist yet — the backend's `GET /checkout/session/:id` responds 404 in that
 * window. We poll every 2 seconds for up to ~30 seconds, then give up and
 * point the user at /me/licenses where the licenses will eventually appear.
 *
 * Plaintext license keys are NOT shown here: they're delivered via the
 * purchase-confirmation email (see backend BillingService.handleCheckoutCompleted
 * → licensesService.tryEnqueuePurchaseConfirmation). The /me/licenses page only
 * ever shows the masked key prefix.
 */
import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, Mail, AlertCircle } from "lucide-react";
import { billingApi, type CheckoutSessionStatus } from "@/lib/api/billing";
import { ApiError } from "@/lib/api/client";
import { RequireAuth } from "@/components/require-auth";

type Search = { session_id?: string };

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 30_000;

export const Route = createFileRoute("/checkout/success")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    session_id: typeof s.session_id === "string" ? s.session_id : undefined,
  }),
  head: () => ({
    meta: [{ title: "Order received — Three Gems" }],
  }),
  component: CheckoutSuccessRoute,
});

function CheckoutSuccessRoute() {
  return (
    <RequireAuth>
      <CheckoutSuccessPage />
    </RequireAuth>
  );
}

function CheckoutSuccessPage() {
  const { session_id: sessionId } = Route.useSearch();

  if (!sessionId) {
    return (
      <Container>
        <AlertCircle className="w-10 h-10 text-primary mx-auto" />
        <h1 className="mt-4 font-display text-3xl font-bold">Order received</h1>
        <p className="mt-3 text-muted-foreground">
          We couldn't read the Stripe session id from the URL, but if your payment went through your
          license will appear on your dashboard shortly.
        </p>
        <div className="mt-8">
          <a
            href="/me/licenses"
            className="btn-ruby inline-block px-5 py-2.5 rounded-xl text-sm font-semibold"
          >
            View my licenses
          </a>
        </div>
      </Container>
    );
  }

  return <CheckoutSuccessPoller sessionId={sessionId} />;
}

function CheckoutSuccessPoller({ sessionId }: { sessionId: string }) {
  const startedAtRef = useRef<number>(Date.now());
  const [timedOut, setTimedOut] = useState(false);

  const query = useQuery<CheckoutSessionStatus | null>({
    queryKey: ["checkout", "session", sessionId],
    queryFn: async () => {
      try {
        return await billingApi.getCheckoutSession(sessionId);
      } catch (err) {
        // Until the Stripe webhook lands, the backend has no Order row and
        // returns 404. Treat that as "still processing" so we keep polling.
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
    refetchInterval: (q) => {
      if (timedOut) return false;
      const data = q.state.data;
      if (data && data.orderId) return false;
      return POLL_INTERVAL_MS;
    },
    refetchIntervalInBackground: false,
    retry: false,
  });

  useEffect(() => {
    if (timedOut) return;
    const elapsed = Date.now() - startedAtRef.current;
    const remaining = POLL_TIMEOUT_MS - elapsed;
    if (remaining <= 0) {
      setTimedOut(true);
      return;
    }
    const t = window.setTimeout(() => setTimedOut(true), remaining);
    return () => window.clearTimeout(t);
  }, [timedOut]);

  if (query.isError && !(query.error instanceof ApiError && query.error.status === 404)) {
    const message =
      query.error instanceof ApiError
        ? (query.error.problem.detail ?? query.error.message)
        : query.error instanceof Error
          ? query.error.message
          : "We couldn't load your order status.";
    return (
      <Container>
        <AlertCircle className="w-10 h-10 text-primary mx-auto" />
        <h1 className="mt-4 font-display text-3xl font-bold">Couldn't load order status</h1>
        <p className="mt-3 text-muted-foreground">{message}</p>
        <div className="mt-8">
          <a
            href="/me/licenses"
            className="btn-ruby inline-block px-5 py-2.5 rounded-xl text-sm font-semibold"
          >
            View my licenses
          </a>
        </div>
      </Container>
    );
  }

  const orderReady = !!query.data?.orderId;

  if (orderReady) {
    return (
      <Container>
        <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
        <h1 className="mt-4 font-display text-3xl font-bold">Thanks — your order is confirmed</h1>
        <p className="mt-3 text-muted-foreground">
          We've processed your payment and issued your license.
        </p>

        <div className="mt-8 card-surface p-6 text-left">
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Check your email for the license key</p>
              <p className="mt-1 text-sm text-muted-foreground">
                For security, we send your full license key by email — it's the only place it
                appears in plaintext. Keep that email safe; afterwards your dashboard only shows a
                masked preview.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="/me/licenses"
            className="btn-ruby inline-block px-5 py-2.5 rounded-xl text-sm font-semibold"
          >
            View my licenses
          </a>
          <Link
            to="/plugins"
            className="inline-block px-5 py-2.5 rounded-xl text-sm font-semibold border border-border hover:border-primary"
          >
            Continue shopping
          </Link>
        </div>
      </Container>
    );
  }

  if (timedOut) {
    return (
      <Container>
        <Loader2 className="w-10 h-10 text-primary mx-auto" />
        <h1 className="mt-4 font-display text-3xl font-bold">Still processing your order</h1>
        <p className="mt-3 text-muted-foreground">
          Payment confirmations usually take a few seconds — yours is taking a little longer. Your
          license will appear on the dashboard as soon as it's ready, and we'll email the key to
          you.
        </p>
        <div className="mt-8">
          <a
            href="/me/licenses"
            className="btn-ruby inline-block px-5 py-2.5 rounded-xl text-sm font-semibold"
          >
            Go to my licenses
          </a>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <Loader2 className="w-10 h-10 text-primary mx-auto animate-spin" />
      <h1 className="mt-4 font-display text-3xl font-bold">Finalising your order…</h1>
      <p className="mt-3 text-muted-foreground">
        We're waiting for Stripe to confirm your payment. This usually takes a couple of seconds —
        please don't close this tab.
      </p>
    </Container>
  );
}

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-2xl px-5 py-20 lg:py-24 text-center">{children}</div>;
}
