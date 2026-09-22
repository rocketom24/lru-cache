import { LRUCache } from "./LRUCache";

function log(label: string, value: unknown): void {
  console.log(`${label} -> ${JSON.stringify(value)}`);
}

console.log("=== LRUCache demo (capacity 3) ===\n");

const cache = new LRUCache<string, number>(3);

console.log("-- put a=1, b=2, c=3 --");
cache.put("a", 1);
cache.put("b", 2);
cache.put("c", 3);
log('get("a")', cache.get("a")); // hit, a becomes MRU. order now: c,b,a(front)

console.log("\n-- put d=4 (capacity 3 exceeded, evicts LRU) --");
console.log("order before put: a(MRU), c, b(LRU) -> b should be evicted");
cache.put("d", 4);
log('get("b")', cache.get("b")); // undefined, evicted
log('get("a")', cache.get("a")); // still present
log('get("c")', cache.get("c")); // still present
log('get("d")', cache.get("d")); // still present

console.log("\n-- put c=30 (update existing key, moves c to MRU) --");
cache.put("c", 30);
log('get("c")', cache.get("c")); // 30

console.log("\n-- put e=5 (evicts current LRU) --");
console.log("order before put: c(MRU), d, a(LRU) -> a should be evicted");
cache.put("e", 5);
log('get("a")', cache.get("a")); // undefined, evicted
log('get("e")', cache.get("e")); // 5

console.log(`\nfinal size -> ${cache.size}`);
