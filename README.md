# lru-cache

O(1) LRU (Least Recently Used) cache in TypeScript.

## Data structures

- **`Map<K, Node<K,V>>`** — key to node lookup, O(1) average.
- **Doubly linked list** — recency order. Head = most recently used, tail = least recently used. Each node holds `prev`/`next` pointers.

A Map alone gives O(1) lookup but no cheap way to track or reorder recency without scanning. A plain array gives ordering but O(n) removal/reinsertion. The doubly linked list gives O(1) removal and O(1) insert-at-front given a node reference — which the Map hands you directly — so the two structures together give O(1) for both operations.

## How LRU order is maintained

- `get(key)`: look up the node via the Map. If found, unlink it and re-insert at the head (`moveToFront`), then return its value. A hit always promotes the key to most-recently-used.
- `put(key, value)`:
  - Key exists: update its value, move its node to the head.
  - Key is new: create a node, insert at the head, add to the Map. If size now exceeds capacity, remove the tail node (least recently used) from both the list and the Map.

Every operation that touches a key moves it to the head. The tail is always whatever hasn't been touched the longest, so eviction is just "drop the tail."

## Complexity

| Operation | Time | Space |
|---|---|---|
| `get` | O(1) | — |
| `put` | O(1) | — |
| overall | — | O(capacity) |

## Run it

```bash
npm install
npm run demo    # builds + runs src/demo.ts, logs both test sections below
```

Or just build:

```bash
npm run build    # emits dist/
```

`npm run demo` runs everything in one script — the console output is split into two clearly labeled sections:

- `--- Basic LRU Test ---` — put/get and both eviction cases
- `--- TTL Expiry Test ---` — TTL set, expiry, and a no-TTL control key

There's no separate command for the TTL part; it's the second half of the same `demo.ts` output.

## TTL (bonus)

`put(key, value, ttlMs?)` takes an optional TTL in ms. The node stores `expiresAt = Date.now() + ttlMs` (or `undefined` if omitted, meaning it never expires).

Expiration is **lazy** — checked only inside `get()`. If `Date.now() >= expiresAt`, the key is treated as a miss, removed from the Map and unlinked from the list right there, same as a normal LRU eviction.

Trade-offs:
- **Lazy vs. active**: lazy costs nothing until the key is touched (no timers, no background sweep), but an expired-and-untouched key still occupies a capacity slot until someone `get`s it or LRU pressure evicts it naturally from the tail. Active expiration (a timer per key, or a periodic sweep) reclaims space immediately but adds timer bookkeeping and cleanup-on-delete complexity. Lazy keeps the O(1)/no-dependencies scope of the rest of the cache.
- Keys without a TTL are unaffected — `expiresAt` stays `undefined`, the expiry check is skipped, plain LRU behavior and complexity are unchanged.

## Files

- `src/LRUCache.ts` — the implementation
- `src/demo.ts` — example calls demonstrating put, get, eviction, and TTL expiry, with logged output
