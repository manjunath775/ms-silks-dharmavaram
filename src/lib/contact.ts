export const PHONE_DISPLAY = "+91 90599 88913";
export const PHONE_E164 = "919059988913";
export const STORE_ADDRESS =
  "11/282, Near Ramalayam Temple, Thogata Street, Dharmavaram, Andhra Pradesh 515671";
export const INSTAGRAM_URL = "https://www.instagram.com/ms_silks.dharmavaram";
export const INSTAGRAM_HANDLE = "@ms_silks.dharmavaram";
export const BUSINESS_NAME = "MS Silks Dharmavaram";

/** Normalise any stored phone value to wa.me digits (country code + number). */
export function waDigits(phone?: string | null) {
  const digits = (phone ?? "").replace(/\D/g, "");
  if (!digits) return PHONE_E164;
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

/** Build a WhatsApp click-to-chat link that works on Android, iOS, desktop and WhatsApp Web. */
export function buildWaUrl(text: string, phone?: string | null) {
  return `https://wa.me/${waDigits(phone)}?text=${encodeURIComponent(text)}`;
}

export function whatsappUrl(message?: string, phone?: string | null) {
  const text = [
    message ?? "Hello MS Silks Dharmavaram, I'd like to place an order.",
    "",
    "— Delivery & contact context —",
    `Store: MS Silks Dharmavaram, ${STORE_ADDRESS}`,
    `Phone: ${PHONE_DISPLAY}`,
    "My delivery address: ",
    "My name & phone: ",
  ].join("\n");
  return buildWaUrl(text, phone);
}

/** Pre-filled "Place Order" message with the real product details. */
export function orderMessage(p: { name: string; price: number; code: string }) {
  const price = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(p.price);
  return [
    "Hello MS Silks 👋",
    "",
    "I am interested in this saree:",
    "",
    `Saree Name: ${p.name}`,
    `Price: ${price}`,
    `Product ID: ${p.code}`,
    "",
    "I would like to place an order. Please share the payment details.",
  ].join("\n");
}

export function orderUrl(p: { name: string; price: number; code: string }, phone?: string | null) {
  return buildWaUrl(orderMessage(p), phone);
}

export const WHATSAPP_URL = whatsappUrl();
