// HashTableQuiz.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import "./styles/HashTableQuiz.css";

import {
  LinearProbingHashTable,
  ChainingHashTable,
} from "../data_structures/HashTables"; // adjust path if needed

function verifyInput(value) {
  return !Number.isInteger(Number(value)) || value === "" || value.includes(".");
}

function formatChainingBucket(arr) {
  return arr.length ? arr.map((e) => `${e.key}:${e.value}`).join(", ") : "";
}

function parseChainingBucket(str) {
  const trimmed = (str ?? "").trim();
  if (!trimmed) return [];
  const parts = trimmed
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p !== "");
  const out = [];
  for (const part of parts) {
    const [kStr, vStr] = part.split(":").map((t) => (t ? t.trim() : ""));
    if (vStr === undefined || verifyInput(kStr) || verifyInput(vStr)) return null;
    out.push({ key: Number(kStr), value: Number(vStr) });
  }
  return out;
}

function formatLinearSlot(slot) {
  if (slot === null) return "";
  if (slot === "T") return "T";
  return `${slot.key}:${slot.value}`;
}

function parseLinearSlot(str) {
  const s = (str ?? "").trim();
  if (s === "") return null;
  if (s.toUpperCase() === "T") return "T";
  const [kStr, vStr] = s.split(":").map((t) => (t ? t.trim() : ""));
  if (vStr === undefined || verifyInput(kStr) || verifyInput(vStr)) return null;
  return { key: Number(kStr), value: Number(vStr) };
}

function makeRandomKeyValue(maxKey = 20, maxVal = 199) {
  return {
    key: Math.floor(Math.random() * maxKey) + 1,
    value: Math.floor(Math.random() * maxVal) + 1,
  };
}

