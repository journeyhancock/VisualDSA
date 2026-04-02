import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import "./styles/HashTableQuiz.css";

import {
  LinearProbingHashTable,
  ChainingHashTable,
} from "../data_structures/HashTables";

function ChainingBucketRow({ bucketIdx, entries, onDelete, onAdd }) {
  const [form, setForm] = useState(null);

  const openForm = () => setForm({ key: "", value: "" });
  const closeForm = () => setForm(null);

  const commit = () => {
    if (!form) return;
    const k = form.key.trim();
    const v = form.value.trim();
    if (!verifyInput(k) && !verifyInput(v)) {
      onAdd(bucketIdx, Number(k), Number(v));
    }
    closeForm();
  };

  return (
    <div className="bucket-row">
      <div className="bucket-index">{bucketIdx}</div>
      <div className="bucket-chain">
        {entries.map((entry, chipIdx) => (
          <React.Fragment key={chipIdx}>
            {chipIdx > 0 && <span className="chain-arrow">→</span>}
            <div className="chip">
              <span className="chip-key">{entry.key}</span>
              <span className="chip-sep">:</span>
              <span className="chip-val">{entry.value}</span>
              <button className="chip-delete" title="Remove" onClick={() => onDelete(bucketIdx, chipIdx)}>✕</button>
            </div>
          </React.Fragment>
        ))}

        {entries.length === 0 && !form && (
          <span className="bucket-empty-label">empty</span>
        )}

        {form ? (
          <div className="bucket-add-form">
            {entries.length > 0 && <span className="chain-arrow">→</span>}
            <input
              className="bucket-add-input"
              placeholder="key"
              autoFocus
              value={form.key}
              onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))}
              onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") closeForm(); }}
            />
            <span className="bucket-add-sep">:</span>
            <input
              className="bucket-add-input"
              placeholder="value"
              value={form.value}
              onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
              onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") closeForm(); }}
            />
            <button className="bucket-add-confirm" onMouseDown={(e) => { e.preventDefault(); commit(); }}>✓</button>
            <button className="bucket-add-cancel" onMouseDown={(e) => { e.preventDefault(); closeForm(); }}>✕</button>
          </div>
        ) : (
          <button className="bucket-add-btn" title="Add entry" onClick={openForm}>+</button>
        )}
      </div>
    </div>
  );
}

