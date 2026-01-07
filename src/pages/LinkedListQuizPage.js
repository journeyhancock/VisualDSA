import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { LinkedList } from "../data_structures/LinkedList";
import "../App.css";
import "./styles/LinkedListQuizPage.css";

function verifyInput(value) {
    return !Number.isInteger(Number(value)) || value === "" || value.includes(".");
}



function LinkedListQuizPage() {
    const displayList = useRef(new LinkedList());
    const [nodes, setNodes] = useState([]);

    const [insertPos, setInsertPos] = useState("");
    const [insertVal, setInsertVal] = useState("");
    const [deletePos, setDeletePos] = useState("");
    const [textInput, setTextInput] = useState("");
    const [openPanels, setOpenPanels] = useState({
        textInput: false,
        insert: false,
        delete: false
    });

    const [question, setQuestion] = useState({});
    const [feedbackShowing, setFeedbackShowing] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    const [editingIndex, setEditingIndex] = useState(null);
    const nodesRefs = useRef([]);

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

    const togglePanel = (panel) => {
        setOpenPanels((prev) => ({
            ...prev,
            [panel]: !prev[panel]
        }));
    };

    const generateRandomList = () => {
        const length = Math.floor(Math.random() * 4) + 2;
        return Array.from({ length }, () => Math.floor(Math.random() * 9) + 1);
    };

    const createQuestion = () => {
        const list = generateRandomList();
        const type = Math.random() < 0.5 ? "insert" : "delete";
        const pos = Math.floor(Math.random() * list.length);
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
            position: pos,
            value: val,
            list,
            answer,
            prompt:
                type === "insert"
                    ? `Edit the LinkedList as if Insert(${val}) was ran`
                    : `Edit the LinkedList as if Delete(${val}) was ran`
        });

        const newList = new LinkedList();
        for (let i = list.length - 1; i >= 0; i--) newList.insert(list[i]);
        displayList.current = newList;
        setNodes(newList.toArray());
    };

    useEffect(() => {
        createQuestion();
    }, []);

    const updateNodes = () => setNodes(displayList.current.toArray());

    const handleTextInput = () => {
        const values = textInput
            .split(",")
            .map((val) => val.trim())
            .filter((val) => val !== "")
            .map(Number);
        if (values.some(isNaN)) {
            alert("Only enter integers separated by commas (e.g. 1, 2, 3)");
            return;
        }

        const newList = new LinkedList();
        for (let i = values.length - 1; i >= 0; i--) newList.insert(values[i]);
        displayList.current = newList;
        setNodes(newList.toArray());
        setTextInput("");
    };

    const handleInsert = () => {
        const pos = Number(insertPos);
        const val = Number(insertVal);
        const arr = displayList.current.toArray();

        if (isNaN(pos) || isNaN(val) || pos < 0 || pos > arr.length) {
            alert("Invalid position or value");
            return;
        }

        const newArr = [...arr];
        newArr.splice(pos, 0, val);

        const newList = new LinkedList();
        for (let i = newArr.length - 1; i >= 0; i--) newList.insert(newArr[i]);
        displayList.current = newList;
        updateNodes();
        setInsertPos("");
        setInsertVal("");
    };

    const handleDelete = () => {
        const pos = Number(deletePos);
        const arr = displayList.current.toArray();

        if (isNaN(pos) || pos < 0 || pos >= arr.length) {
            alert("Invalid position");
            return;
        }

        const newArr = arr.filter((_, i) => i !== pos);
        const newList = new LinkedList();
        for (let i = newArr.length - 1; i >= 0; i--) newList.insert(newArr[i]);
        displayList.current = newList;
        updateNodes();
        setDeletePos("");
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

    const AnswerFeedback = () =>
        feedbackShowing && (
            <div className="answer-feedback-popup quiz-overlay">
                <div className="popup-content">
                    <h3 className={isCorrect ? "correct-text" : "incorrect-text"}>
                        {isCorrect ? "Correct" : "Incorrect"}
                    </h3>
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
        );

    return (
        <div className="quiz-page">

            <h1 className="page-title">Linked List Quiz</h1>
            <Link to="/" className="back-icon">
                <img src="/favicon.ico" alt="Back" />
            </Link>

            <div className="linkedlist-content">
                <div className="visualization-area">
                    <div className="node-container">
                        {nodes.map((value, index) => (
                            <React.Fragment key={index}>
                                <div
                                    ref={(el) => (nodesRefs.current[index] = el)}
                                    className="node-box"
                                    contentEditable={editingIndex === index}
                                    suppressContentEditableWarning={true}
                                    onClick={() => setEditingIndex(index)}
                                    onBlur={(e) => {
                                        const newVal = e.target.textContent.trim();

                                        if (verifyInput(newVal)) {
                                            e.target.textContent = nodes[index];
                                            alert("Enter a valid integer");
                                            setEditingIndex(null);
                                            return;
                                        }

                                        const oldKey = nodes[index];
                                        const tempNode = displayList.current.search(oldKey);
                                        if (tempNode) tempNode.key = Number(newVal);
                                        updateNodes();
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
                                {index < nodes.length - 1 && <div className="arrow">→</div>}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                <div className="side-actions">
                    <div className="panel actions-panel">
                        <div
                            className="panel-header"
                            onClick={() => togglePanel("textInput")}
                        >
                            <div
                                className={`triangle-icon ${openPanels.textInput ? "open" : ""}`}
                            ></div>
                            <h3>Text Input</h3>
                        </div>
                        {openPanels.textInput && (
                            <div className="panel-body actions-body">
                                <input
                                    type="text"
                                    placeholder="Type list: 1, 2, 3"
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                />
                                <button
                                    className="actions-button"
                                    onClick={handleTextInput}
                                >
                                    Update List
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="panel actions-panel">
                        <div
                            className="panel-header"
                            onClick={() => togglePanel("insert")}
                        >
                            <div
                                className={`triangle-icon ${openPanels.insert ? "open" : ""}`}
                            ></div>
                            <h3>New Node</h3>
                        </div>
                        {openPanels.insert && (
                            <div className="panel-body actions-body">
                                <input
                                    type="text"
                                    placeholder="Position"
                                    value={insertPos}
                                    onChange={(e) => setInsertPos(e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Value"
                                    value={insertVal}
                                    onChange={(e) => setInsertVal(e.target.value)}
                                />
                                <button
                                    className="actions-button"
                                    onClick={handleInsert}
                                >
                                    Insert
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="panel actions-panel">
                        <div
                            className="panel-header"
                            onClick={() => togglePanel("delete")}
                        >
                            <div
                                className={`triangle-icon ${openPanels.delete ? "open" : ""}`}
                            ></div>
                            <h3>Delete Node</h3>
                        </div>
                        {openPanels.delete && (
                            <div className="panel-body actions-body">
                                <input
                                    type="text"
                                    placeholder="Position"
                                    value={deletePos}
                                    onChange={(e) => setDeletePos(e.target.value)}
                                />
                                <button
                                    className="actions-button"
                                    onClick={handleDelete}
                                >
                                    Delete
                                </button>
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