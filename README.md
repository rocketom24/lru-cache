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

## Complexity

| Operation | Time | Space |
|---|---|---|
| `get` | O(1) | — |
| `put` | O(1) | — |
| overall | — | O(capacity) |

## Run it

```bash
npm install
npm run demo    # builds + runs src/demo.ts, logs put/get/eviction proof
```

Or just build:

```bash
npm run build    # emits dist/
```

## Files

- `src/LRUCache.ts` — the implementation
- `src/demo.ts` — example calls demonstrating put, get, and eviction, with logged output
