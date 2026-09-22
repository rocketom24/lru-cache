import { LRUCache } from "./LRUCache";

function log(label: string, value: unknown): void {
  console.log(`${label} -> ${JSON.stringify(value)}`);
}

console.log("--- Basic LRU Test ---\n");

const cache = new LRUCache<string, number>(3);

console.log("put a=1, b=2, c=3 (capacity 3)");
cache.put("a", 1);
cache.put("b", 2);
cache.put("c", 3);
log('get("a")', cache.get("a")); // hit, a becomes MRU. order now: c,b,a(front)

console.log("\nput d=4 -> capacity exceeded, order was a(MRU),c,b(LRU) -> evicting \"b\"");
cache.put("d", 4);
log('get("b") [expect evicted]', cache.get("b")); // undefined, evicted
log('get("a")', cache.get("a")); // still present
log('get("c")', cache.get("c")); // still present
log('get("d")', cache.get("d")); // still present

console.log("\nput c=30 (existing key update, moves c to MRU, no eviction)");
cache.put("c", 30);
log('get("c")', cache.get("c")); // 30

console.log("\nput e=5 -> capacity exceeded, order was c(MRU),d,a(LRU) -> evicting \"a\"");
cache.put("e", 5);
log('get("a") [expect evicted]', cache.get("a")); // undefined, evicted
log('get("e")', cache.get("e")); // 5

console.log(`\nfinal size -> ${cache.size}`);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function ttlDemo(): Promise<void> {
  console.log("\n--- TTL Expiry Test ---\n");
  const ttlCache = new LRUCache<string, string>(3);

  console.log('put "session"="token-abc" with ttl=50ms');
  ttlCache.put("session", "token-abc", 50);
  log('get("session") immediately [expect hit]', ttlCache.get("session"));

  console.log("\nwaiting 80ms (past the 50ms ttl)...");
  await sleep(80);
  log('get("session") after expiry [expect -1/undefined, treated as evicted]', ttlCache.get("session"));
  console.log(`size after expired get -> ${ttlCache.size} (lazily evicted on access)`);

  console.log('\nput "config"="prod" with no ttl (never expires)');
  ttlCache.put("config", "prod");
  await sleep(80);
  log('get("config") after same 80ms wait [expect still hit, no ttl set]', ttlCache.get("config"));
}

ttlDemo();
