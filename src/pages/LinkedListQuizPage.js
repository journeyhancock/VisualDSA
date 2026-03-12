import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { LinkedList } from "../data_structures/LinkedList";
import "../App.css";
import "./styles/LinkedListQuizPage.css";

function verifyInput(value) {
    return !Number.isInteger(Number(value)) || value === "" || value.includes(".");
}

function InsertGap({ gapIndex, activeInsertGap, insertInputVal, insertInputRef, onActivate, onChangeVal, onCommit, onCancel }) {
    const isActive = activeInsertGap === gapIndex;
    return (
        <div className="insert-gap">
            {isActive ? (
                <div className="insert-gap-input-wrapper">
                    <input
                        ref={insertInputRef}
                        className="insert-gap-input"
                        type="text"
                        placeholder="val"
                        value={insertInputVal}
                        onChange={(e) => onChangeVal(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") onCommit();
                            if (e.key === "Escape") onCancel();
                        }}
                        onBlur={() => {
                            setTimeout(onCancel, 150);
                        }}
                    />
                    <button
                        className="insert-gap-confirm"
                        onMouseDown={(e) => { e.preventDefault(); onCommit(); }}
                    >
                        ✓
                    </button>
                </div>
            ) : (
                <button
                    className="insert-gap-btn"
                    title="Insert node here"
                    onClick={() => onActivate(gapIndex)}
                >
                    +
                </button>
            )}
        </div>
    );
}