export default function HashTableQuizPage() {
  const TABLE_SIZE = 8;
  const [mode, setMode] = useState("chaining"); // 'chaining' or 'linear'
  const htRef = useRef(null);

  const [bucketStrings, setBucketStrings] = useState(
    Array.from({ length: TABLE_SIZE }, () => "")
  );

  const [openPanels, setOpenPanels] = useState({
    textInput: false,
    insert: false,
    delete: false,
    mode: false,
  });

  // Insert fields (used for both chaining and linear now)
  const [insertHashIndex, setInsertHashIndex] = useState("");
  const [insertKey, setInsertKey] = useState("");
  const [insertValue, setInsertValue] = useState("");

  // Delete fields
  const [deleteHashIndex, setDeleteHashIndex] = useState("");
  const [deleteKey, setDeleteKey] = useState("");
  // For chaining delete: index into the linked list (0-based head-first)
  const [deleteChainIndex, setDeleteChainIndex] = useState("");

  const [question, setQuestion] = useState({});
  const [feedbackShowing, setFeedbackShowing] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const togglePanel = (p) =>
    setOpenPanels((prev) => ({ ...prev, [p]: !prev[p] }));

  function createEmptyTableForMode(modeArg) {
    return modeArg === "linear"
      ? new LinearProbingHashTable(TABLE_SIZE)
      : new ChainingHashTable(TABLE_SIZE);
  }

  function snapshotToStrings(ds, modeArg) {
    if (!ds) return Array.from({ length: TABLE_SIZE }, () => "");
    if (modeArg === "chaining") {
      const buckets = ds.toBucketsArray();
      return buckets.map((b) => formatChainingBucket(b));
    } else {
      const snap = ds.snapshot();
      return snap.map((s) => formatLinearSlot(s));
    }
  }

  function stringsToDS(strings, modeArg) {
    const ds = createEmptyTableForMode(modeArg);
    if (modeArg === "chaining") {
      for (let i = 0; i < strings.length; i++) {
        const parsed = parseChainingBucket(strings[i]);
        if (parsed === null) return null;
        for (let j = parsed.length - 1; j >= 0; j--) {
          ds.insert(parsed[j].key, parsed[j].value);
        }
      }
      return ds;
    } else {
      const parsedSlots = [];
      for (const s of strings) {
        const p = parseLinearSlot(s);
        if (p === null) {
          const up = (s ?? "").trim();
          if (up.toUpperCase() === "T" || up === "") {
            parsedSlots.push(up.toUpperCase() === "T" ? "T" : null);
            continue;
          }
          return null;
        }
        parsedSlots.push(p === "T" ? "T" : p);
      }
      // Build DS by inserting entries found
      const entries = parsedSlots
        .map((s) => (s === null || s === "T" ? null : { k: s.key, v: s.value }))
        .filter(Boolean);
      const ds2 = createEmptyTableForMode(modeArg);
      entries.forEach((e) => ds2.insert(e.k, e.v));
      return { ds: ds2, parsedSlots };
    }
  }

  const createQuestion = () => {
    const baseCount = Math.floor(Math.random() * 4) + 4;
    const baseSet = new Set();
    while (baseSet.size < baseCount) {
      const kv = makeRandomKeyValue(40, 199);
      baseSet.add(JSON.stringify(kv));
    }
    const basePairs = [...baseSet].map((s) => JSON.parse(s));

    const baseDS = createEmptyTableForMode(mode);
    basePairs.forEach((p) => baseDS.insert(p.key, p.value));

    const expectedDS = createEmptyTableForMode(mode);
    basePairs.forEach((p) => expectedDS.insert(p.key, p.value));

    const isInsert = Math.random() < 0.5;
    if (isInsert) {
      const newKV = makeRandomKeyValue(40, 199);
      expectedDS.insert(newKV.key, newKV.value);
      const prompt = `Edit the Hash Table as if Insert(${newKV.key}, ${newKV.value}) was run.`;
      htRef.current = baseDS;
      setBucketStrings(snapshotToStrings(baseDS, mode));
      setQuestion({
        type: "insert",
        value: newKV,
        prompt,
        expectedSnapshot:
          mode === "chaining" ? expectedDS.toBucketsArray() : expectedDS.snapshot(),
      });
    } else {
      const choice = basePairs[Math.floor(Math.random() * basePairs.length)];
      expectedDS.delete(choice.key);
      const prompt = `Edit the Hash Table as if Delete(${choice.key}) was run.`;
      htRef.current = baseDS;
      setBucketStrings(snapshotToStrings(baseDS, mode));
      setQuestion({
        type: "delete",
        value: { key: choice.key },
        prompt,
        expectedSnapshot:
          mode === "chaining" ? expectedDS.toBucketsArray() : expectedDS.snapshot(),
      });
    }

    // clear panels
    setInsertHashIndex("");
    setInsertKey("");
    setInsertValue("");
    setDeleteHashIndex("");
    setDeleteKey("");
    setDeleteChainIndex("");
    setFeedbackShowing(false);
    setIsCorrect(false);
  };

  useEffect(() => {
    createQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleInsert = () => {
    // Both chaining and linear now require an index input (bucket/hash) per earlier requirement.
    // But for linear mode we DON'T check the index — the user must compute it themselves.
    const idxStr = insertHashIndex.trim();
    const kStr = insertKey.trim();
    const vStr = insertValue.trim();

    if (verifyInput(idxStr) || verifyInput(kStr) || verifyInput(vStr)) {
      alert("Enter valid integers for bucket/hash index, key and value");
      return;
    }
    const idx = Number(idxStr);
    const k = Number(kStr);
    const v = Number(vStr);

    const ds = htRef.current || createEmptyTableForMode(mode);

    if (mode === "chaining") {
      // For chaining still verify that user provided the correct bucket index (to quiz use)
      if (typeof ds._hash !== "function") {
        alert("Cannot verify hash/bucket for this DS implementation.");
        return;
      }
      const expectedHash = ds._hash(k);
      if (expectedHash !== idx) {
        alert(
          `Bucket index mismatch: for key ${k} the hash function gives ${expectedHash}, but you provided ${idx}.`
        );
        return;
      }
      // Insert at head as usual
      ds.insert(k, v);
      setBucketStrings(snapshotToStrings(ds, mode));
      setInsertHashIndex("");
      setInsertKey("");
      setInsertValue("");
      htRef.current = ds;
      return;
    }

    // Linear probing: DO NOT verify the provided index. The user is quizzed on their calculation.
    // We still perform the insert on the DS and update snapshot (the UI gives both manual-edit and action workflows).
    ds.insert(k, v);
    setBucketStrings(snapshotToStrings(ds, mode));
    setInsertHashIndex("");
    setInsertKey("");
    setInsertValue("");
    htRef.current = ds;
  };

  const handleDelete = () => {
    if (mode === "chaining") {
      const bucketIdxStr = deleteHashIndex.trim();
      const chainIdxStr = deleteChainIndex.trim();
      const kStr = deleteKey.trim();

      if (verifyInput(bucketIdxStr) || verifyInput(chainIdxStr) || verifyInput(kStr)) {
        alert("Enter valid integers for bucket index, chain index, and key");
        return;
      }
      const bucketIdx = Number(bucketIdxStr);
      const chainIdx = Number(chainIdxStr);
      const k = Number(kStr);

      const ds = htRef.current || createEmptyTableForMode(mode);

      if (typeof ds._hash !== "function") {
        alert("Cannot verify hash for this DS.");
        return;
      }
      const expectedBucket = ds._hash(k);
      if (expectedBucket !== bucketIdx) {
        alert(
          `Bucket index mismatch: for key ${k} the hash gives ${expectedBucket}, but you provided ${bucketIdx}.`
        );
        return;
      }

      // Check that the chain at bucketIdx contains key at chainIdx (head-first)
      const buckets = ds.toBucketsArray();
      const chain = buckets[bucketIdx] || [];
      if (chain.length <= chainIdx) {
        alert(`Chain index ${chainIdx} is out of range for bucket ${bucketIdx}.`);
        return;
      }
      const entry = chain[chainIdx];
      if (!entry || entry.key !== k) {
        alert(
          `The key at bucket ${bucketIdx} index ${chainIdx} is ${entry ? entry.key : "none"}, not ${k}.`
        );
        return;
      }

      ds.delete(k);
      setBucketStrings(snapshotToStrings(ds, mode));
      setDeleteHashIndex("");
      setDeleteKey("");
      setDeleteChainIndex("");
      htRef.current = ds;
      return;
    }

    // Linear delete: user supplies an index (what they think the key is at), but we do NOT verify it.
    const idxStr = deleteHashIndex.trim();
    const kStr = deleteKey.trim();

    if (verifyInput(idxStr) || verifyInput(kStr)) {
      alert("Enter valid integers for hash index and key");
      return;
    }
    const idx = Number(idxStr);
    const k = Number(kStr);

    const ds = htRef.current || createEmptyTableForMode(mode);

    // NOTE: intentionally NOT verifying ds._hash(k) or checking probe sequence.
    ds.delete(k);
    setBucketStrings(snapshotToStrings(ds, mode));
    setDeleteHashIndex("");
    setDeleteKey("");
    htRef.current = ds;
  };

  const handleBucketEdit = (bucketIndex, nextStr) => {
    setBucketStrings((prev) => {
      const copy = [...prev];
      copy[bucketIndex] = nextStr;
      return copy;
    });
  };

  const handleSubmit = () => {
    if (mode === "chaining") {
      const parsedAll = [];
      for (const s of bucketStrings) {
        const parsed = parseChainingBucket(s);
        if (parsed === null) {
          alert("Invalid bucket input. Use comma-separated key:value pairs (e.g. 9:10, 1:2).");
          return;
        }
        parsedAll.push(parsed);
      }
      const expected = question.expectedSnapshot || [];
      const equal =
        parsedAll.length === expected.length &&
        parsedAll.every((b, i) => {
          const exp = expected[i] || [];
          if (b.length !== exp.length) return false;
          return b.every((v, j) => v.key === exp[j].key && v.value === exp[j].value);
        });

      setIsCorrect(equal);
      setFeedbackShowing(true);
      return;
    } else {
      const parsedSlots = [];
      for (const s of bucketStrings) {
        const p = parseLinearSlot(s);
        if (p === null) {
          const up = (s ?? "").trim();
          if (up.toUpperCase() === "T" || up === "") {
            parsedSlots.push(up.toUpperCase() === "T" ? "T" : null);
            continue;
          }
          alert("Invalid linear slot input. Use empty, T, or key:value (e.g. 5:10).");
          return;
        }
        parsedSlots.push(p === "T" ? "T" : p);
      }

      const expected = question.expectedSnapshot || [];
      if (parsedSlots.length !== expected.length) {
        setIsCorrect(false);
        setFeedbackShowing(true);
        return;
      }
      const equal = parsedSlots.every((slot, i) => {
        const exp = expected[i];
        if (slot === null) return exp === null;
        if (slot === "T") return exp === "T";
        if (!exp || exp === "T") return false;
        return slot.key === exp.key && slot.value === exp.value;
      });

      setIsCorrect(equal);
      setFeedbackShowing(true);
      return;
    }
  };

  const AnswerFeedback = () =>
    feedbackShowing && (
      <div className="answer-feedback-popup quiz-overlay">
        <div className="popup-content">
          <h3 className={isCorrect ? "correct-text" : "incorrect-text"}>
            {isCorrect ? "Correct" : "Incorrect"}
          </h3>
          <div style={{ marginTop: 8 }}>
            <button
              onClick={() => {
                setFeedbackShowing(false);
                if (isCorrect) createQuestion();
              }}
              className="quiz-button"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );

  const bucketRows = useMemo(
    () =>
      Array.from({ length: TABLE_SIZE }, (_, i) => ({
        index: i,
        value: bucketStrings[i] ?? "",
      })),
    [bucketStrings]
  );

  return (
    <div className="quiz-page">
      <h1 className="page-title">Hash Table Quiz</h1>

      <Link to="/" className="back-icon">
        <img src="/favicon.ico" alt="Back" />
      </Link>

      <div className="hashtable-quiz-content">
        <div className="visualization-area">
          <div className="buckets-container">
            {bucketRows.map((row) => (
              <div key={row.index} className="bucket-row">
                <div className="bucket-index">{row.index}</div>
                <input
                  className="bucket-input"
                  value={row.value}
                  onChange={(e) => handleBucketEdit(row.index, e.target.value)}
                  placeholder={mode === "chaining" ? "(empty) / 9:10 / 9:12, 1:2" : "(empty) / T / 5:10"}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="side-actions">
          <div className="panel actions-panel">
            <div className="panel-header" onClick={() => togglePanel("mode")}>
              <div className={`triangle-icon ${openPanels.mode ? "open" : ""}`}></div>
              <h3>Mode</h3>
            </div>

            {openPanels.mode && (
              <div className="panel-body actions-body">
                <label>
                  <input
                    type="radio"
                    name="hashMode"
                    value="chaining"
                    checked={mode === "chaining"}
                    onChange={() => {
                      setMode("chaining");
                      createQuestion();
                    }}
                  />{" "}
                  Chaining
                </label>
                <label>
                  <input
                    type="radio"
                    name="hashMode"
                    value="linear"
                    checked={mode === "linear"}
                    onChange={() => {
                      setMode("linear");
                      createQuestion();
                    }}
                  />{" "}
                  Linear Probing
                </label>
              </div>
            )}
          </div>

          <div className="panel actions-panel">
            <div className="panel-header" onClick={() => togglePanel("insert")}>
              <div className={`triangle-icon ${openPanels.insert ? "open" : ""}`}></div>
              <h3>Insert</h3>
            </div>

            {openPanels.insert && (
              <div className="panel-body actions-body">
                {/* For BOTH modes user provides an index now; for chaining it's the bucket index */}
                <input
                  type="text"
                  placeholder="Bucket Index"
                  value={insertHashIndex}
                  onChange={(e) => setInsertHashIndex(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Key"
                  value={insertKey}
                  onChange={(e) => setInsertKey(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={insertValue}
                  onChange={(e) => setInsertValue(e.target.value)}
                />
                <button className="actions-button" onClick={handleInsert}>
                  Insert
                </button>
              </div>
            )}
          </div>

          <div className="panel actions-panel">
            <div className="panel-header" onClick={() => togglePanel("delete")}>
              <div className={`triangle-icon ${openPanels.delete ? "open" : ""}`}></div>
              <h3>Delete</h3>
            </div>

            {openPanels.delete && (
              <div className="panel-body actions-body">
                {mode === "linear" ? (
                  <>
                    <input
                      type="text"
                      placeholder="Bucket Index"
                      value={deleteHashIndex}
                      onChange={(e) => setDeleteHashIndex(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Key"
                      value={deleteKey}
                      onChange={(e) => setDeleteKey(e.target.value)}
                    />
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Bucket Index"
                      value={deleteHashIndex}
                      onChange={(e) => setDeleteHashIndex(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Chain Index (0 = head)"
                      value={deleteChainIndex}
                      onChange={(e) => setDeleteChainIndex(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Key"
                      value={deleteKey}
                      onChange={(e) => setDeleteKey(e.target.value)}
                    />
                  </>
                )}
                <button className="actions-button" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className={`panel help-panel ${openPanels.help ? "help-open" : ""}`}>
            <div
                className="panel-header"
                onClick={() => togglePanel("help")}
            >
                <div
                    className={`triangle-icon ${openPanels.help ? "open" : ""}`}
                ></div>
                <h3>Help</h3>
            </div>
            <div className={`panel help-panel ${openPanels.help ? "help-open" : ""}`}></div>
            {openPanels.help && (
                <div className="panel-body help-body">
                    <div className="help-text" aria-hidden="true">
                      <p>
                        This quiz supports two modes: <strong>Chaining</strong> (buckets with linked lists) and
                        <strong> Linear Probing</strong> (array of slots). Use the Mode panel to switch between them.
                      </p>

                      <p>
                      The quiz question on the right asks you to perform an operation as if you 
                      were the hash table function. For example, <strong>Insert(5, 10)</strong> means to determine how the
                      key <code>5</code> will be inserted into the hash table and how the table would insert it. Then, make the table on 
                      the left match that state.
                      </p>

                        <h4>There are two ways to edit the table:</h4>

                        <ul className="help-list">
                            <li>
                            <strong>Actions</strong> : Use the <em>Insert</em> and <em>Delete</em> dropdowns:
                            <ul>
                                <li><strong>Insert:</strong> supply the bucket index (the leftmost vertically stacked numbers) where the new <code>key:value</code> pair should appear and the <code>key:value</code> values.</li>
                                <li><strong>Delete:</strong> supply the bucket index (the leftmost vertically stacked numbers) where the <code>key:value</code> pair to delete is. For chaining, include the index of the pair in the linked list and the value of the key. For linear probing, just include the new key value (only one pair can exist per bucket).</li>
                            </ul>
                            </li>

                            <li>
                            <strong>Live Editing</strong> : You can also edit the table display directly by clicking a node box
                            and changing the list of <code>key:value</code> pairs. Changes update the table visualization. Make sure to follow 
                            the comma-separated list format (for chaining) and the <code>key:value</code> pair format. You can delete a pair by 
                            simply removing it from the table display. For linear probing, make sure to change it to <code>T</code> instead, to
                            properly represent a deleted pair. 
                            </li>
                        </ul>

                        <p className="help-note">
                            Tip: The hash function used is <code>key % 8</code>.
                        </p>
                        </div>
                </div>
            )}
        </div>
        </div>

        <div className="quiz-container">
          <p className="quiz-title">{question.prompt}</p>
          <div className="quiz-navigation">
            <button className="quiz-button" onClick={handleSubmit}>
              Submit
            </button>
            <button
              className="quiz-button"
              onClick={() => {
                createQuestion();
              }}
            >
              New Question
            </button>
          </div>
          <AnswerFeedback />
        </div>
      </div>
    </div>
  );
}
