import { RedisClient } from "bun";

export default class RedisClientSingleton {
  private static instance: RedisClient | null = null;
  private static pool: RedisClient[] = [];
  private static poolSize = 5; // adjust based on load
  private static current = 0;
  private static streamClient: RedisClient | null = null;

  private constructor() {}

  public static getStreamClient(): RedisClient {
    if (!RedisClientSingleton.streamClient) {
      RedisClientSingleton.streamClient = new RedisClient(
        process.env.REDIS_URL,
        {
          autoReconnect: true,
          maxRetries: 5,
          enableOfflineQueue: true,
        }
      );
    }
    return RedisClientSingleton.streamClient;
  }

  public static getInstance(): RedisClient {
    if (!RedisClientSingleton.instance) {
      RedisClientSingleton.instance = new RedisClient(process.env.REDIS_URL, {
        autoReconnect: true,
        maxRetries: 5,
        enableOfflineQueue: true,
      });
    }

    return RedisClientSingleton.instance;
  }

  public static getClient(): RedisClient {
    if (RedisClientSingleton.pool.length === 0) {
      for (let i = 0; i < RedisClientSingleton.poolSize; i++) {
        const client = new RedisClient(process.env.REDIS_URL);

        RedisClientSingleton.pool.push(client);
      }
    }

    const client = RedisClientSingleton.pool[RedisClientSingleton.current];

    if (!client) {
      throw new Error("Redis client pool is not initialized");
    }
    RedisClientSingleton.current =
      (RedisClientSingleton.current + 1) % RedisClientSingleton.poolSize;

    return client;
  }
}
