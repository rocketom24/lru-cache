class Node<K, V> {
  key: K;
  value: V;
  expiresAt: number | undefined; // ms epoch; undefined = no TTL
  prev: Node<K, V> | null = null;
  next: Node<K, V> | null = null;

  constructor(key: K, value: V, expiresAt?: number) {
    this.key = key;
    this.value = value;
    this.expiresAt = expiresAt;
  }
}

/**
 * O(1) get/put LRU cache. Map gives O(1) key lookup; the doubly linked
 * list keeps recency order so move-to-front and evict-tail are both O(1)
 * pointer rewires (an array/Map-reinsert approach would need to shift or
 * rebuild order on every touch).
 */
export class LRUCache<K, V> {
  private capacity: number;
  private map: Map<K, Node<K, V>> = new Map();
  private head: Node<K, V> | null = null; // most recently used
  private tail: Node<K, V> | null = null; // least recently used

  constructor(capacity: number) {
    if (capacity <= 0) throw new Error("capacity must be > 0");
    this.capacity = capacity;
  }

  get(key: K): V | undefined {
    const node = this.map.get(key);
    if (!node) return undefined;
    if (node.expiresAt !== undefined && Date.now() >= node.expiresAt) {
      this.remove(node);
      this.map.delete(key);
      return undefined;
    }
    this.moveToFront(node);
    return node.value;
  }

  /** ttlMs is optional; omit for a key that never expires. */
  put(key: K, value: V, ttlMs?: number): void {
    const expiresAt = ttlMs !== undefined ? Date.now() + ttlMs : undefined;
    const existing = this.map.get(key);
    if (existing) {
      existing.value = value;
      existing.expiresAt = expiresAt;
      this.moveToFront(existing);
      return;
    }

    const node = new Node(key, value, expiresAt);
    this.map.set(key, node);
    this.addToFront(node);

    if (this.map.size > this.capacity) {
      const lru = this.tail;
      if (lru) {
        this.remove(lru);
        this.map.delete(lru.key);
      }
    }
  }

  get size(): number {
    return this.map.size;
  }

  private addToFront(node: Node<K, V>): void {
    node.prev = null;
    node.next = this.head;
    if (this.head) this.head.prev = node;
    this.head = node;
    if (!this.tail) this.tail = node;
  }

  private remove(node: Node<K, V>): void {
    if (node.prev) node.prev.next = node.next;
    else this.head = node.next;
    if (node.next) node.next.prev = node.prev;
    else this.tail = node.prev;
    node.prev = null;
    node.next = null;
  }

  private moveToFront(node: Node<K, V>): void {
    if (this.head === node) return;
    this.remove(node);
    this.addToFront(node);
  }
}
