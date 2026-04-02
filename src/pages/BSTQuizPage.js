import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { BST } from "../data_structures/BST";
import "../App.css";
import "./styles/BSTQuizPage.css";

const NODE_R     = 25;   // radius of visible circle
const LEVEL_GAP  = 90;  // vertical center to center distance between levels
const BASE_SPREAD = 150;
const MAX_DEPTH  = 4;

const nodeCY = (top) => top + NODE_R;

function treeToLevelOrder(tree) {
    if (!tree.root) return [];
    const queue = [tree.root];
    const result = [];
    while (queue.length > 0) {
        const node = queue.shift();
        if (node) {
            result.push(node.key);
            queue.push(node.left  || null);
            queue.push(node.right || null);
        } else {
            result.push(null);
            queue.push(null);
            queue.push(null);
        }
        if (queue.every(n => n === null)) break;
    }
    while (result.length && result[result.length - 1] === null) result.pop();
    return result;
}

function getVal(arr, i) {
    return (i < arr.length) ? arr[i] : null;
}

function levelOf(idx) {
    return Math.floor(Math.log2(idx + 1));
}

function topOf(idx) {
    return levelOf(idx) * LEVEL_GAP + 30;
}

function xPos(idx) {
    if (idx === 0) return 0;
    const parentIdx = Math.floor((idx - 1) / 2);
    const isLeft    = idx % 2 === 1;
    const level     = levelOf(idx);
    const spread    = BASE_SPREAD / Math.pow(1.5, level - 1);
    return xPos(parentIdx) + (isLeft ? -spread : spread);
}

function bstDeleteFromArray(arr, targetIdx) {
    const a = [...arr];

    function del(idx) {
        if (idx >= a.length || a[idx] === null || a[idx] === undefined) return;
        const left     = 2 * idx + 1;
        const right    = 2 * idx + 2;
        const hasLeft  = left  < a.length && a[left]  !== null && a[left]  !== undefined;
        const hasRight = right < a.length && a[right] !== null && a[right] !== undefined;

        if (!hasLeft && !hasRight) {
            a[idx] = null;
        } else if (hasRight) {
            let succIdx = right;
            while (true) {
                const sl = 2 * succIdx + 1;
                if (sl < a.length && a[sl] !== null && a[sl] !== undefined) succIdx = sl;
                else break;
            }
            a[idx] = a[succIdx];
            del(succIdx);
        } else {
            let predIdx = left;
            while (true) {
                const pr = 2 * predIdx + 2;
                if (pr < a.length && a[pr] !== null && a[pr] !== undefined) predIdx = pr;
                else break;
            }
            a[idx] = a[predIdx];
            del(predIdx);
        }
    }

    del(targetIdx);
    while (a.length && (a[a.length - 1] === null || a[a.length - 1] === undefined)) a.pop();
    return a;
}

