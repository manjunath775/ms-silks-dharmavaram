import { createFileRoute, notFound } from "@tanstack/react-router";

const policies: Record<string, { title: string; body: string[] }> = {
  privacy: {
    title: "Privacy Policy",
    body: [
      "At MS Silks Dharmavaram, we respect your privacy and are committed to protecting your personal data. We collect only the information necessary to process your orders and improve your shopping experience.",
      "The information we collect includes your name, contact details, shipping address, and payment information. Payment details are handled securely through our payment partner Razorpay and are never stored on our servers.",
      "We never sell your personal data to third parties. Your information is used solely to fulfil orders, provide support, and — with your consent — send you updates about new collections and offers.",
      "You may request access to, correction of, or deletion of your personal data at any time by contacting care@mssilks.in.",
    ],
  },
  terms: {
    title: "Terms & Conditions",
    body: [
      "By accessing and using the MS Silks Dharmavaram website, you agree to comply with these terms and conditions.",
      "All product descriptions, prices, and availability are subject to change without notice. We make every effort to display colours accurately, though slight variations may occur due to screen settings.",
      "Orders are confirmed only upon successful payment. We reserve the right to cancel any order in case of pricing errors or stock unavailability, with a full refund issued.",
      "All content on this website, including images and text, is the property of MS Silks Dharmavaram and may not be reproduced without permission.",
    ],
  },
  shipping: {
    title: "Shipping Policy",
    body: [
      "We ship across India via trusted courier partners. Orders are typically dispatched within 1–2 business days of confirmation.",
      "Standard delivery takes 3–6 business days. Express delivery (1–2 business days) is available at an additional charge at checkout.",
      "Free shipping is offered on all orders above ₹2,999. A flat shipping fee of ₹99 applies to orders below this amount.",
      "Once shipped, you will receive a tracking link via email and SMS. You can also track your order from your account dashboard.",
    ],
  },
  returns: {
    title: "Return Policy",
    body: [
      "We accept returns within 7 days of delivery. To be eligible, the saree must be unused, unwashed, and returned with all original tags and packaging intact.",
      "To initiate a return, contact us at care@mssilks.in or via WhatsApp with your order number. Our team will arrange a pickup where available.",
      "Certain items such as customised or blouse-stitched sarees are not eligible for return unless defective.",
      "Once the returned item passes quality inspection, your refund or exchange will be processed promptly.",
    ],
  },
  refund: {
    title: "Refund Policy",
    body: [
      "Refunds are processed within 5–7 business days after the returned item is received and inspected.",
      "Refunds are issued to the original payment method. For Cash on Delivery orders, refunds are made via bank transfer or UPI.",
      "Shipping charges are non-refundable unless the return is due to a defective or incorrect product.",
      "For any refund-related queries, please reach out to care@mssilks.in.",
    ],
  },
};

export const Route = createFileRoute("/policies/$slug")({
  loader: ({ params }) => {
    const policy = policies[params.slug];
    if (!policy) throw notFound();
    return { policy };
  },
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData
          ? `${loaderData.policy.title} — MS Silks Dharmavaram`
          : "Policy — MS Silks",
      },
      ...(loaderData ? [] : [{ name: "robots", content: "noindex" }]),
    ],
  }),
  component: Policy,
  errorComponent: () => (
    <div className="container-luxe py-24 text-center text-muted-foreground">
      This policy could not be loaded.
    </div>
  ),
  notFoundComponent: () => (
    <div className="container-luxe py-24 text-center">
      <h1 className="font-display text-3xl font-semibold">Policy not found</h1>
    </div>
  ),
});

function Policy() {
  const { policy } = Route.useLoaderData();
  return (
    <div className="container-luxe max-w-3xl py-14">
      <p className="text-xs uppercase tracking-[0.3em] text-gold">Legal</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">{policy.title}</h1>
      <div className="mt-8 space-y-5">
        {policy.body.map((p: string, i: number) => (
          <p key={i} className="leading-relaxed text-muted-foreground">
            {p}
          </p>
        ))}
      </div>
      <p className="mt-10 text-sm text-muted-foreground">
        Last updated: July 2026. Questions? Email care@mssilks.in.
      </p>
    </div>
  );
}
