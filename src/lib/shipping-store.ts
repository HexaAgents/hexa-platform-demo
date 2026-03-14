import { Redis } from "@upstash/redis";
import {
  Shipment,
  ShipmentEvent,
  ShipmentNotification,
  ShippingMetrics,
} from "@/lib/types";

const SHIPMENTS_KEY = "hexa:shipments";
const SHIPMENT_PREFIX = "hexa:shipment:";
const SHIPMENT_EVENT_PREFIX = "hexa:shipment:event:";
const SHIPMENT_EVENTS_KEY = "hexa:shipment:events";
const SHIPMENT_NOTIFICATION_PREFIX = "hexa:shipment:notification:";
const SHIPMENT_NOTIFICATIONS_KEY = "hexa:shipment:notifications";
const SHIPMENT_METRICS_KEY = "hexa:shipment:metrics";
const SHIPMENT_DEDUPE_PREFIX = "hexa:shipment:dedupe:";

const mockShipments: Shipment[] = [
  {
    id: "shp-proc-006",
    poId: "pur-006",
    orderNumber: "PUR-006",
    customerName: "Hexa Manufacturing Co.",
    customerEmail: "procurement@hexamfg.com",
    carrier: "ups",
    carrierService: "UPS Ground",
    status: "delivered",
    source: "carrier_api",
    trackingNumber: "1Z999AA10123456784",
    trackingUrl: "https://www.ups.com/track?tracknum=1Z999AA10123456784",
    estimatedDelivery: "2026-03-04",
    lastEventAt: "2026-03-04T14:10:00Z",
    createdAt: "2026-02-28T09:00:00Z",
    updatedAt: "2026-03-04T14:10:00Z",
    notificationStatus: "sent",
  },
  {
    id: "shp-proc-001",
    poId: "pur-002",
    orderNumber: "PUR-002",
    customerName: "Hexa Manufacturing Co.",
    customerEmail: "procurement@hexamfg.com",
    carrier: "fedex",
    carrierService: "FedEx Freight Priority",
    status: "in_transit",
    source: "carrier_api",
    trackingNumber: "920241085725456",
    trackingUrl: "https://www.fedex.com/fedextrack/?trknbr=920241085725456",
    estimatedDelivery: "2026-03-16",
    lastEventAt: "2026-03-12T06:40:00Z",
    createdAt: "2026-03-07T10:00:00Z",
    updatedAt: "2026-03-12T06:40:00Z",
    notificationStatus: "sent",
  },
  {
    id: "shp-mock-003",
    orderId: "ord-003",
    orderNumber: "ORD-2026-0045",
    customerName: "Marcus Rivera",
    customerEmail: "m.rivera@toplinehardware.com",
    carrier: "fedex",
    carrierService: "FedEx Economy",
    status: "in_transit",
    source: "carrier_api",
    trackingNumber: "794644790132",
    trackingUrl: "https://www.fedex.com/fedextrack/?trknbr=794644790132",
    estimatedDelivery: "2026-03-14",
    lastEventAt: "2026-03-11T08:20:00Z",
    createdAt: "2026-03-08T09:35:00Z",
    updatedAt: "2026-03-11T08:20:00Z",
    notificationStatus: "sent",
  },
  {
    id: "shp-mock-004",
    orderId: "ord-004",
    orderNumber: "ORD-2026-0044",
    customerName: "Lisa Park",
    customerEmail: "lpark@velocityauto.com",
    carrier: "dhl",
    carrierService: "DHL Express",
    status: "delivered",
    source: "carrier_api",
    trackingNumber: "1234567890",
    trackingUrl: "https://www.dhl.com/global-en/home/tracking.html?tracking-id=1234567890",
    estimatedDelivery: "2026-03-01",
    lastEventAt: "2026-03-01T14:22:00Z",
    createdAt: "2026-02-26T10:00:00Z",
    updatedAt: "2026-03-01T14:22:00Z",
    notificationStatus: "sent",
  },
];

