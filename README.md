# lru-cache

O(1) LRU (Least Recently Used) cache in TypeScript.

## Data structures

- **`Map<K, Node<K,V>>`** — key to node lookup, O(1) average.
- **Doubly linked list** — recency order. Head = most recently used, tail = least recently used. Each node holds `prev`/`next` pointers.

Map alone gives O(1) lookup but no cheap way to track/reorder recency without
scanning. A plain array gives ordering but O(n) removal/reinsertion. The
doubly linked list gives O(1) removal and O(1) insert-at-front given a node
reference — which the Map hands you directly — so both structures together
give O(1) for both operations.

## How LRU order is maintained

- `get(key)`: look up node via Map. If found, unlink it and re-insert at head (`moveToFront`), then return its value. A hit always promotes the key to most-recently-used.
- `put(key, value)`:
  - Key exists: update its value, move its node to head.
  - Key is new: create a node, insert at head, add to Map. If size now exceeds capacity, remove the tail node (least recently used) from both the list and the Map.

Every operation that touches a key moves it to the head. The tail is always
whatever hasn't been touched the longest, so eviction is just "drop the
tail."

## TTL (optional expiration)

`put(key, value, ttlMs?)` takes an optional TTL in ms. Node stores `expiresAt = Date.now() + ttlMs` (or `undefined` if omitted — never expires).

Expiration is **lazy**: checked only inside `get()`. If `Date.now() >= expiresAt`, the key is treated as a miss (`undefined`), removed from the Map and unlinked from the list right there — same eviction path `put` uses for LRU overflow.

Trade-offs:
- **Lazy vs active** — lazy costs nothing until you touch the key (no timers/background sweep), but an expired-and-untouched key still occupies a capacity slot until someone `get`s it (or LRU pressure evicts it naturally from the tail). An active approach (setTimeout per key, or a periodic sweep) reclaims space immediately but adds timer bookkeeping and cleanup-on-delete complexity. Lazy fits the O(1)/no-deps scope here.
- No TTL set → `expiresAt` stays `undefined`, skips the check entirely, zero effect on plain LRU behavior/complexity.

## Complexity

| Operation | Time | Space |
|---|---|---|
| `get` | O(1) | — |
| `put` | O(1) | — |
| overall | — | O(capacity) |

## Run it

```bash
npm install
npm run demo    # builds + runs src/demo.ts, logs put/get/eviction + TTL expiry proof
```

Or just build:

```bash
npm run build    # emits dist/
```

## Files

- `src/LRUCache.ts` — the implementation
- `src/demo.ts` — example calls demonstrating put, get, and eviction, with logged output
