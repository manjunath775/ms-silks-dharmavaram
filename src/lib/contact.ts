export const PHONE_DISPLAY = "+91 90599 88913";
export const PHONE_E164 = "919059988913";
export const STORE_ADDRESS =
  "11/282, Near Ramalayam Temple, Thogata Street, Dharmavaram, Andhra Pradesh 515671";
export const INSTAGRAM_URL = "https://www.instagram.com/ms_silks.dharmavaram";

export function whatsappUrl(message?: string) {
  const text = [
    message ?? "Hello MS Silks Dharmavaram, I'd like to place an order.",
    "",
    "— Delivery & contact context —",
    `Store: MS Silks Dharmavaram, ${STORE_ADDRESS}`,
    `Phone: ${PHONE_DISPLAY}`,
    "My delivery address: ",
    "My name & phone: ",
  ].join("\n");
  return `https://wa.me/${PHONE_E164}?text=${encodeURIComponent(text)}`;
}

export const WHATSAPP_URL = whatsappUrl();
