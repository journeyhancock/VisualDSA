// HashTablePage.js
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  LinearProbingHashTable,
  ChainingHashTable,
} from "../data_structures/HashTables";
import "../App.css";
import "./styles/HashTablePage.css";

const SPEED_MULTIPLIER = 7.5;
const delay = (ms) => new Promise(res => setTimeout(res, ms * SPEED_MULTIPLIER));

function verifyInput(value) {
  return !Number.isInteger(Number(value)) || value === "" || value.includes(".");
}

function HashTablePage() {
  const [hashMode, setHashMode] = useState("chaining");

  const createTableForMode = React.useCallback((mode, size = 8) =>
  mode === "linear"
      ? new LinearProbingHashTable(size)
      : new ChainingHashTable(size),
  []);

  const tableRef = useRef(createTableForMode(hashMode));
  const initialized = useRef(false);

  const [bucketVM, setBucketVM] = useState(() =>
    toViewBuckets(tableRef.current, hashMode)
  );

  // Panels + code
  const [codeSnippet, setCodeSnippet] = useState([]);
  const [chainingInsertSnippet, setChainingInsertSnippet] = useState([]);
  const [chainingDeleteSnippet, setChainingDeleteSnippet] = useState([]);
  const [chainingSearchSnippet, setChainingSearchSnippet] = useState([]);
  const [linearInsertSnippet, setLinearInsertSnippet] = useState([]);
  const [linearDeleteSnippet, setLinearDeleteSnippet] = useState([]);
  const [linearSearchSnippet, setLinearSearchSnippet] = useState([]);
  const [nodeSnippet, setNodeSnippet] = useState("");

  const [openPanels, setOpenPanels] = useState({
    nodes: false,
    actions: false,
    hashTable: false,
  });

  // Inputs
  const [insertKey, setInsertKey] = useState("");
  const [insertValue, setInsertValue] = useState("");
  const [deleteKey, setDeleteKey] = useState("");
  const [searchKey, setSearchKey] = useState("");

  // Animation / highlights
  const [animating, setAnimating] = useState(false);
  const [activeLine, setActiveLine] = useState(null);
  const [activeBucketIndex, setActiveBucketIndex] = useState(null);
  const [activeEntryIndex, setActiveEntryIndex] = useState(null);

  // Selected entry
  const [selectedEntryRef, setSelectedEntryRef] = useState(null);
  const [selectedEntryCode, setSelectedEntryCode] = useState("");

  const togglePanel = (panel) => {
    setOpenPanels((prev) => ({
      ...prev,
      [panel]: !prev[panel],
    }));
  };

  const formatBlock = React.useCallback((str) =>
    str
      .trim()
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n"),
    []
  );

  const generateEntryCode = React.useCallback(
  (entryObj) => {
    if (!entryObj) {
      return formatBlock(
        `Entry* entry {
        int key = null;
        int value = null;
        Entry* next = null;
      }`
      );
    }

    const id = entryObj.id ?? "?";
    const nextId = entryObj.next ? entryObj.next.id ?? "?" : null;

    return formatBlock(
      `Entry* entry_${id} {
      int key = ${entryObj.key};
      int value = ${entryObj.value};
      Entry* next = ${nextId !== null ? `entry_${nextId}` : "nullptr"};
    }`
    );
  },
  [formatBlock]
);

  // Load snippets
  useEffect(() => {
    fetch("/code/HashTable/chaining_insert.txt")
      .then((res) => res.text())
      .then((text) => setChainingInsertSnippet(text.split("\n")))
      .catch((err) => console.error("Error loading code:", err));
  }, []);

  useEffect(() => {
    fetch("/code/HashTable/chaining_delete.txt")
      .then((res) => res.text())
      .then((text) => setChainingDeleteSnippet(text.split("\n")))
      .catch((err) => console.error("Error loading code:", err));
  }, []);

  useEffect(() => {
    fetch("/code/HashTable/chaining_search.txt")
      .then((res) => res.text())
      .then((text) => setChainingSearchSnippet(text.split("\n")))
      .catch((err) => console.error("Error loading code:", err));
  }, []);

  useEffect(() => {
    fetch("/code/HashTable/linear_insert.txt")
      .then((res) => res.text())
      .then((text) => setLinearInsertSnippet(text.split("\n")))
      .catch((err) => console.error("Error loading code:", err));
  }, []);

  useEffect(() => {
    fetch("/code/HashTable/linear_delete.txt")
      .then((res) => res.text())
      .then((text) => setLinearDeleteSnippet(text.split("\n")))
      .catch((err) => console.error("Error loading code:", err));
  }, []);

  useEffect(() => {
    fetch("/code/HashTable/linear_search.txt")
      .then((res) => res.text())
      .then((text) => setLinearSearchSnippet(text.split("\n")))
      .catch((err) => console.error("Error loading code:", err));
  }, []);

  useEffect(() => {
    fetch("/code/HashTable/entry.txt")
      .then((res) => res.text())
      .then((text) => setNodeSnippet(text))
      .catch((err) => console.error("Error loading code:", err));
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    resetAndSeedTable(hashMode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper to reset tableRef and VM based on a mode
  const resetAndSeedTable = React.useCallback((mode) => {
    const t = createTableForMode(mode, 8);
    [
      [1, 10],
      [9, 90],
      [17, 170],
      [2, 20],
      [3, 30],
    ].forEach(([k, v]) => t.insert(k, v));
    tableRef.current = t;
    setBucketVM(toViewBuckets(t, mode));
    setSelectedEntryRef(null);
    setSelectedEntryCode(generateEntryCode(null));
  }, [createTableForMode, generateEntryCode]);

  // recreate table + view
  useEffect(() => {
    resetAndSeedTable(hashMode);
    // reset UI highlights
    setActiveBucketIndex(null);
    setActiveEntryIndex(null);
    setAnimating(false);
  }, [hashMode, resetAndSeedTable]);

  // Convert the data structure to the render format
  // chaining: return t.toBucketsArray() (array of arrays)
  // linear: convert snapshot into array-of-singleton-arrays
  function toViewBuckets(t, mode) {
    if (!t) return [];
    if (mode === "chaining") {
      if (typeof t.toBucketsArray === "function") {
        return t.toBucketsArray().map((b) => b.map((e) => ({ ...e, animClass: "" })));
      } else {
        return [];
      }
    } else {
      if (typeof t.snapshot === "function") {
        const snap = t.snapshot();
        return snap.map((s) => {
          if (s === null) return [];
          if (s === "T") return [{ id: "T", key: null, value: "T", animClass: "tombstone" }];
          return [{ ...s, animClass: "" }];
        });
      } else if (typeof t.toBucketsArray === "function") {
        return t.toBucketsArray().map((b) => b.map((e) => ({ ...e, animClass: "" })));
      } else {
        return [];
      }
    }
  }

  const syncBucketVM = () => {
    const arr = toViewBuckets(tableRef.current, hashMode);
    setBucketVM(arr);

    // If selected entry exists, refresh or clear
    if (selectedEntryRef) {
      const still = tableRef.current.search(selectedEntryRef.key);
      if (still) {
        setSelectedEntryRef(still);
        setSelectedEntryCode(generateEntryCode(still));
      } else {
        setSelectedEntryRef(null);
        setSelectedEntryCode(generateEntryCode(null));
      }
    }
  };

  const clickEntry = (entryObj) => {
    if (animating) return;
    setSelectedEntryRef(entryObj);
    setSelectedEntryCode(generateEntryCode(entryObj));
  };

  const findEntryIndexInBucket = (bucketIndex, key) => {
    const bucket = toViewBuckets(tableRef.current, hashMode)[bucketIndex] || [];
    return bucket.findIndex((e) => e.key === Number(key));
  };

  const handleInsert = async () => {
    const k = insertKey.trim();
    const v = insertValue.trim();

    if (verifyInput(k) || verifyInput(v)) {
      alert("Enter valid integers for key and value");
      return;
    }

    if (animating) return;
    setAnimating(true);

    const keyNum = Number(k);
    const valNum = Number(v);

    setInsertKey("");
    setInsertValue("");

    // compute bucket/home index using the hash function
    const bucketIndex =
      typeof tableRef.current._hash === "function"
        ? tableRef.current._hash(keyNum)
        : Math.abs(keyNum) % bucketVM.length;

    setActiveBucketIndex(bucketIndex);
    setActiveEntryIndex(null);

    if (hashMode === "chaining") {
      setCodeSnippet(chainingInsertSnippet);
      // animate chain traversal and insertion at head
      setActiveLine(1);
      await delay(250);

      const bucketBefore = tableRef.current.toBucketsArray()[bucketIndex] || [];
      for (let i = 0; i < bucketBefore.length; i++) {
        setActiveEntryIndex(i);
        setActiveLine(8);
        await delay(300);
        if (bucketBefore[i].key === keyNum) {
          setActiveLine(8);
          await delay(250);
          tableRef.current.insert(keyNum, valNum);
          syncBucketVM();
          const idx = findEntryIndexInBucket(bucketIndex, keyNum);
          setActiveEntryIndex(idx);
          await delay(500);
          setAnimating(false);
          setActiveEntryIndex(null);
          return;
        }
        setActiveLine(8);
        await delay(200);
      }

      setActiveLine(11);
      setBucketVM((prev) => {
        const copy = prev.map((b) => b.map((e) => ({ ...e, animClass: "" })));
        copy[bucketIndex] = [
          { id: "ghost", key: keyNum, value: valNum, animClass: "node-inserting" },
          ...(copy[bucketIndex] || []),
        ];
        return copy;
      });
      await delay(300);

      tableRef.current.insert(keyNum, valNum);
      syncBucketVM();
      const newIdx = findEntryIndexInBucket(bucketIndex, keyNum);
      setActiveEntryIndex(newIdx);
      setActiveLine(13);
      await delay(600);
      setAnimating(false);
      setActiveEntryIndex(null);
      return;
    } else {
      setCodeSnippet(linearInsertSnippet);
      setActiveLine(1);
      await delay(200);

      const size = bucketVM.length;
      let probeIdx = bucketIndex;
      for (let steps = 0; steps < size; steps++) {
        setActiveBucketIndex(probeIdx);
        setActiveEntryIndex(0);
        setActiveLine(12);
        await delay(250);

        const slot = bucketVM[probeIdx] && bucketVM[probeIdx][0];
        if (!slot || slot.id === "T") {
          const insertIdx = probeIdx;
          setBucketVM((prev) => {
            const copy = prev.map((b) => b.map((e) => ({ ...e, animClass: "" })));
            copy[insertIdx] = [{ id: "ghost", key: keyNum, value: valNum, animClass: "node-inserting" }];
            return copy;
          });

          setActiveLine(7); 
          await delay(300);
          tableRef.current.insert(keyNum, valNum);
          syncBucketVM();
          setActiveEntryIndex(0);
          setActiveLine(9);
          await delay(600);
          setAnimating(false);
          setActiveEntryIndex(null);
          return;
        } else if (slot.key === keyNum) {
          setActiveLine(5);
          await delay(250);
          tableRef.current.insert(keyNum, valNum); // update
          syncBucketVM();
          setActiveEntryIndex(0);
          setActiveLine(9);
          await delay(450);
          setAnimating(false);
          setActiveEntryIndex(null);
          return;
        }

        // advance probe
        setActiveLine(11);
        probeIdx = (probeIdx + 1) % size;
        await delay(200);
      }

      alert("Table is full (cannot insert)");
      setAnimating(false);
      setActiveEntryIndex(null);
      return;
    }
  };

  const handleSearch = async () => {
    const k = searchKey.trim();
    if (verifyInput(k)) {
      alert("Enter a valid integer key");
      return;
    }
    if (animating) return;
    setAnimating(true);

    const keyNum = Number(k);
    const bucketIndex =
      typeof tableRef.current._hash === "function"
        ? tableRef.current._hash(keyNum)
        : Math.abs(keyNum) % bucketVM.length;

    setActiveBucketIndex(bucketIndex);
    setActiveEntryIndex(null);
    setActiveLine(1);
    await delay(250);

    if (hashMode === "chaining") {
      setCodeSnippet(chainingSearchSnippet);
      const bucket = tableRef.current.toBucketsArray()[bucketIndex] || [];
      setActiveLine(1);
      await delay(200);

      for (let i = 0; i < bucket.length; i++) {
        setActiveEntryIndex(i);
        setActiveLine(8);
        await delay(400);
        if (bucket[i].key === keyNum) {
          setActiveLine(6);
          clickEntry(bucket[i]);
          await delay(550);
          setAnimating(false);
          setActiveEntryIndex(null);
          setSearchKey("");
          return;
        }
        setActiveLine(8);
        await delay(250);
      }

      setActiveLine(8);
      await delay(250);
      alert("Key not found.");
      setAnimating(false);
      setActiveEntryIndex(null);
      setSearchKey("");
      return;
    } else {
      setCodeSnippet(linearSearchSnippet);
      const size = bucketVM.length;
      let probeIdx = bucketIndex;
      for (let steps = 0; steps < size; steps++) {
        setActiveBucketIndex(probeIdx);
        setActiveEntryIndex(0);
        setActiveLine(7);
        await delay(300);

        const slotArr = toViewBuckets(tableRef.current, hashMode)[probeIdx] || [];
        const slot = slotArr[0];
        if (!slot) {
          setActiveLine(7);
          await delay(200);
          alert("Key not found.");
          setAnimating(false);
          setActiveEntryIndex(null);
          setSearchKey("");
          return;
        }
        if (slot.id === "T") {
          setActiveLine(5);
          await delay(180);
          probeIdx = (probeIdx + 1) % size;
          continue;
        }
        if (slot.key === keyNum) {
          setActiveLine(6);
          clickEntry(tableRef.current.search(keyNum));
          await delay(550);
          setAnimating(false);
          setActiveEntryIndex(null);
          setSearchKey("");
          return;
        }

        // otherwise continue probing
        setActiveLine(11);
        probeIdx = (probeIdx + 1) % size;
        await delay(200);
      }

      alert("Key not found.");
      setAnimating(false);
      setActiveEntryIndex(null);
      setSearchKey("");
      return;
    }
  };

  const handleDelete = async () => {
    const k = deleteKey.trim();
    if (verifyInput(k)) {
      alert("Enter a valid integer key");
      return;
    }
    if (animating) return;
    setAnimating(true);

    const keyNum = Number(k);
    const bucketIndex =
      typeof tableRef.current._hash === "function"
        ? tableRef.current._hash(keyNum)
        : Math.abs(keyNum) % bucketVM.length;

    setActiveBucketIndex(bucketIndex);
    setActiveEntryIndex(null);
    setActiveLine(1);
    await new Promise((r) => setTimeout(r, 250));

    if (hashMode === "chaining") {
      setCodeSnippet(chainingDeleteSnippet);
      const bucket = tableRef.current.toBucketsArray()[bucketIndex] || [];
      setActiveLine(1);
      await delay(250);

      for (let i = 0; i < bucket.length; i++) {
        setActiveEntryIndex(i);
        setActiveLine(6);
        await delay(450);
        if (bucket[i].key === keyNum) {
          setActiveLine(7);
          await delay(250);
          setBucketVM((prev) => {
            const copy = prev.map((b) => b.map((e) => ({ ...e })));
            if (copy[bucketIndex] && copy[bucketIndex][i]) {
              copy[bucketIndex][i].animClass = "node-deleting";
            }
            return copy;
          });
          setActiveLine(9);
          await delay(600);
          tableRef.current.delete(keyNum);
          syncBucketVM();
          setActiveLine(10);
          await delay(250);
          setAnimating(false);
          setActiveEntryIndex(null);
          setDeleteKey("");
          return;
        }
        setActiveLine(12);
        await delay(250);
      }

      setActiveLine(15);
      await delay(300);
      alert("Key not found.");
      setAnimating(false);
      setActiveEntryIndex(null);
      setDeleteKey("");
      return;
    } else {
      setCodeSnippet(linearDeleteSnippet);
      const size = bucketVM.length;
      let probeIdx = bucketIndex;
      for (let steps = 0; steps < size; steps++) {
        setActiveBucketIndex(probeIdx);
        setActiveEntryIndex(0);
        setActiveLine(10);
        await delay(300);

        const slotArr = toViewBuckets(tableRef.current, hashMode)[probeIdx] || [];
        const slot = slotArr[0];
        if (!slot) {
          setActiveLine(7);
          await delay(200);
          alert("Key not found.");
          setAnimating(false);
          setActiveEntryIndex(null);
          setDeleteKey("");
          return;
        }
        if (slot.id === "T"){
          setActiveLine(5);
          probeIdx = (probeIdx + 1) % size;
          await delay(100);
          continue;
        }
        if (slot.key === keyNum) {
          const deleteIdx = probeIdx;
          setBucketVM((prev) => {
            const copy = prev.map((b) => b.map((e) => ({ ...e })));
            if (copy[deleteIdx] && copy[deleteIdx][0]) {
              copy[deleteIdx][0].animClass = "node-deleting";
            }
            return copy;
          });
          setActiveLine(8);
          await delay(450);
          tableRef.current.delete(keyNum);
          syncBucketVM();
          setActiveLine(10);
          await delay(200);
          setAnimating(false);
          setActiveEntryIndex(null);
          setDeleteKey("");
          return;
        }
        // else continue probing
        setActiveLine(11);
        probeIdx = (probeIdx + 1) % size;
        await delay(200);
      }

      alert("Key not found.");
      setAnimating(false);
      setActiveEntryIndex(null);
      setDeleteKey("");
      return;
    }
  };

  return (
    <div className="hashtable-page">
      <h1 className="page-title">Hash Table</h1>

      <Link to="/" className="back-icon">
        <img src="/favicon.ico" alt="Back to Home" />
      </Link>

      <div className="hashtable-content">
        {/* Visualization */}
        <div className="visualization-area">
          <div className="buckets-container">
            {bucketVM.map((bucket, bIdx) => (
              <div
                key={bIdx}
                className={`bucket-row ${activeBucketIndex === bIdx ? "bucket-active" : ""}`}
              >
                <div className="bucket-index">{bIdx}</div>

                <div className="bucket-chain">
                  {bucket.length === 0 ? (
                    <div className="bucket-empty">∅</div>
                  ) : (
                    bucket.map((entry, eIdx) => (
                      <React.Fragment key={`${entry.id}-${eIdx}`}>
                        <div
                          className={`node-box entry-node
                            ${entry.animClass || ""}
                            ${
                              activeBucketIndex === bIdx && activeEntryIndex === eIdx
                                ? "node-highlight"
                                : ""
                            }
                          `}
                          onClick={() =>
                            entry.id !== "ghost" &&
                            clickEntry(
                              tableRef.current.search(entry.key) || entry
                            )
                          }
                          title="Click to inspect entry"
                        >
                          {/* Show T for tombstones */}
                          {entry.id === "T" ? "T" : `${entry.key}:${entry.value}`}
                        </div>
                        {hashMode === "chaining" && eIdx < bucket.length - 1 && <div className="arrow">→</div>}
                      </React.Fragment>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side actions */}
        <div className="side-actions">
          {/* Nodes panel */}
          <div className="panel nodes-panel">
            <div className="panel-header" onClick={() => togglePanel("nodes")}>
              <div className={`triangle-icon ${openPanels.nodes ? "open" : ""}`}></div>
              <h3>Nodes</h3>
            </div>

            {openPanels.nodes && (
              <div className="panel-body nodes-body">
                <div className="code-panel small">
                  <pre>
                    <code>{selectedEntryCode !== "" ? selectedEntryCode : nodeSnippet}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Actions panel */}
          <div className="panel actions-panel">
            <div className="panel-header" onClick={() => togglePanel("actions")}>
              <div className={`triangle-icon ${openPanels.actions ? "open" : ""}`}></div>
              <h3>Actions</h3>
            </div>

            {openPanels.actions && (
              <div className="panel-body actions-body">
                <div className="actions-row">
                  <button className="actions-button" onClick={handleInsert} disabled={animating}>
                    Insert
                  </button>
                  <input
                    type="text"
                    placeholder="Key"
                    value={insertKey}
                    onChange={(e) => setInsertKey(e.target.value)}
                    disabled={animating}
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={insertValue}
                    onChange={(e) => setInsertValue(e.target.value)}
                    disabled={animating}
                  />
                </div>

                <div className="actions-row">
                  <button className="actions-button" onClick={handleDelete} disabled={animating}>
                    Delete
                  </button>
                  <input
                    type="text"
                    placeholder="Key"
                    value={deleteKey}
                    onChange={(e) => setDeleteKey(e.target.value)}
                    disabled={animating}
                  />
                </div>

                <div className="actions-row">
                  <button className="actions-button" onClick={handleSearch} disabled={animating}>
                    Search
                  </button>
                  <input
                    type="text"
                    placeholder="Key"
                    value={searchKey}
                    onChange={(e) => setSearchKey(e.target.value)}
                    disabled={animating}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Hash Table panel */}
          <div className="panel hashtable-panel">
            <div className="panel-header" onClick={() => togglePanel("hashTable")}>
              <div className={`triangle-icon ${openPanels.hashTable ? "open" : ""}`}></div>
              <h3>Hash Table</h3>
            </div>

            {openPanels.hashTable && (
              <div className="panel-body hashtable-body">
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <label>
                    <input
                      type="radio"
                      name="hashMode"
                      value="chaining"
                      checked={hashMode === "chaining"}
                      onChange={() => setHashMode("chaining")}
                      disabled={animating}
                    />{" "}
                    Chaining
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="hashMode"
                      value="linear"
                      checked={hashMode === "linear"}
                      onChange={() => setHashMode("linear")}
                      disabled={animating}
                    />{" "}
                    Linear Probing
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Code viewer */}
        <div className="code-panel">
          <pre>
            {codeSnippet.map((line, i) => (
              <div key={i} className={`code-line ${activeLine === i ? "highlight-line" : ""}`}>
                {line}
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default HashTablePage;