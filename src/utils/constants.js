export const ADMIN_EMAIL = "admin@admin.com";
export const ADMIN_PASSWORD = "admin123";

export const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export const PAYMENT_METHODS = [
  "CREDIT_CARD",
  "PAYPAL",
  "MOBILE_MONEY",
  "CASH_ON_DELIVERY",
];

export const SHIPPING_METHODS = [
  {
    value: "STANDARD",
    label: "Standard delivery",
    description: "3-5 business days",
    requiresPostalCode: true,
  },
  {
    value: "EXPRESS",
    label: "Express delivery",
    description: "1-2 business days",
    requiresPostalCode: true,
  },
  {
    value: "LOCAL_PICKUP",
    label: "Local pickup",
    description: "Collect from our Kigali hub",
    requiresPostalCode: false,
  },
];
