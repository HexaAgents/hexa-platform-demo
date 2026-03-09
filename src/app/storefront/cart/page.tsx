"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  Trash2,
  ArrowLeft,
  Loader2,
  Package,
  Truck,
  ShieldCheck,
  Minus,
  Plus,
} from "lucide-react";
import StorefrontHeader from "@/components/storefront/StorefrontHeader";
import {
  loadCart,
  clearCart,
  saveCart,
  cartItemsToLineItems,
  type CartItem,
} from "@/lib/cart-utils";

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setLoaded(true);
  }, []);

  const subtotal = items.reduce(
    (sum, i) => sum + i.catalogPrice * i.quantity,
    0
  );
  const shipping = subtotal >= 99 ? 0 : 12.99;
  const total = subtotal + shipping;

  function updateQty(sku: string, delta: number) {
    setItems((prev) => {
      const next = prev
        .map((i) =>
          i.catalogSku === sku
            ? { ...i, quantity: Math.max(0, i.quantity + delta) }
            : i
        )
        .filter((i) => i.quantity > 0);
      saveCart(next);
      return next;
    });
  }

  function removeItem(sku: string) {
    setItems((prev) => {
      const next = prev.filter((i) => i.catalogSku !== sku);
      saveCart(next);
      return next;
    });
  }

  async function handlePlaceOrder() {
    if (items.length === 0) return;
    setPlacing(true);

    const lineItems = cartItemsToLineItems(items);

    const body = {
      emailSubject: "Storefront Order — Apex Industrial Supply",
      senderName: "Apex Storefront",
      senderEmail: "orders@apexindustrial.com",
      customer: {
        id: `cust-sf-${Date.now()}`,
        name: "Apex Web Customer",
        email: "buyer@company.com",
        phone: "555-0199",
        company: "Apex Storefront Order",
        billingAddress: "1200 Commerce Pkwy, Houston, TX 77001",
        shippingAddress: "1200 Commerce Pkwy, Houston, TX 77001",
      },
      lineItems,
      attachments: [],
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to create order");

      const order = await res.json();
      clearCart();
      window.location.href = `/orders/${order.id}`;
    } catch {
      setPlacing(false);
      alert("Failed to place order. Please try again.");
    }
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#003366]" />
      </div>
    );
  }

  return (
    <>
      <StorefrontHeader />

      <div className="bg-[#F8F9FA] min-h-[calc(100vh-72px)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back link */}
          <a
            href="/storefront"
            className="inline-flex items-center gap-1.5 text-sm text-[#003366] hover:text-[#E63312] font-medium mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </a>

          <div className="flex items-center gap-3 mb-8">
            <ShoppingCart className="w-7 h-7 text-[#003366]" />
            <h1 className="text-2xl font-bold text-[#212529]">
              Your Cart
              {items.length > 0 && (
                <span className="text-[#6C757D] font-normal text-lg ml-2">
                  ({items.length}{" "}
                  {items.length === 1 ? "item" : "items"})
                </span>
              )}
            </h1>
          </div>

          {items.length === 0 ? (
            <div className="bg-white rounded-lg border border-[#E9ECEF] p-12 text-center">
              <Package className="w-16 h-16 text-[#CED4DA] mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-[#212529] mb-2">
                Your cart is empty
              </h2>
              <p className="text-sm text-[#6C757D] mb-6">
                Upload an order or browse products to get started.
              </p>
              <a
                href="/storefront"
                className="inline-flex items-center gap-2 bg-[#E63312] hover:bg-[#CC2200] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
              >
                Browse Products
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Items list */}
              <div className="lg:col-span-2 space-y-3">
                {/* Table header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 text-xs font-semibold text-[#6C757D] uppercase tracking-wider">
                  <div className="col-span-5">Product</div>
                  <div className="col-span-2 text-right">Unit Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Total</div>
                  <div className="col-span-1" />
                </div>

                {items.map((item) => (
                  <div
                    key={item.catalogSku}
                    className="bg-white rounded-lg border border-[#E9ECEF] p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                  >
                    {/* Product info */}
                    <div className="md:col-span-5 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-lg bg-[#F1F3F5] flex items-center justify-center flex-shrink-0">
                        <Package className="w-6 h-6 text-[#ADB5BD]" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-[#212529] truncate">
                          {item.catalogName}
                        </p>
                        <p className="text-xs text-[#6C757D] font-mono mt-0.5">
                          SKU: {item.catalogSku}
                        </p>
                      </div>
                    </div>

                    {/* Unit price */}
                    <div className="md:col-span-2 text-right">
                      <span className="text-sm font-medium text-[#212529]">
                        ${item.catalogPrice.toFixed(2)}
                      </span>
                      <span className="text-xs text-[#6C757D] ml-1">
                        /{item.catalogUom}
                      </span>
                    </div>

                    {/* Quantity */}
                    <div className="md:col-span-2 flex items-center justify-center">
                      <div className="flex items-center border border-[#CED4DA] rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQty(item.catalogSku, -1)}
                          className="px-2.5 py-1.5 text-[#6C757D] hover:bg-[#F1F3F5] transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 py-1.5 text-sm font-semibold text-[#212529] min-w-[40px] text-center border-x border-[#CED4DA]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.catalogSku, 1)}
                          className="px-2.5 py-1.5 text-[#6C757D] hover:bg-[#F1F3F5] transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Line total */}
                    <div className="md:col-span-2 text-right">
                      <span className="text-sm font-bold text-[#212529]">
                        $
                        {(item.catalogPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    {/* Remove */}
                    <div className="md:col-span-1 flex justify-end">
                      <button
                        onClick={() => removeItem(item.catalogSku)}
                        className="text-[#ADB5BD] hover:text-[#E63312] transition-colors cursor-pointer p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg border border-[#E9ECEF] p-6 sticky top-4">
                  <h2 className="font-bold text-[#212529] mb-5">
                    Order Summary
                  </h2>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-[#495057]">
                      <span>Subtotal</span>
                      <span className="font-medium">
                        ${subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[#495057]">
                      <span>Shipping</span>
                      <span
                        className={`font-medium ${shipping === 0 ? "text-[#28A745]" : ""}`}
                      >
                        {shipping === 0
                          ? "FREE"
                          : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    {shipping === 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-[#28A745]">
                        <Truck className="w-3.5 h-3.5" />
                        Free shipping on orders over $99
                      </div>
                    )}
                    <div className="border-t border-[#E9ECEF] pt-3 flex justify-between font-bold text-[#212529]">
                      <span>Total</span>
                      <span className="text-lg">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handlePlaceOrder}
                    disabled={placing}
                    className="w-full mt-6 bg-[#E63312] hover:bg-[#CC2200] disabled:bg-[#E9ECEF] disabled:text-[#ADB5BD] text-white font-semibold py-3 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    {placing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      "Place Order"
                    )}
                  </button>

                  <div className="mt-5 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs text-[#6C757D]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#28A745]" />
                      Secure checkout
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#6C757D]">
                      <Truck className="w-3.5 h-3.5 text-[#003366]" />
                      Same-day shipping on in-stock items
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