function LinearSlotCard({ slotIdx, slot, onDelete, onClear, onAdd }) {
  const [editKey, setEditKey] = useState("");
  const [editValue, setEditValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const isEmpty = slot === null;
  const isTombstone = slot === "T";
  const isFilled = !isEmpty && !isTombstone;

  const openEdit = () => { setEditKey(""); setEditValue(""); setIsEditing(true); };
  const closeEdit = () => setIsEditing(false);

  const commit = () => {
    const k = editKey.trim();
    const v = editValue.trim();
    if (!verifyInput(k) && !verifyInput(v)) {
      onAdd(slotIdx, Number(k), Number(v));
    }
    closeEdit();
  };

  return (
    <div className="linear-slot-row">
      <div className="bucket-index">{slotIdx}</div>
      <div className={`linear-slot-card ${isFilled ? "filled" : ""} ${isTombstone ? "tombstone" : ""} ${isEmpty ? "empty" : ""}`}>
        {isEditing ? (
          <div className="linear-slot-edit-form">
            <input className="linear-slot-input" placeholder="key" autoFocus value={editKey}
              onChange={(e) => setEditKey(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") closeEdit(); }} />
            <span className="linear-slot-sep">:</span>
            <input className="linear-slot-input" placeholder="value" value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") closeEdit(); }} />
            <button className="bucket-add-confirm" onMouseDown={(e) => { e.preventDefault(); commit(); }}>✓</button>
            <button className="bucket-add-cancel" onMouseDown={(e) => { e.preventDefault(); closeEdit(); }}>✕</button>
          </div>
        ) : isFilled ? (
          <div className="linear-slot-filled-content">
            <span className="linear-kv">
              <span className="chip-key">{slot.key}</span>
              <span className="chip-sep">:</span>
              <span className="chip-val">{slot.value}</span>
            </span>
            <button className="linear-slot-delete-btn" title="Delete (tombstone)" onClick={() => onDelete(slotIdx)}>✕</button>
          </div>
        ) : isTombstone ? (
          <div className="linear-slot-tombstone-content">
            <span className="tombstone-label">T</span>
            <button className="linear-slot-clear-btn" title="Clear tombstone" onClick={() => onClear(slotIdx)}>✕</button>
          </div>
        ) : (
          <button className="linear-slot-empty-btn" title="Insert here" onClick={openEdit}>
            <span className="linear-empty-plus">+</span>
            <span className="linear-empty-label">empty</span>
          </button>
        )}
      </div>
    </div>
  );
}

function verifyInput(value) {
  return !Number.isInteger(Number(value)) || value === "" || value.includes(".");
}

function makeRandomKeyValue(maxKey = 40, maxVal = 199) {
  return {
    key: Math.floor(Math.random() * maxKey) + 1,
    value: Math.floor(Math.random() * maxVal) + 1,
  };
}

export default function HashTableQuizPage() {
  const TABLE_SIZE = 7;
  const [mode, setMode] = useState("chaining");
  const htRef = useRef(null);

  const [chainingBuckets, setChainingBuckets] = useState(
    Array.from({ length: TABLE_SIZE }, () => [])
  );
  const [linearSlots, setLinearSlots] = useState(
    Array.from({ length: TABLE_SIZE }, () => null)
  );

  const [helpOpen, setHelpOpen] = useState(false);
  const [question, setQuestion] = useState({});
  const [feedbackShowing, setFeedbackShowing] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [answerShown, setAnswerShown] = useState(false);
  const [isInsert, setIsInsert] = useState(false);

  function createEmptyTableForMode(modeArg) {
    return modeArg === "linear"
      ? new LinearProbingHashTable(TABLE_SIZE)
      : new ChainingHashTable(TABLE_SIZE);
  }

  function dsToState(ds, modeArg) {
    if (modeArg === "chaining") {
      return ds.toBucketsArray().map((b) => b.map((e) => ({ key: e.key, value: e.value })));
    } else {
      return ds.snapshot().map((s) => {
        if (s === null) return null;
        if (s === "T") return "T";
        return { key: s.key, value: s.value };
      });
    }
  }

  const createQuestion = useCallback(() => {
    const baseCount = Math.floor(Math.random() * 4) + 2;
    const baseSet = new Set();
    while (baseSet.size < baseCount) {
      baseSet.add(JSON.stringify(makeRandomKeyValue(40, 199)));
    }
    const basePairs = [...baseSet].map((s) => JSON.parse(s));

    const baseDS = createEmptyTableForMode(mode);
    basePairs.forEach((p) => baseDS.insert(p.key, p.value));
    const expectedDS = createEmptyTableForMode(mode);
    basePairs.forEach((p) => expectedDS.insert(p.key, p.value));

    const isInsert = Math.random() < 0.5;
    let prompt, expectedSnapshot;

    if (isInsert) {
      setIsInsert(true);
      const newKV = makeRandomKeyValue(40, 199);
      expectedDS.insert(newKV.key, newKV.value);
      prompt = `What does the hash table look like after Insert(key=${newKV.key}, value=${newKV.value})?`;
      expectedSnapshot = mode === "chaining" ? expectedDS.toBucketsArray() : expectedDS.snapshot();
      setQuestion({ type: "insert", value: newKV, prompt, expectedSnapshot, baseSnapshot: dsToState(baseDS, mode) });
    } else {
      setIsInsert(false);
      const choice = basePairs[Math.floor(Math.random() * basePairs.length)];
      expectedDS.delete(choice.key);
      prompt = `What does the hash table look like after Delete(key=${choice.key})?`;
      expectedSnapshot = mode === "chaining" ? expectedDS.toBucketsArray() : expectedDS.snapshot();
      setQuestion({ type: "delete", value: { key: choice.key }, prompt, expectedSnapshot, baseSnapshot: dsToState(baseDS, mode) });
    }

    htRef.current = baseDS;
    if (mode === "chaining") {
      setChainingBuckets(dsToState(baseDS, "chaining"));
    } else {
      setLinearSlots(dsToState(baseDS, "linear"));
    }

    setFeedbackShowing(false);
    setIsCorrect(false);
    setAnswerShown(false);
  }, [mode]);

  useEffect(() => {
    createQuestion();
  }, [createQuestion]);

  const handleChainDelete = (bucketIdx, chipIdx) => {
    setChainingBuckets((prev) => {
      const next = prev.map((b) => [...b]);
      next[bucketIdx] = next[bucketIdx].filter((_, i) => i !== chipIdx);
      return next;
    });
  };

  const handleChainAdd = (bucketIdx, key, value) => {
    setChainingBuckets((prev) => {
      const next = prev.map((b) => [...b]);
      next[bucketIdx] = [{ key, value }, ...next[bucketIdx]];
      return next;
    });
  };

  const handleLinearSlotDelete = (idx) => {
    setLinearSlots((prev) => { const next = [...prev]; next[idx] = "T"; return next; });
  };

  const handleClearTombstone = (idx) => {
    setLinearSlots((prev) => { const next = [...prev]; next[idx] = null; return next; });
  };

  const handleLinearAdd = (idx, key, value) => {
    setLinearSlots((prev) => { const next = [...prev]; next[idx] = { key, value }; return next; });
  };

  const handleSubmit = () => {
    const expected = question.expectedSnapshot || [];
    if (mode === "chaining") {
      const equal =
        chainingBuckets.length === expected.length &&
        chainingBuckets.every((b, i) => {
          const exp = expected[i] || [];
          if (b.length !== exp.length) return false;
          return b.every((v, j) => v.key === exp[j].key && v.value === exp[j].value);
        });
      setIsCorrect(equal);
    } else {
      if (linearSlots.length !== expected.length) { setIsCorrect(false); setFeedbackShowing(true); return; }
      const equal = linearSlots.every((slot, i) => {
        const exp = expected[i];
        if (slot === null) return exp === null;
        if (slot === "T") return exp === "T";
        if (!exp || exp === "T") return false;
        return slot.key === exp.key && slot.value === exp.value;
      });
      setIsCorrect(equal);
    }
    setFeedbackShowing(true);
  };

  const HelpModal = () => (
    <div className="help-modal-backdrop" onClick={() => setHelpOpen(false)}>
      <div className="help-modal" onClick={(e) => e.stopPropagation()}>
        <div className="help-modal-header">
          <h2>How to use the Hash Table Quiz</h2>
          <button className="help-modal-close" onClick={() => setHelpOpen(false)}>✕</button>
        </div>
        <div className="help-modal-body">
          <p>
            The quiz asks you to simulate a hash table operation. Edit the table on the left
            to match the result of running that operation.
          </p>
          <h4>Chaining mode:</h4>
          <ul className="help-list">
            <li>Each row is a bucket (index shown on the left).</li>
            <li>Entries are shown as <strong>key:value</strong> chips linked with arrows.</li>
            <li>Click <strong>+</strong> at the end of a row to add an entry. New entries insert at the head.</li>
            <li>Click X on a chip to remove it.</li>
          </ul>
          <h4>Linear probing mode:</h4>
          <ul className="help-list">
            <li>Each row is a slot that is either empty, filled, or a tombstone (<strong>T</strong>).</li>
            <li>Click an <strong>empty</strong> slot to insert a key:value pair there.</li>
            <li>Click X on a filled slot to delete it, which places a tombstone.</li>
            <li>Click X on a tombstone to fully clear that slot.</li>
          </ul>
          <p className="help-note">
            Tip: The hash function is <code>key % table length</code> (default of 7). Use this to work out which bucket/slot a key belongs to.
          </p>
        </div>
      </div>
    </div>
  );

  const handleShowAnswer = () => {
    const expected = question.expectedSnapshot || [];
    if (mode === "chaining") {
      setChainingBuckets(expected.map((b) => b.map((e) => ({ key: e.key, value: e.value }))));
    } else {
      setLinearSlots(expected.map((s) => {
        if (s === null) return null;
        if (s === "T") return "T";
        return { key: s.key, value: s.value };
      }));
    }
    setAnswerShown(true);
    setFeedbackShowing(false);
  };

  const AnswerFeedback = () =>
    feedbackShowing && (
      <div className="answer-feedback-popup quiz-overlay">
        <div className="popup-content">
          <h3 className={isCorrect ? "correct-text" : "incorrect-text"}>
            {isCorrect ? "Correct!" : "Incorrect"}
          </h3>
          <button
            onClick={() => {
              setFeedbackShowing(false);
              if (isCorrect) {
                createQuestion();
              } else {
                const base = question.baseSnapshot || [];
                if (mode === "chaining") {
                  setChainingBuckets(base.map((b) => b.map((e) => ({ key: e.key, value: e.value }))));
                } else {
                  setLinearSlots(base.map((s) => {
                    if (s === null) return null;
                    if (s === "T") return "T";
                    return { key: s.key, value: s.value };
                  }));
                }
                setAnswerShown(false);
              }
            }}
            className="quiz-button"
          >
            {isCorrect ? "Next Question" : "Try Again"}
          </button>
          {!isCorrect && (
            <button
              className="quiz-button"
              style={{ marginTop: "0.5rem" }}
              onClick={() => { setFeedbackShowing(false); createQuestion(); }}
            >
              New Question
            </button>
          )}
          {!isCorrect && (
            <button
              className="quiz-button show-answer-btn"
              style={{ marginTop: "0.5rem" }}
              onClick={handleShowAnswer}
            >
              Show Answer
            </button>
          )}
        </div>
      </div>
    );

  return (
    <div className="quiz-page">
      <h1 className="page-title">Hash Table Quiz</h1>
      <Link to="/" className="back-icon">
        <img src="/favicon.ico" alt="Back" />
      </Link>

      {helpOpen && <HelpModal />}

      <div className="hashtable-quiz-content">
        {/* Visualization */}
        <div className="visualization-area">
          <p className="interaction-hint">
            {mode === "chaining"
              ? <>Click <strong>+</strong> to add an entry to a bucket · Click X on a chip to remove it</>
              : <>Click an empty slot to insert · Click X on a filled slot to delete (tombstone) · Click X on <strong>T</strong> to clear</>
            }
          </p>
          {answerShown && (
            <p className="answer-shown-banner">Showing correct answer</p>
          )}
          <div className="buckets-container">
            {mode === "chaining"
              ? chainingBuckets.map((entries, i) => <ChainingBucketRow key={i} bucketIdx={i} entries={entries} onDelete={handleChainDelete} onAdd={handleChainAdd} />)
              : linearSlots.map((slot, i) => <LinearSlotCard key={i} slotIdx={i} slot={slot} onDelete={handleLinearSlotDelete} onClear={handleClearTombstone} onAdd={handleLinearAdd} />)
            }
          </div>
        </div>

        {/* Mode switcher */}
        <div className="side-actions">
          <div className="mode-switcher">
            <button className={`mode-btn ${mode === "chaining" ? "active" : ""}`} onClick={() => setMode("chaining")}>
              Chaining
            </button>
            <button className={`mode-btn ${mode === "linear" ? "active" : ""}`} onClick={() => setMode("linear")}>
              Linear Probing
            </button>
          </div>
        </div>

        {/* Quiz prompt */}
        <div className="quiz-container">
          <p className="quiz-title">{question.prompt}</p>
          {(isInsert) && (
            <p className="hash-fn-hint">using hash function: key % {TABLE_SIZE}</p>
          )}
          <button className="help-btn" onClick={() => setHelpOpen(true)}>? Help</button>
          <div className="quiz-navigation">
            <button className="quiz-button" onClick={handleSubmit}>Submit</button>
            <button className="quiz-button" onClick={createQuestion}>New Question</button>
          </div>
          <AnswerFeedback />
        </div>
      </div>
    </div>
  );
}