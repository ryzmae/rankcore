import { Redis } from "@upstash/redis/cloudflare";

export function createRedis(url: string, token: string) {
  return new Redis({ url, token });
}
