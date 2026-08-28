import { useQuery } from "@tanstack/react-query";
import { fetchSettings } from "./db";
import {
  BUSINESS_NAME,
  INSTAGRAM_URL,
  PHONE_DISPLAY,
  orderUrl,
  waDigits,
  whatsappUrl,
} from "./contact";

export const storeSettingsQuery = {
  queryKey: ["store-settings"] as const,
  queryFn: fetchSettings,
  staleTime: 5 * 60_000,
};

/**
 * Single source of truth for business contact details.
 * Values come from the store settings row; falls back to built-in defaults.
 */
export function useStoreSettings() {
  const { data } = useQuery(storeSettingsQuery);
  const phone = data?.whatsapp_number || data?.phone || PHONE_DISPLAY;
  return {
    settings: data ?? null,
    businessName: data?.store_name || BUSINESS_NAME,
    phone,
    phoneDigits: waDigits(phone),
    instagramUrl: data?.instagram_url || INSTAGRAM_URL,
    whatsappUrl: (message?: string) => whatsappUrl(message, phone),
    orderUrl: (p: { name: string; price: number; code: string }) => orderUrl(p, phone),
  };
}