const mockEvents: ShipmentEvent[] = [
  // shp-proc-006: Flap discs (pi-006), delivered — full lifecycle
  {
    id: "se-proc-006-1",
    shipmentId: "shp-proc-006",
    type: "shipment_created",
    status: "shipment_created",
    source: "carrier_api",
    occurredAt: "2026-02-28T09:00:00Z",
    idempotencyKey: "proc-006-created",
    message: "Shipment created — Precision Abrasives Co, Cleveland OH",
    trackingNumber: "1Z999AA10123456784",
  },
  {
    id: "se-proc-006-2",
    shipmentId: "shp-proc-006",
    type: "shipment_status_updated",
    status: "label_created",
    source: "carrier_api",
    occurredAt: "2026-02-28T09:30:00Z",
    idempotencyKey: "proc-006-label",
    message: "Shipping label generated — UPS Ground",
    trackingNumber: "1Z999AA10123456784",
  },
  {
    id: "se-proc-006-3",
    shipmentId: "shp-proc-006",
    type: "shipment_status_updated",
    status: "picked_up",
    source: "carrier_api",
    occurredAt: "2026-02-28T15:20:00Z",
    idempotencyKey: "proc-006-pickup",
    message: "Picked up by carrier from supplier facility",
  },
  {
    id: "se-proc-006-4",
    shipmentId: "shp-proc-006",
    type: "shipment_status_updated",
    status: "in_transit",
    source: "carrier_api",
    occurredAt: "2026-03-01T06:15:00Z",
    idempotencyKey: "proc-006-transit-1",
    message: "Departed origin facility — Cleveland, OH",
    estimatedDelivery: "2026-03-04",
  },
  {
    id: "se-proc-006-4b",
    shipmentId: "shp-proc-006",
    type: "shipment_status_updated",
    status: "in_transit",
    source: "carrier_api",
    occurredAt: "2026-03-02T03:40:00Z",
    idempotencyKey: "proc-006-transit-2",
    message: "Arrived at regional distribution center — Chicago, IL",
  },
  {
    id: "se-proc-006-4c",
    shipmentId: "shp-proc-006",
    type: "shipment_status_updated",
    status: "in_transit",
    source: "carrier_api",
    occurredAt: "2026-03-03T08:10:00Z",
    idempotencyKey: "proc-006-transit-3",
    message: "Departed Chicago hub — in transit to Milwaukee, WI",
  },
  {
    id: "se-proc-006-5",
    shipmentId: "shp-proc-006",
    type: "shipment_status_updated",
    status: "out_for_delivery",
    source: "carrier_api",
    occurredAt: "2026-03-04T07:30:00Z",
    idempotencyKey: "proc-006-ofd",
    message: "Out for delivery — Milwaukee, WI",
  },
  {
    id: "se-proc-006-6",
    shipmentId: "shp-proc-006",
    type: "shipment_delivered",
    status: "delivered",
    source: "carrier_api",
    occurredAt: "2026-03-04T14:10:00Z",
    idempotencyKey: "proc-006-delivered",
    message: "Delivered at doorstep — signed by J. Morrison, Dock 4",
  },
  // shp-proc-001: Drive Shaft (pi-008), in-transit with delays
  {
    id: "se-proc-001-1",
    shipmentId: "shp-proc-001",
    type: "shipment_created",
    status: "shipment_created",
    source: "carrier_api",
    occurredAt: "2026-03-07T10:00:00Z",
    idempotencyKey: "proc-001-created",
    message: "Shipment created — TechParts International, San Jose CA",
    trackingNumber: "920241085725456",
  },
  {
    id: "se-proc-001-2",
    shipmentId: "shp-proc-001",
    type: "shipment_status_updated",
    status: "label_created",
    source: "carrier_api",
    occurredAt: "2026-03-07T10:45:00Z",
    idempotencyKey: "proc-001-label",
    message: "Shipping label generated — FedEx Freight Priority",
    trackingNumber: "920241085725456",
  },
  {
    id: "se-proc-001-3",
    shipmentId: "shp-proc-001",
    type: "shipment_status_updated",
    status: "picked_up",
    source: "carrier_api",
    occurredAt: "2026-03-08T14:30:00Z",
    idempotencyKey: "proc-001-pickup",
    message: "Picked up from supplier — packaged for freight",
  },
  {
    id: "se-proc-001-4a",
    shipmentId: "shp-proc-001",
    type: "shipment_status_updated",
    status: "in_transit",
    source: "carrier_api",
    occurredAt: "2026-03-09T05:20:00Z",
    idempotencyKey: "proc-001-transit-1",
    message: "Departed origin facility — San Jose, CA",
    estimatedDelivery: "2026-03-14",
  },
  {
    id: "se-proc-001-4b",
    shipmentId: "shp-proc-001",
    type: "shipment_exception",
    status: "delayed",
    source: "carrier_api",
    occurredAt: "2026-03-10T18:00:00Z",
    idempotencyKey: "proc-001-delay",
    message: "Shipment delayed — weather conditions (winter storm advisory, I-80 corridor)",
    estimatedDelivery: "2026-03-16",
  },
  {
    id: "se-proc-001-4c",
    shipmentId: "shp-proc-001",
    type: "shipment_status_updated",
    status: "in_transit",
    source: "carrier_api",
    occurredAt: "2026-03-11T12:15:00Z",
    idempotencyKey: "proc-001-transit-2",
    message: "Arrived at regional distribution center — Salt Lake City, UT",
    estimatedDelivery: "2026-03-16",
  },
  {
    id: "se-proc-001-4d",
    shipmentId: "shp-proc-001",
    type: "shipment_status_updated",
    status: "in_transit",
    source: "carrier_api",
    occurredAt: "2026-03-12T06:40:00Z",
    idempotencyKey: "proc-001-transit-3",
    message: "Departed Salt Lake City — in transit to Chicago, IL hub",
    estimatedDelivery: "2026-03-16",
  },
  {
    id: "se-mock-003-1",
    shipmentId: "shp-mock-003",
    type: "shipment_created",
    status: "shipment_created",
    source: "carrier_api",
    occurredAt: "2026-03-08T09:35:00Z",
    idempotencyKey: "mock-003-created",
    message: "Shipment created via FedEx API",
    trackingNumber: "794644790132",
  },
  {
    id: "se-mock-003-2",
    shipmentId: "shp-mock-003",
    type: "shipment_status_updated",
    status: "label_created",
    source: "carrier_api",
    occurredAt: "2026-03-08T10:12:00Z",
    idempotencyKey: "mock-003-label",
    message: "Shipping label generated",
    trackingNumber: "794644790132",
  },
  {
    id: "se-mock-003-3",
    shipmentId: "shp-mock-003",
    type: "shipment_status_updated",
    status: "picked_up",
    source: "carrier_api",
    occurredAt: "2026-03-09T15:45:00Z",
    idempotencyKey: "mock-003-pickup",
    message: "Package picked up from warehouse",
  },
  {
    id: "se-mock-003-4",
    shipmentId: "shp-mock-003",
    type: "shipment_status_updated",
    status: "in_transit",
    source: "carrier_api",
    occurredAt: "2026-03-11T08:20:00Z",
    idempotencyKey: "mock-003-transit",
    message: "In transit — Portland, OR sorting facility",
    estimatedDelivery: "2026-03-14",
  },
  {
    id: "se-mock-004-1",
    shipmentId: "shp-mock-004",
    type: "shipment_created",
    status: "shipment_created",
    source: "carrier_api",
    occurredAt: "2026-02-26T10:00:00Z",
    idempotencyKey: "mock-004-created",
    message: "Shipment created via DHL Express",
    trackingNumber: "1234567890",
  },
  {
    id: "se-mock-004-2",
    shipmentId: "shp-mock-004",
    type: "shipment_status_updated",
    status: "label_created",
    source: "carrier_api",
    occurredAt: "2026-02-26T10:30:00Z",
    idempotencyKey: "mock-004-label",
    message: "Shipping label generated",
    trackingNumber: "1234567890",
  },
  {
    id: "se-mock-004-3",
    shipmentId: "shp-mock-004",
    type: "shipment_status_updated",
    status: "picked_up",
    source: "carrier_api",
    occurredAt: "2026-02-26T16:10:00Z",
    idempotencyKey: "mock-004-pickup",
    message: "Package picked up from warehouse",
  },
  {
    id: "se-mock-004-4",
    shipmentId: "shp-mock-004",
    type: "shipment_status_updated",
    status: "in_transit",
    source: "carrier_api",
    occurredAt: "2026-02-27T09:15:00Z",
    idempotencyKey: "mock-004-transit",
    message: "In transit — Detroit, MI hub",
    estimatedDelivery: "2026-03-01",
  },
  {
    id: "se-mock-004-5",
    shipmentId: "shp-mock-004",
    type: "shipment_status_updated",
    status: "out_for_delivery",
    source: "carrier_api",
    occurredAt: "2026-03-01T08:45:00Z",
    idempotencyKey: "mock-004-ofd",
    message: "Out for delivery",
  },
  {
    id: "se-mock-004-6",
    shipmentId: "shp-mock-004",
    type: "shipment_delivered",
    status: "delivered",
    source: "carrier_api",
    occurredAt: "2026-03-01T14:22:00Z",
    idempotencyKey: "mock-004-delivered",
    message: "Delivered — signed by L. Park",
  },
];

