import { Redis } from "@upstash/redis";
import { Order } from "./types";
import { mockOrders } from "./mock-data";

const ORDERS_KEY = "hexa:orders";

function orderKey(id: string) {
  return `hexa:order:${id}`;
}

// ---------------------------------------------------------------------------
// KV-backed store (used when env vars are present)
// ---------------------------------------------------------------------------

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

async function seedIfEmpty(redis: Redis): Promise<void> {
  const ids: string[] | null = await redis.get(ORDERS_KEY);
  if (ids && ids.length > 0) return;

  const pipeline = redis.pipeline();
  const idList: string[] = [];
  for (const order of mockOrders) {
    pipeline.set(orderKey(order.id), JSON.stringify(order));
    idList.push(order.id);
  }
  pipeline.set(ORDERS_KEY, JSON.stringify(idList));
  await pipeline.exec();
}

async function kvGetAllOrders(redis: Redis): Promise<Order[]> {
  await seedIfEmpty(redis);
  const ids: string[] | null = await redis.get(ORDERS_KEY);
  if (!ids || ids.length === 0) return [];

  const pipeline = redis.pipeline();
  for (const id of ids) {
    pipeline.get(orderKey(id));
  }
  const results = await pipeline.exec();

  const orders: Order[] = [];
  for (const raw of results) {
    if (!raw) continue;
    const order = typeof raw === "string" ? JSON.parse(raw) : (raw as Order);
    orders.push(order);
  }
  return orders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

async function kvGetOrderById(
  redis: Redis,
  id: string
): Promise<Order | undefined> {
  await seedIfEmpty(redis);
  const raw: string | Order | null = await redis.get(orderKey(id));
  if (!raw) return undefined;
  return typeof raw === "string" ? JSON.parse(raw) : (raw as Order);
}

async function kvAddOrder(redis: Redis, order: Order): Promise<Order> {
  await seedIfEmpty(redis);
  const ids: string[] | null = await redis.get(ORDERS_KEY);
  const list = ids ?? [];
  list.unshift(order.id);

  const pipeline = redis.pipeline();
  pipeline.set(orderKey(order.id), JSON.stringify(order));
  pipeline.set(ORDERS_KEY, JSON.stringify(list));
  await pipeline.exec();

  return order;
}

// ---------------------------------------------------------------------------
// In-memory fallback (local dev without KV)
// ---------------------------------------------------------------------------

const memoryOrders: Order[] = [...mockOrders];

function memGetAllOrders(): Order[] {
  return [...memoryOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function memGetOrderById(id: string): Order | undefined {
  return memoryOrders.find((o) => o.id === id);
}

function memAddOrder(order: Order): Order {
  memoryOrders.unshift(order);
  return order;
}

// ---------------------------------------------------------------------------
// Public async API
// ---------------------------------------------------------------------------

export async function getAllOrders(): Promise<Order[]> {
  const redis = getRedis();
  if (redis) return kvGetAllOrders(redis);
  return memGetAllOrders();
}

export async function getOrderById(id: string): Promise<Order | undefined> {
  const redis = getRedis();
  if (redis) return kvGetOrderById(redis, id);
  return memGetOrderById(id);
}

export async function addOrder(order: Order): Promise<Order> {
  const redis = getRedis();
  if (redis) return kvAddOrder(redis, order);
  return memAddOrder(order);
}
