import { Customer } from "@/lib/types";
import { Building2, Mail, Phone, MapPin, Truck } from "lucide-react";

export function CustomerCard({ customer }: { customer: Customer }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div className="flex items-start gap-3">
        <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-[13px] font-medium text-foreground/85">
            {customer.name}
          </p>
          <p className="text-[12px] text-muted-foreground">
            {customer.company}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-[13px] text-foreground/80">{customer.email}</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-[13px] text-foreground/80">
            {customer.phone || "Not provided"}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Billing Address
          </p>
          <p className="text-[13px] text-foreground/80">
            {customer.billingAddress}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Truck className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Shipping Address
          </p>
          <p className="text-[13px] text-foreground/80">
            {customer.shippingAddress}
          </p>
        </div>
      </div>
    </div>
  );
}