const memShipments: Shipment[] = [...mockShipments];
const memEvents: ShipmentEvent[] = [...mockEvents];
const memNotifications: ShipmentNotification[] = [];
const memDedupe = new Set<string>();
let memMetrics: ShippingMetrics = {
  shipmentEventsProcessed: 0,
  notificationSent: 0,
  notificationFailed: 0,
  duplicateSuppressed: 0,
  lastUpdatedAt: new Date().toISOString(),
};

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

async function kvGetList<T>(redis: Redis, key: string): Promise<T[]> {
  const raw = (await redis.get(key)) as string | T[] | null;
  if (!raw) return [];
  return typeof raw === "string" ? (JSON.parse(raw) as T[]) : raw;
}

async function kvSetList<T>(redis: Redis, key: string, value: T[]): Promise<void> {
  await redis.set(key, JSON.stringify(value));
}

async function kvGetObject<T>(redis: Redis, key: string): Promise<T | null> {
  const raw = (await redis.get(key)) as string | T | null;
  if (!raw) return null;
  return typeof raw === "string" ? (JSON.parse(raw) as T) : raw;
}

export async function getShipments(filters?: {
  orderId?: string;
  poId?: string;
}): Promise<Shipment[]> {
  const r = getRedis();
  const all = r ? await kvGetList<Shipment>(r, SHIPMENTS_KEY) : [...memShipments];
  const filtered = all.filter((shipment) => {
    if (filters?.orderId && shipment.orderId !== filters.orderId) return false;
    if (filters?.poId && shipment.poId !== filters.poId) return false;
    return true;
  });
  return filtered.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function getShipmentById(id: string): Promise<Shipment | undefined> {
  const r = getRedis();
  if (r) {
    const shipment = await kvGetObject<Shipment>(r, `${SHIPMENT_PREFIX}${id}`);
    return shipment ?? undefined;
  }
  return memShipments.find((shipment) => shipment.id === id);
}

export async function saveShipment(shipment: Shipment): Promise<Shipment> {
  const r = getRedis();
  if (r) {
    const all = await kvGetList<Shipment>(r, SHIPMENTS_KEY);
    const index = all.findIndex((s) => s.id === shipment.id);
    if (index === -1) all.push(shipment);
    else all[index] = shipment;
    await kvSetList(r, SHIPMENTS_KEY, all);
    await r.set(`${SHIPMENT_PREFIX}${shipment.id}`, JSON.stringify(shipment));
    return shipment;
  }

  const index = memShipments.findIndex((s) => s.id === shipment.id);
  if (index === -1) memShipments.push(shipment);
  else memShipments[index] = shipment;
  return shipment;
}

export async function hasIdempotencyKey(idempotencyKey: string): Promise<boolean> {
  const r = getRedis();
  if (r) {
    const existing = await r.get(`${SHIPMENT_DEDUPE_PREFIX}${idempotencyKey}`);
    return Boolean(existing);
  }
  return memDedupe.has(idempotencyKey);
}

export async function markIdempotencyKey(idempotencyKey: string): Promise<void> {
  const r = getRedis();
  if (r) {
    await r.set(`${SHIPMENT_DEDUPE_PREFIX}${idempotencyKey}`, "1");
    return;
  }
  memDedupe.add(idempotencyKey);
}

export async function addShipmentEvent(event: ShipmentEvent): Promise<ShipmentEvent> {
  const r = getRedis();
  if (r) {
    const all = await kvGetList<ShipmentEvent>(r, SHIPMENT_EVENTS_KEY);
    all.push(event);
    await kvSetList(r, SHIPMENT_EVENTS_KEY, all);
    await r.set(`${SHIPMENT_EVENT_PREFIX}${event.id}`, JSON.stringify(event));
    return event;
  }
  memEvents.push(event);
  return event;
}

export async function getShipmentEvents(shipmentId?: string): Promise<ShipmentEvent[]> {
  const r = getRedis();
  const all = r ? await kvGetList<ShipmentEvent>(r, SHIPMENT_EVENTS_KEY) : [...memEvents];
  return all
    .filter((event) => (shipmentId ? event.shipmentId === shipmentId : true))
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
}

export async function addShipmentNotification(
  notification: ShipmentNotification
): Promise<ShipmentNotification> {
  const r = getRedis();
  if (r) {
    const all = await kvGetList<ShipmentNotification>(r, SHIPMENT_NOTIFICATIONS_KEY);
    all.push(notification);
    await kvSetList(r, SHIPMENT_NOTIFICATIONS_KEY, all);
    await r.set(
      `${SHIPMENT_NOTIFICATION_PREFIX}${notification.id}`,
      JSON.stringify(notification)
    );
    return notification;
  }
  memNotifications.push(notification);
  return notification;
}

export async function getShipmentNotifications(
  shipmentId?: string
): Promise<ShipmentNotification[]> {
  const r = getRedis();
  const all = r
    ? await kvGetList<ShipmentNotification>(r, SHIPMENT_NOTIFICATIONS_KEY)
    : [...memNotifications];
  return all
    .filter((notification) =>
      shipmentId ? notification.shipmentId === shipmentId : true
    )
    .sort((a, b) => {
      const aDate = a.sentAt ?? "";
      const bDate = b.sentAt ?? "";
      return new Date(bDate).getTime() - new Date(aDate).getTime();
    });
}

export async function incrementShippingMetric(
  key: keyof Omit<ShippingMetrics, "lastUpdatedAt">,
  amount = 1
): Promise<ShippingMetrics> {
  const r = getRedis();
  if (r) {
    const current =
      (await kvGetObject<ShippingMetrics>(r, SHIPMENT_METRICS_KEY)) ?? memMetrics;
    const next: ShippingMetrics = {
      ...current,
      [key]: current[key] + amount,
      lastUpdatedAt: new Date().toISOString(),
    };
    await r.set(SHIPMENT_METRICS_KEY, JSON.stringify(next));
    return next;
  }
  memMetrics = {
    ...memMetrics,
    [key]: memMetrics[key] + amount,
    lastUpdatedAt: new Date().toISOString(),
  };
  return memMetrics;
}

export async function getShippingMetrics(): Promise<ShippingMetrics> {
  const r = getRedis();
  if (r) {
    const current = await kvGetObject<ShippingMetrics>(r, SHIPMENT_METRICS_KEY);
    return current ?? memMetrics;
  }
  return memMetrics;
}
