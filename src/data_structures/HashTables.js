class LPEntry {
  constructor({ id, key, value }) {
    this.id = id ?? null;
    this.key = key;
    this.value = value;
  }
}

class LinearProbingHashTable {
  constructor(initialSize = 7) {
    this.size = initialSize;
    this.buckets = Array.from({ length: this.size }, () => null);
    this._TOMBSTONE = { __tombstone: true };
    this._count = 0;
    this._nextId = 1;
    this._maxLoad = 0.86; // resize threshold
  }

  _hash(key) {
    const k = Number(key);
    return Math.abs(k) % this.size;
  }

  _shouldResize() {
    return this._count / this.size > this._maxLoad;
  }

  _resizeAndRehash() {
    const old = this.buckets;
    this.size = this.size * 2;
    this.buckets = Array.from({ length: this.size }, () => null);
    this._count = 0;
    for (const slot of old) {
      if (slot && slot !== this._TOMBSTONE) {
        this.insert(slot.key, slot.value, slot.id);
      }
    }
  }

  insert(key, value, idProvided = null) {
    const k = Number(key);
    const v = value;

    let idx = this._hash(k);
    const start = idx;
    let firstTombstone = -1;

    while (true) {
      const slot = this.buckets[idx];
      if (slot === null) {
        break;
      }
      if (slot === this._TOMBSTONE) {
        if (firstTombstone === -1) firstTombstone = idx;
      } else if (slot.key === k) {
        slot.value = v;
        return { type: "update", index: idx, entry: slot };
      }
      idx = (idx + 1) % this.size;
      if (idx === start) break;
    }

    if ((this._count + 1) / this.size > this._maxLoad) {
      this._resizeAndRehash();
      // After resize the table layout changed entirely — re-run insert from scratch.
      return this.insert(key, value, idProvided);
    }

    // Insertion point: reuse the earliest tombstone if we saw one,
    // otherwise use the null slot idx stopped at.
    const place = firstTombstone !== -1 ? firstTombstone : idx;

    const e = new LPEntry({
      id: idProvided ?? this._nextId++,
      key: k,
      value: v,
    });

    this.buckets[place] = e;
    this._count++;
    return { type: "insert", index: place, entry: e };
  }


  search(key) {
    const k = Number(key);
    let idx = this._hash(k);
    const start = idx;
    while (true) {
      const slot = this.buckets[idx];
      if (slot === null) return null; // not found
      if (slot !== this._TOMBSTONE && slot.key === k) return slot;
      idx = (idx + 1) % this.size;
      if (idx === start) return null;
    }
  }

  delete(key) {
    const k = Number(key);
    let idx = this._hash(k);
    const start = idx;
    while (true) {
      const slot = this.buckets[idx];
      if (slot === null) return null; // not found
      if (slot !== this._TOMBSTONE && slot.key === k) {
        const removed = slot;
        this.buckets[idx] = this._TOMBSTONE;
        this._count--;
        return { index: idx, deleted: removed };
      }
      idx = (idx + 1) % this.size;
      if (idx === start) return null;
    }
  }

  // debug helper: returns simple array snapshot (null / "T" / {k,v})
  snapshot() {
    return this.buckets.map((b) =>
      b === null ? null : b === this._TOMBSTONE ? "T" : { key: b.key, value: b.value, id: b.id }
    );
  }
}

/* -------------------- Chaining (Separate chaining) -------------------- */

class ChainEntry {
  constructor({ id, key, value, next = null }) {
    this.id = id ?? null;
    this.key = key;
    this.value = value;
    this.next = next; // linked-list next (ChainEntry or null)
  }
}

class ChainingHashTable {
  constructor(initialSize = 7) {
    this.size = initialSize;
    // each bucket is either null or points to head ChainEntry
    this.buckets = Array.from({ length: this.size }, () => null);
    this._count = 0;
    this._nextId = 1;
    this._maxAvgChain = 3; // resize if average chain length exceeds this
  }

  _hash(key) {
    const k = Number(key);
    return Math.abs(k) % this.size;
  }

  _shouldResize() {
    return this._count / this.size > this._maxAvgChain;
  }

  _resizeAndRehash() {
    const all = [];
    // collect every entry (preserve id)
    for (let i = 0; i < this.size; i++) {
      let cur = this.buckets[i];
      while (cur) {
        all.push({ id: cur.id, key: cur.key, value: cur.value });
        cur = cur.next;
      }
    }
    this.size = this.size * 2;
    this.buckets = Array.from({ length: this.size }, () => null);
    this._count = 0;
    // re-insert preserving ids
    for (const e of all) {
      this.insert(e.key, e.value, e.id);
    }
  }

  insert(key, value, idProvided = null) {
    const k = Number(key);
    const v = value;
    if (this._shouldResize()) this._resizeAndRehash();

    const idx = this._hash(k);

    // Explicitly read the current head (should be a ChainEntry or null)
    const head = this.buckets[idx];

    // First check for existing key in the chain (traverse ChainEntry nodes)
    let cur = head;
    while (cur) {
      if (cur.key === k) {
        // update existing
        cur.value = v;
        return { type: "update", bucketIndex: idx, entry: cur };
      }
      cur = cur.next;
    }

    // Not found: create new node and insert at head pointing to the prior head
    const newEntry = new ChainEntry({
      id: idProvided ?? this._nextId++,
      key: k,
      value: v,
      next: head,
    });

    // write new head
    this.buckets[idx] = newEntry;
    this._count++;

    return { type: "insert", bucketIndex: idx, entry: newEntry };
  }

  search(key) {
    const k = Number(key);
    const idx = this._hash(k);
    let cur = this.buckets[idx];
    while (cur) {
      if (cur.key === k) return cur;
      cur = cur.next;
    }
    return null;
  }

  delete(key) {
    const k = Number(key);
    const idx = this._hash(k);
    let cur = this.buckets[idx];
    let prev = null;
    while (cur) {
      if (cur.key === k) {
        if (prev === null) {
          this.buckets[idx] = cur.next;
        } else {
          prev.next = cur.next;
        }
        this._count--;
        return { bucketIndex: idx, deleted: cur };
      }
      prev = cur;
      cur = cur.next;
    }
    return null;
  }

  toBucketsArray() {
    const res = Array.from({ length: this.size }, () => []);
    for (let i = 0; i < this.size; i++) {
      let cur = this.buckets[i];
      while (cur) {
        res[i].push({ key: cur.key, value: cur.value, id: cur.id });
        cur = cur.next;
      }
    }
    return res;
  }
}


export { LinearProbingHashTable, ChainingHashTable };