function BSTQuizPage() {
    const [nodesArr,         setNodesArr]         = useState([]);
    const [helpOpen,         setHelpOpen]          = useState(false);
    const [editingNodeIndex, setEditingNodeIndex]  = useState(null);
    const [editingNodeValue, setEditingNodeValue]  = useState("");
    const [placeholderInput, setPlaceholderInput]  = useState({});
    const [question,         setQuestion]          = useState({});
    const [feedbackShowing,  setFeedbackShowing]   = useState(false);
    const [isCorrect,        setIsCorrect]         = useState(false);
    const [answerShown,      setAnswerShown]       = useState(false);
    const [isDelete,         setIsDelete]          = useState(false);

    const createQuestion = useCallback(() => {
        const count = Math.floor(Math.random() * 2) + 3;
        const arr   = Array.from({ length: count }, () => Math.floor(Math.random() * 50) + 1);

        const baseTree   = new BST();
        arr.forEach(v => baseTree.insert(v));
        const answerTree = new BST();
        arr.forEach(v => answerTree.insert(v));

        const type = Math.random() < 0.5 ? "insert" : "delete";
        let prompt, answer;

        if (type === "insert") {
            const value = Math.floor(Math.random() * 50) + 1;
            answerTree.insert(value);
            prompt = `What will the BST look like after Insert(${value})?`;
            answer = treeToLevelOrder(answerTree);
            setIsDelete(false);
        } else {
            const delVal = arr[Math.floor(Math.random() * arr.length)];
            answerTree.treeDelete(delVal);
            prompt = `What will the BST look like after Delete(${delVal})?`;
            answer = treeToLevelOrder(answerTree);
            setIsDelete(true);
        }

        setNodesArr(treeToLevelOrder(baseTree));
        setQuestion({ type, prompt, answer, baseSnapshot: treeToLevelOrder(baseTree) });
        setEditingNodeIndex(null);
        setEditingNodeValue("");
        setPlaceholderInput({});
        setFeedbackShowing(false);
        setIsCorrect(false);
        setAnswerShown(false);
    }, []);

    useEffect(() => { createQuestion(); }, [createQuestion]);

    const handleSubmit = () => {
        const trim = (a) => { const c = [...a]; while (c.length && (c[c.length-1] === null || c[c.length-1] === undefined)) c.pop(); return c; };
        const user = trim(nodesArr);
        const exp  = trim(question.answer || []);
        setIsCorrect(user.length === exp.length && user.every((v, i) => v === exp[i]));
        setFeedbackShowing(true);
    };

    const handleDeleteNode = (idx) => {
        setNodesArr(bstDeleteFromArray(nodesArr, idx));
        setPlaceholderInput({});
        setEditingNodeIndex(null);
    };

    const commitNodeEdit = (idx) => {
        const val = editingNodeValue.trim();
        if (val !== "" && !isNaN(Number(val))) {
            const newArr = [...nodesArr];
            newArr[idx] = Number(val);
            setNodesArr(newArr);
        }
        setEditingNodeIndex(null);
        setEditingNodeValue("");
    };

    const commitPlaceholderInsert = (idx) => {
        const val        = (placeholderInput[idx] || "").trim();
        const closeInput = () => setPlaceholderInput(prev => { const n = { ...prev }; delete n[idx]; return n; });
        if (val === "" || isNaN(Number(val))) { closeInput(); return; }
        const newArr = [...nodesArr];
        while (newArr.length <= idx) newArr.push(null);
        newArr[idx] = Number(val);
        setNodesArr(newArr);
        closeInput();
    };

    const renderTree = () => {
        const elements = [];
        const lines    = [];

        const maxRealIdx     = nodesArr.length - 1;
        const maxRealLevel   = maxRealIdx >= 0 ? levelOf(maxRealIdx) : 0;
        const maxRenderLevel = Math.min(maxRealLevel + 1, MAX_DEPTH);

        for (let idx = 0; idx <= maxRealIdx; idx++) {
            const val = getVal(nodesArr, idx);
            if (val === null || val === undefined) continue;

            const level = levelOf(idx);
            if (level >= MAX_DEPTH) continue;
            if (level >= maxRenderLevel) continue;

            const px = xPos(idx);
            const y1 = nodeCY(topOf(idx)) + NODE_R;

            const leftIdx  = 2 * idx + 1;
            const rightIdx = 2 * idx + 2;

            const yLeft  = nodeCY(topOf(leftIdx))  - NODE_R;
            const yRight = nodeCY(topOf(rightIdx)) - NODE_R;

            lines.push({ x1: px, y1, x2: xPos(leftIdx),  y2: yLeft  });
            lines.push({ x1: px, y1, x2: xPos(rightIdx), y2: yRight });
        }

        const maxIdxToRender = Math.pow(2, maxRenderLevel + 1) - 2;

        for (let idx = 0; idx <= maxIdxToRender; idx++) {
            const level = levelOf(idx);
            if (level > maxRenderLevel) break;

            const val    = getVal(nodesArr, idx);
            const isNull = val === null || val === undefined;
            const cx     = xPos(idx);
            const top    = topOf(idx);

            if (!isNull) {
                const isEditing = editingNodeIndex === idx;
                elements.push(
                    <div
                        key={`node-${idx}`}
                        className="tree-node-wrapper"
                        style={{ left: `calc(50% + ${cx}px)`, top: `${top}px` }}
                    >
                        <button
                            className="tree-node-delete-btn"
                            title="Delete node"
                            onClick={() => handleDeleteNode(idx)}
                        >✕</button>

                        {isEditing ? (
                            <input
                                className="tree-node tree-node-edit-input"
                                value={editingNodeValue}
                                autoFocus
                                onChange={e => setEditingNodeValue(e.target.value)}
                                onBlur={() => commitNodeEdit(idx)}
                                onKeyDown={e => {
                                    if (e.key === "Enter")  commitNodeEdit(idx);
                                    if (e.key === "Escape") { setEditingNodeIndex(null); setEditingNodeValue(""); }
                                }}
                            />
                        ) : (
                            <div
                                className="tree-node"
                                title="Click to edit value"
                                onClick={() => { setEditingNodeIndex(idx); setEditingNodeValue(String(val)); }}
                            >
                                {val}
                            </div>
                        )}
                    </div>
                );
            } else {
                if (idx === 0) {
                    const isInputOpen = placeholderInput.hasOwnProperty(0);
                    elements.push(
                        <div key="placeholder-root" className="tree-node-wrapper"
                            style={{ left: `calc(50% + 0px)`, top: `${topOf(0)}px` }}>
                            {isInputOpen ? (
                                <input className="tree-node tree-placeholder-input" autoFocus
                                    value={placeholderInput[0] || ""}
                                    onChange={e => setPlaceholderInput(prev => ({ ...prev, 0: e.target.value }))}
                                    onBlur={() => commitPlaceholderInsert(0)}
                                    onKeyDown={e => {
                                        if (e.key === "Enter")  commitPlaceholderInsert(0);
                                        if (e.key === "Escape") setPlaceholderInput(prev => { const n = { ...prev }; delete n[0]; return n; });
                                    }}
                                    placeholder="val" />
                            ) : (
                                <div className="tree-node tree-node-placeholder" title="Insert root node"
                                    onClick={() => setPlaceholderInput(prev => ({ ...prev, 0: "" }))}>+</div>
                            )}
                        </div>
                    );
                    continue;
                }

                const parentIdx = Math.floor((idx - 1) / 2);
                const parentVal = getVal(nodesArr, parentIdx);
                if (parentVal === null || parentVal === undefined) continue;

                const isInputOpen = placeholderInput.hasOwnProperty(idx);
                elements.push(
                    <div
                        key={`placeholder-${idx}`}
                        className="tree-node-wrapper"
                        style={{ left: `calc(50% + ${cx}px)`, top: `${top}px` }}
                    >
                        {isInputOpen ? (
                            <input
                                className="tree-node tree-placeholder-input"
                                autoFocus
                                value={placeholderInput[idx] || ""}
                                onChange={e => setPlaceholderInput(prev => ({ ...prev, [idx]: e.target.value }))}
                                onBlur={() => commitPlaceholderInsert(idx)}
                                onKeyDown={e => {
                                    if (e.key === "Enter")  commitPlaceholderInsert(idx);
                                    if (e.key === "Escape") setPlaceholderInput(prev => { const n = { ...prev }; delete n[idx]; return n; });
                                }}
                                placeholder="val"
                            />
                        ) : (
                            <div
                                className="tree-node tree-node-placeholder"
                                title="Click to insert a node here"
                                onClick={() => setPlaceholderInput(prev => ({ ...prev, [idx]: "" }))}
                            >
                                +
                            </div>
                        )}
                    </div>
                );
            }
        }

        return { elements, lines };
    };

    const { elements, lines } = renderTree();

    const HelpModal = () => (
        <div className="help-modal-backdrop" onClick={() => setHelpOpen(false)}>
            <div className="help-modal" onClick={e => e.stopPropagation()}>
                <div className="help-modal-header">
                    <h2>How to use the BST Quiz</h2>
                    <button className="help-modal-close" onClick={() => setHelpOpen(false)}>✕</button>
                </div>
                <div className="help-modal-body">
                    <p>Edit the tree on the left to match what it looks like after the operation in the question.</p>
                    <h4>How to edit the tree:</h4>
                    <ul className="help-list">
                        <li><strong>Insert a node:</strong> Click a dashed <strong>+</strong> circle where a child could go. Type the value and press <kbd>Enter</kbd>.</li>
                        <li><strong>Delete a node:</strong> Hover a node and click X above it. The in-order successor (right-child) or predecessor (if no right child) is promoted automatically.</li>
                        <li><strong>Edit a value:</strong> Click a node's number to edit it in place. Press <kbd>Enter</kbd> to confirm.</li>
                    </ul>
                    <p className="help-note">Tip: Delete expects you to promote the inorder successor when the node to delete has two children</p>
                </div>
            </div>
        </div>
    );

    const handleShowAnswer = () => {
        setNodesArr([...(question.answer || [])]);
        setAnswerShown(true);
        setFeedbackShowing(false);
        setEditingNodeIndex(null);
        setPlaceholderInput({});
    };

    const AnswerFeedback = () => feedbackShowing && (
        <div className="answer-feedback-popup quiz-overlay">
            <div className="popup-content">
                <h3 className={isCorrect ? "correct-text" : "incorrect-text"}>
                    {isCorrect ? "Correct!" : "Incorrect"}
                </h3>
        <button className="quiz-button" onClick={() => {
            setFeedbackShowing(false);
            if (isCorrect) {
                createQuestion();
            } else {
                setNodesArr([...(question.baseSnapshot || [])]);
                setEditingNodeIndex(null);
                setEditingNodeValue("");
                setPlaceholderInput({});
                setAnswerShown(false);
            }
        }}>
            {isCorrect ? "Next Question" : "Try Again"}
        </button>
                {!isCorrect && (
                    <button className="quiz-button" style={{ marginTop: "0.5rem" }}
                        onClick={() => { setFeedbackShowing(false); createQuestion(); }}>
                        New Question
                    </button>
                )}
                {!isCorrect && (
                    <button className="quiz-button show-answer-btn" style={{ marginTop: "0.5rem" }}
                        onClick={handleShowAnswer}>
                        Show Answer
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="quiz-page">
            <h1 className="page-title">Binary Search Tree Quiz</h1>
            <Link to="/" className="back-icon"><img src="/favicon.ico" alt="Home" /></Link>

            {helpOpen && <HelpModal />}

            <div className="bst-content">
                <div className="visualization-area">
                    <p className="interaction-hint">
                        Click <strong>+</strong> on an empty slot to insert · Hover a node and click X to delete · Click a value to edit it
                    </p>
                    {answerShown && (
                        <p className="answer-shown-banner">Showing correct answer</p>
                    )}
                    <div className="tree-container">
                        <div className="tree-layout">
                            <svg className="tree-lines">
                                {lines.map((l, i) => (
                                    <line key={i}
                                        x1={`calc(50% + ${l.x1 - 25}px)`} y1={l.y1}
                                        x2={`calc(50% + ${l.x2 - 25}px)`} y2={l.y2}
                                        stroke="#444c56" strokeWidth="2"
                                    />
                                ))}
                            </svg>
                            {elements}
                        </div>
                    </div>
                </div>

                <div className="quiz-container">
                    <p className="quiz-title">{question.prompt}</p>
                    {(isDelete) && (
                        <p className="bst-fn-hint">The display will automatically promote the in order successor when a node with children is deleted (this is not always correct)</p>
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

export default BSTQuizPage;