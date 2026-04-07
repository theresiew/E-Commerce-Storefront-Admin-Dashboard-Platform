import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CreditCard, MapPin, ShoppingCart } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../api/orders";
import { FormField } from "../components/FormField";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  eyebrowClass,
  primaryButtonClass,
  secondaryButtonClass,
  sectionClass,
} from "../lib/ui";
import { PAYMENT_METHODS, SHIPPING_METHODS } from "../utils/constants";
import { formatCurrency, getErrorMessage, titleCase } from "../utils/formatters";
import { checkoutSchema } from "../validation/schemas";

const steps = [
  { id: 0, title: "Shipping", icon: MapPin },
  { id: 1, title: "Payment", icon: CreditCard },
  { id: 2, title: "Review", icon: ShoppingCart },
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, totals, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart", { replace: true });
    }
  }, [items.length, navigate]);

  const form = useForm({
    resolver: zodResolver(checkoutSchema),
    mode: "onChange",
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
      shippingAddress: "",
      city: "",
      postalCode: "",
      phoneNumber: "",
      shippingMethod: "STANDARD",
      paymentMethod: "CREDIT_CARD",
      notes: "",
    },
  });

  const watchedValues = form.watch();

  const orderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: async () => {
      await clearCart();
      toast.success("Order placed successfully.");
      navigate("/profile");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to place your order."));
    },
  });

  const reviewDetails = useMemo(
    () => ({
      ...watchedValues,
      shippingMeta: SHIPPING_METHODS.find(
        (item) => item.value === watchedValues.shippingMethod,
      ),
    }),
    [watchedValues],
  );

  const validateStep = async () => {
    if (currentStep === 0) {
      return form.trigger([
        "fullName",
        "email",
        "shippingAddress",
        "city",
        "postalCode",
        "phoneNumber",
        "shippingMethod",
      ]);
    }

    if (currentStep === 1) {
      return form.trigger(["paymentMethod", "notes"]);
    }

    return true;
  };

  const nextStep = async () => {
    const isValid = await validateStep();

    if (isValid) {
      setCurrentStep((current) => Math.min(2, current + 1));
    }
  };

  const previousStep = () => {
    setCurrentStep((current) => Math.max(0, current - 1));
  };

  const submitOrder = form.handleSubmit((values) => {
    orderMutation.mutate({
      items,
      shippingAddress: {
        fullName: values.fullName,
        email: values.email,
        street: values.shippingAddress,
        city: values.city,
        postalCode: values.postalCode,
        phoneNumber: values.phoneNumber,
        shippingMethod: values.shippingMethod,
      },
      paymentMethod: values.paymentMethod,
      notes: values.notes,
      totalPrice: totals.grandTotal,
      status: "PENDING",
    });
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
      <section className={`${sectionClass} grid gap-6`}>
        <div>
          <span className={eyebrowClass}>Checkout</span>
          <h1 className="mt-3 text-4xl font-semibold text-ink-900">
            Complete your order in three guided steps.
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          {steps.map((step) => {
            const Icon = step.icon;
            const active = currentStep === step.id;
            const completed = currentStep > step.id;

            return (
              <div
                key={step.id}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-semibold ${
                  active
                    ? "border-mint-600/20 bg-mint-100 text-mint-600"
                    : completed
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-ink-900/10 bg-white/75 text-ink-500"
                }`}
              >
                <Icon size={16} />
                <strong>{step.title}</strong>
              </div>
            );
          })}
        </div>

        <form className="grid gap-4">
          {currentStep === 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Full Name" htmlFor="checkout-name" error={form.formState.errors.fullName?.message}>
                <input id="checkout-name" type="text" {...form.register("fullName")} />
              </FormField>
              <FormField label="Email" htmlFor="checkout-email" error={form.formState.errors.email?.message}>
                <input id="checkout-email" type="email" {...form.register("email")} />
              </FormField>
              <FormField
                label="Shipping Address"
                htmlFor="checkout-address"
                error={form.formState.errors.shippingAddress?.message}
              >
                <input id="checkout-address" type="text" {...form.register("shippingAddress")} />
              </FormField>
              <FormField label="City" htmlFor="checkout-city" error={form.formState.errors.city?.message}>
                <input id="checkout-city" type="text" {...form.register("city")} />
              </FormField>
              <FormField
                label="Postal Code"
                htmlFor="checkout-postal"
                hint="Required for standard and express shipping"
                error={form.formState.errors.postalCode?.message}
              >
                <input id="checkout-postal" type="text" {...form.register("postalCode")} />
              </FormField>
              <FormField
                label="Phone Number"
                htmlFor="checkout-phone"
                hint="Exactly 10 digits"
                error={form.formState.errors.phoneNumber?.message}
              >
                <input id="checkout-phone" type="text" {...form.register("phoneNumber")} />
              </FormField>
              <FormField
                label="Shipping Method"
                htmlFor="checkout-shipping-method"
                error={form.formState.errors.shippingMethod?.message}
              >
                <select id="checkout-shipping-method" {...form.register("shippingMethod")}>
                  {SHIPPING_METHODS.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label} - {method.description}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>
          ) : null}

          {currentStep === 1 ? (
            <div className="grid gap-4">
              <FormField
                label="Payment Method"
                htmlFor="checkout-payment-method"
                error={form.formState.errors.paymentMethod?.message}
              >
                <select id="checkout-payment-method" {...form.register("paymentMethod")}>
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {titleCase(method)}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Order Notes" htmlFor="checkout-notes" error={form.formState.errors.notes?.message}>
                <textarea id="checkout-notes" rows={5} {...form.register("notes")} />
              </FormField>
            </div>
          ) : null}

          {currentStep === 2 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[26px] border border-white/70 bg-white/75 p-5">
                <h3 className="text-xl font-semibold text-ink-900">Shipping information</h3>
                <div className="mt-3 grid gap-2 text-sm leading-7 text-ink-500">
                  <p>{reviewDetails.fullName}</p>
                  <p>{reviewDetails.email}</p>
                  <p>{reviewDetails.shippingAddress}</p>
                  <p>
                    {reviewDetails.city}
                    {reviewDetails.postalCode ? `, ${reviewDetails.postalCode}` : ""}
                  </p>
                  <p>{reviewDetails.phoneNumber}</p>
                  <p>{reviewDetails.shippingMeta?.label}</p>
                </div>
              </div>

              <div className="rounded-[26px] border border-white/70 bg-white/75 p-5">
                <h3 className="text-xl font-semibold text-ink-900">Payment and notes</h3>
                <div className="mt-3 grid gap-2 text-sm leading-7 text-ink-500">
                  <p>{titleCase(reviewDetails.paymentMethod)}</p>
                  <p>{reviewDetails.notes || "No extra notes provided."}</p>
                </div>
              </div>
            </div>
          ) : null}
        </form>

        <div className="flex flex-wrap gap-3">
          {currentStep > 0 ? (
            <button type="button" className={secondaryButtonClass} onClick={previousStep}>
              Back
            </button>
          ) : null}

          {currentStep < 2 ? (
            <button type="button" className={primaryButtonClass} onClick={nextStep}>
              Continue
            </button>
          ) : (
            <button
              type="button"
              className={primaryButtonClass}
              onClick={submitOrder}
              disabled={orderMutation.isPending}
            >
              {orderMutation.isPending ? "Placing order..." : "Place order"}
            </button>
          )}
        </div>
      </section>

      <aside className={`${sectionClass} grid h-fit gap-4`}>
        <span className={eyebrowClass}>Order review</span>
        <h2 className="text-3xl font-semibold text-ink-900">{items.length} products</h2>
        <div className="grid gap-3 text-sm text-ink-500">
          {items.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between gap-4">
              <span>
                {item.title} x {item.quantity}
              </span>
              <strong className="text-ink-900">
                {formatCurrency(item.price * item.quantity)}
              </strong>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4">
            <span>Subtotal</span>
            <strong className="text-ink-900">{formatCurrency(totals.subtotal)}</strong>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Shipping</span>
            <strong className="text-ink-900">
              {totals.shipping === 0 ? "Free" : formatCurrency(totals.shipping)}
            </strong>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Tax</span>
            <strong className="text-ink-900">{formatCurrency(totals.tax)}</strong>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-ink-900/10 pt-3">
            <span>Total</span>
            <strong className="text-lg text-ink-900">{formatCurrency(totals.grandTotal)}</strong>
          </div>
        </div>
        <p className="text-sm leading-7 text-ink-500">
          Orders over {formatCurrency(150)} receive free shipping automatically.
        </p>
      </aside>
    </div>
  );
}