function LinkedListQuizPage() {
    const displayList = useRef(new LinkedList());
    const [nodes, setNodes] = useState([]);

    const [helpOpen, setHelpOpen] = useState(false);

    const [activeInsertGap, setActiveInsertGap] = useState(null);
    const [insertInputVal, setInsertInputVal] = useState("");
    const insertInputRef = useRef(null);

    const [editingIndex, setEditingIndex] = useState(null);
    const nodesRefs = useRef([]);

    const [question, setQuestion] = useState({});
    const [feedbackShowing, setFeedbackShowing] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [answerShown, setAnswerShown] = useState(false);

    useEffect(() => {
        if (activeInsertGap !== null && insertInputRef.current) {
            insertInputRef.current.focus();
        }
    }, [activeInsertGap]);

    useEffect(() => {
        if (editingIndex === null) return;
        const el = nodesRefs.current[editingIndex];
        if (el) {
            el.focus();
            const range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }, [editingIndex]);

    const generateRandomList = () => {
        const length = Math.floor(Math.random() * 4) + 2;
        return Array.from({ length }, () => Math.floor(Math.random() * 9) + 1);
    };

    const createQuestion = useCallback(() => {
        const list = generateRandomList();
        const type = Math.random() < 0.5 ? "insert" : "delete";
        let answer;
        let val;

        if (type === "insert") {
            val = Math.floor(Math.random() * 9) + 1;
            answer = [...list];
            answer.splice(0, 0, val);
        } else {
            val = list[Math.floor(Math.random() * list.length)];
            const idx = list.indexOf(val);
            answer = [...list];
            if (idx !== -1) answer.splice(idx, 1);
        }

        setQuestion({
            type,
            value: val,
            list,
            answer,
            prompt:
                type === "insert"
                    ? `What will the linked list look like after Insert(${val})?`
                    : `What will the linked list look like after Delete(${val})?`
        });

        const newList = new LinkedList();
        for (let i = list.length - 1; i >= 0; i--) newList.insert(list[i]);
        displayList.current = newList;
        setNodes(newList.toArray());
        setActiveInsertGap(null);
        setInsertInputVal("");
        setEditingIndex(null);
        setAnswerShown(false);
    }, []);

    useEffect(() => {
        createQuestion();
    }, [createQuestion]);

    const updateNodes = () => setNodes(displayList.current.toArray());

    const activeInsertGapRef = useRef(activeInsertGap);
    const insertInputValRef = useRef(insertInputVal);
    useEffect(() => { activeInsertGapRef.current = activeInsertGap; }, [activeInsertGap]);
    useEffect(() => { insertInputValRef.current = insertInputVal; }, [insertInputVal]);

    const commitInsert = useCallback(() => {
        const currentGap = activeInsertGapRef.current;
        const currentVal = insertInputValRef.current.trim();
        if (currentGap === null) return;
        if (!verifyInput(currentVal)) {
            const numVal = Number(currentVal);
            const arr = displayList.current.toArray();
            const newArr = [...arr];
            newArr.splice(currentGap, 0, numVal);
            const newList = new LinkedList();
            for (let i = newArr.length - 1; i >= 0; i--) newList.insert(newArr[i]);
            displayList.current = newList;
            setNodes(newArr);
        }
        setActiveInsertGap(null);
        setInsertInputVal("");
    }, []);

    const cancelInsert = useCallback(() => {
        setActiveInsertGap(null);
        setInsertInputVal("");
    }, []);

    const activateGap = useCallback((gapIndex) => {
        setActiveInsertGap(gapIndex);
        setInsertInputVal("");
    }, []);

    const handleDeleteNode = (index) => {
        const arr = displayList.current.toArray();
        const newArr = arr.filter((_, i) => i !== index);
        const newList = new LinkedList();
        for (let i = newArr.length - 1; i >= 0; i--) newList.insert(newArr[i]);
        displayList.current = newList;
        updateNodes();
    };

    const handleSubmit = () => {
        const userAnswer = displayList.current.toArray();
        const expected = question.answer;
        const equal =
            userAnswer.length === expected.length &&
            userAnswer.every((v, i) => v === expected[i]);
        setIsCorrect(equal);
        setFeedbackShowing(true);
    };

    const HelpModal = () => (
        <div className="help-modal-backdrop" onClick={() => setHelpOpen(false)}>
            <div className="help-modal" onClick={(e) => e.stopPropagation()}>
                <div className="help-modal-header">
                    <h2>How to use the Linked List Quiz</h2>
                    <button className="help-modal-close" onClick={() => setHelpOpen(false)}>✕</button>
                </div>
                <div className="help-modal-body">
                    <p>
                        The quiz question asks you to perform an operation on the linked list.
                        Edit the visualization on the left to match what the list looks like after the operation runs.
                    </p>
                    <h4>How to edit the list:</h4>
                    <ul className="help-list">
                        <li>
                            <strong>Insert a node:</strong> Click any <strong>+</strong> button
                            between (or before/after) nodes to open an inline input. Type a value
                            and press <kbd>Enter</kbd> or click the checkmark.
                        </li>
                        <li>
                            <strong>Delete a node:</strong> Hover over a node and click the
                            X button that appears above it.
                        </li>
                        <li>
                            <strong>Edit a value:</strong> Click the node's number to edit it
                            in place. Press <kbd>Enter</kbd> or click away to confirm.
                        </li>
                    </ul>
                    <p className="help-note">
                        Tip: For <strong>Insert(V)</strong>, a linked list inserts at the head by
                        default. Use the <strong>+</strong> at the very beginning to prepend.
                    </p>
                </div>
            </div>
        </div>
    );

    const handleShowAnswer = () => {
        const newList = new LinkedList();
        for (let i = question.answer.length - 1; i >= 0; i--) newList.insert(question.answer[i]);
        displayList.current = newList;
        setNodes([...question.answer]);
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
                            if (isCorrect) createQuestion();
                        }}
                        className="quiz-button"
                    >
                        {isCorrect ? "Next Question" : "Try Again"}
                    </button>
                    {!isCorrect && (
                        <button
                            onClick={() => {
                                setFeedbackShowing(false);
                                createQuestion();
                            }}
                            className="quiz-button"
                            style={{ marginTop: "0.5rem" }}
                        >
                            New Question
                        </button>
                    )}
                    {!isCorrect && (
                        <button
                            onClick={handleShowAnswer}
                            className="quiz-button show-answer-btn"
                            style={{ marginTop: "0.5rem" }}
                        >
                            Show Answer
                        </button>
                    )}
                </div>
            </div>
        );

    return (
        <div className="quiz-page">
            <h1 className="page-title">Linked List Quiz</h1>
            <Link to="/" className="back-icon">
                <img src="/favicon.ico" alt="Back" />
            </Link>

            {helpOpen && <HelpModal />}

            <div className="linkedlist-content">
                <div className="visualization-area">
                    <p className="interaction-hint">
                        Click <strong>+</strong> to insert a node · Click X on a node to delete it · Click a node value to edit it
                    </p>
                    {answerShown && (
                        <p className="answer-shown-banner">Showing correct answer</p>
                    )}

                    <div className="node-scroll-wrapper">
                        <div className="node-container">
                            <InsertGap
                                gapIndex={0}
                                activeInsertGap={activeInsertGap}
                                insertInputVal={insertInputVal}
                                insertInputRef={insertInputRef}
                                onActivate={activateGap}
                                onChangeVal={setInsertInputVal}
                                onCommit={commitInsert}
                                onCancel={cancelInsert}
                            />

                            {nodes.map((value, index) => (
                                <React.Fragment key={index}>
                                    <div className="node-wrapper">
                                        <button
                                            className="node-delete-btn"
                                            title="Delete this node"
                                            onClick={() => handleDeleteNode(index)}
                                        >
                                            ✕
                                        </button>
                                        <div
                                            ref={(el) => (nodesRefs.current[index] = el)}
                                            className={`node-box ${editingIndex === index ? "editing" : ""}`}
                                            contentEditable={editingIndex === index}
                                            suppressContentEditableWarning={true}
                                            onClick={() => {
                                                if (activeInsertGap !== null) return;
                                                setEditingIndex(index);
                                            }}
                                            onBlur={(e) => {
                                                const newVal = e.target.textContent.trim();
                                                if (verifyInput(newVal)) {
                                                    e.target.textContent = nodes[index];
                                                } else {
                                                    const oldKey = nodes[index];
                                                    const tempNode = displayList.current.search(oldKey);
                                                    if (tempNode) tempNode.key = Number(newVal);
                                                    updateNodes();
                                                }
                                                setEditingIndex(null);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    e.target.blur();
                                                }
                                            }}
                                        >
                                            {value}
                                        </div>
                                    </div>

                                    {index < nodes.length - 1 && <div className="arrow">→</div>}

                                    <InsertGap
                                        gapIndex={index + 1}
                                        activeInsertGap={activeInsertGap}
                                        insertInputVal={insertInputVal}
                                        insertInputRef={insertInputRef}
                                        onActivate={activateGap}
                                        onChangeVal={setInsertInputVal}
                                        onCommit={commitInsert}
                                        onCancel={cancelInsert}
                                    />
                                </React.Fragment>
                            ))}

                            {nodes.length === 0 && (
                                <span className="empty-list-hint">List is empty. Click + to add a node.</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="quiz-container">
                    <p className="quiz-title">{question.prompt}</p>
                    <button className="help-btn" onClick={() => setHelpOpen(true)}>? Help</button>
                    <div className="quiz-navigation">
                        <button className="quiz-button" onClick={handleSubmit}>
                            Submit
                        </button>
                        <button className="quiz-button" onClick={createQuestion}>
                            New Question
                        </button>
                    </div>
                    <AnswerFeedback />
                </div>
            </div>
        </div>
    );
}

export default LinkedListQuizPage;