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
import { PAYMENT_METHODS, SHIPPING_METHODS } from "../utils/constants";
import { formatCurrency, getErrorMessage } from "../utils/formatters";
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
        (item) => item.value === watchedValues.shippingMethod
      ),
    }),
    [watchedValues]
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
    <div className="checkout-layout">
      <section className="panel">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Checkout</span>
            <h1>Complete your order in three guided steps.</h1>
          </div>
        </div>

        <div className="stepper">
          {steps.map((step) => {
            const Icon = step.icon;
            const active = currentStep === step.id;
            const completed = currentStep > step.id;

            return (
              <div
                key={step.id}
                className={`stepper-item ${active ? "stepper-active" : ""} ${completed ? "stepper-completed" : ""}`}
              >
                <span>
                  <Icon size={16} />
                </span>
                <strong>{step.title}</strong>
              </div>
            );
          })}
        </div>

        <form className="form-grid">
          {currentStep === 0 ? (
            <div className="two-column-grid">
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
            <div className="form-grid">
              <FormField
                label="Payment Method"
                htmlFor="checkout-payment-method"
                error={form.formState.errors.paymentMethod?.message}
              >
                <select id="checkout-payment-method" {...form.register("paymentMethod")}>
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Order Notes" htmlFor="checkout-notes" error={form.formState.errors.notes?.message}>
                <textarea id="checkout-notes" rows="5" {...form.register("notes")} />
              </FormField>
            </div>
          ) : null}

          {currentStep === 2 ? (
            <div className="review-grid">
              <div className="panel review-card">
                <h3>Shipping information</h3>
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

              <div className="panel review-card">
                <h3>Payment and notes</h3>
                <p>{reviewDetails.paymentMethod?.replaceAll("_", " ")}</p>
                <p>{reviewDetails.notes || "No extra notes provided."}</p>
              </div>
            </div>
          ) : null}
        </form>

        <div className="button-row">
          {currentStep > 0 ? (
            <button type="button" className="ghost-button" onClick={previousStep}>
              Back
            </button>
          ) : null}

          {currentStep < 2 ? (
            <button type="button" className="primary-button" onClick={nextStep}>
              Continue
            </button>
          ) : (
            <button
              type="button"
              className="primary-button"
              onClick={submitOrder}
              disabled={orderMutation.isPending}
            >
              {orderMutation.isPending ? "Placing order..." : "Place order"}
            </button>
          )}
        </div>
      </section>

      <aside className="panel cart-summary">
        <span className="eyebrow">Order review</span>
        <h2>{items.length} products</h2>
        <div className="summary-list">
          {items.map((item) => (
            <div key={item.id}>
              <span>
                {item.title} x {item.quantity}
              </span>
              <strong>{formatCurrency(item.price * item.quantity)}</strong>
            </div>
          ))}
          <div>
            <span>Subtotal</span>
            <strong>{formatCurrency(totals.subtotal)}</strong>
          </div>
          <div>
            <span>Shipping</span>
            <strong>{totals.shipping === 0 ? "Free" : formatCurrency(totals.shipping)}</strong>
          </div>
          <div>
            <span>Tax</span>
            <strong>{formatCurrency(totals.tax)}</strong>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <strong>{formatCurrency(totals.grandTotal)}</strong>
          </div>
        </div>
        <p className="helper-note">
          Orders over {formatCurrency(150)} receive free shipping automatically.
        </p>
      </aside>
    </div>
  );
}
