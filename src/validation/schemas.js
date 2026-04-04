import { z } from "zod";
import { PAYMENT_METHODS, SHIPPING_METHODS } from "../utils/constants";

const requiredTrimmedString = (label) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .refine((value) => value.trim().length > 0, `${label} cannot be empty spaces`);

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  fullName: requiredTrimmedString("Full name"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const productSchema = z.object({
  title: requiredTrimmedString("Title"),
  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters")
    .refine((value) => value.trim().length > 0, "Description cannot be empty spaces"),
  brand: requiredTrimmedString("Brand"),
  categoryId: z.string().trim().min(1, "Category is required"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  stockQuantity: z.coerce
    .number()
    .int("Stock quantity must be a whole number")
    .min(0, "Stock quantity cannot be negative"),
  images: z
    .array(z.string().trim().url("Image must be a valid URL"))
    .min(1, "At least one product image is required"),
});

export const categorySchema = z.object({
  name: requiredTrimmedString("Category name"),
});

export const checkoutSchema = z
  .object({
    fullName: requiredTrimmedString("Full name"),
    email: z.string().trim().email("Enter a valid email address"),
    shippingAddress: requiredTrimmedString("Shipping address"),
    city: requiredTrimmedString("City"),
    postalCode: z.string().trim().optional(),
    phoneNumber: z
      .string()
      .regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
    shippingMethod: z.enum(SHIPPING_METHODS.map((method) => method.value)),
    paymentMethod: z.enum(PAYMENT_METHODS),
    notes: z.string().trim().optional(),
  })
  .superRefine((values, ctx) => {
    const method = SHIPPING_METHODS.find(
      (item) => item.value === values.shippingMethod
    );

    if (method?.requiresPostalCode && !values.postalCode?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["postalCode"],
        message: "Postal code is required for this shipping method",
      });
    }
  });
