import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { BST, Node } from "../data_structures/BST";
import "../App.css";
import "./styles/BSTQuizPage.css";

function Sidebar({ isOpen, toggleSidebar }) {
    return (
        <div className={`sidebar ${isOpen ? "open" : ""}`}>
            <div className="sidebar-list">
                <h3>Visualize</h3>
                <ul>
                    <li>
                        <Link to="/linkedlist" onClick={toggleSidebar}>Linked List</Link>
                    </li>
                    <li>
                        <Link to="/bst" onClick={toggleSidebar}>Binary Search Tree</Link>
                    </li>
                </ul>
                <h3>Quiz</h3>
                <ul>
                    <li>
                        <Link to="/quiz/linkedlist" onClick={toggleSidebar}>Linked List</Link>
                    </li>
                    <li>
                        <Link to="/quiz/bst" onClick={toggleSidebar}>Binary Search Tree</Link>
                    </li>
                </ul>
            </div>
        </div>
    );
}

function BSTQuizPage() {
    const bstRef = useRef(new BST());
    const [nodesArr, setNodesArr] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [openPanels, setOpenPanels] = useState({ textInput: false, insert: false, delete: false });

    const [textInput, setTextInput] = useState("");
    const [insertPos, setInsertPos] = useState("");
    const [insertVal, setInsertVal] = useState("");
    const [deletePos, setDeletePos] = useState("");

    const [question, setQuestion] = useState({});
    const [feedbackShowing, setFeedbackShowing] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const nodesRefs = useRef([]);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const togglePanel = (p) => setOpenPanels(prev => ({ ...prev, [p]: !prev[p] }));

    const rebuildFromArray = (arr) => {
        if (!arr.length) {
            bstRef.current = new BST();
            setNodesArr([]);
            return;
        }

        const nodes = arr.map(v => {
            if (v === null || v === undefined || v === "" || isNaN(Number(v))) return null;
            const node = new Node(Number(v));
            node.key = Number(v);
            return node;
        });

        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i]) {
                const leftIdx = 2 * i + 1;
                const rightIdx = 2 * i + 2;
                if (leftIdx < nodes.length) nodes[i].left = nodes[leftIdx];
                if (rightIdx < nodes.length) nodes[i].right = nodes[rightIdx];
            }
        }

        const tree = new BST();
        tree.root = nodes[0];
        bstRef.current = tree;
        setNodesArr(arr);
    };

    const treeToLevelOrder = (tree) => {
        if (!tree.root) return [];
        const queue = [tree.root];
        const result = [];

        while (queue.length > 0) {
            const node = queue.shift();
            if (node) {
                result.push(node.key);
                queue.push(node.left);
                queue.push(node.right);
            } else {
                result.push(null);
                queue.push(null);
                queue.push(null);
            }
            if (queue.every(n => n === null)) break;
        }
        return result;
    };

    const handleTextInput = () => {
        const values = textInput
            .split(',')
            .map(v => v.trim())
            .map(v => v === 'null' ? null : Number(v));
        if (values.some(v => v !== null && isNaN(v))) {
            alert('Invalid input. Use integers or nulls separated by commas.');
            return;
        }
        rebuildFromArray(values);
        setTextInput('');
    };

    const handleInsert = () => {
        const pos = Number(insertPos);
        const val = Number(insertVal);

        if (isNaN(val) || isNaN(pos) || pos < 0) {
            alert('Invalid position or value');
            return;
        }

        const newArr = [...nodesArr];
        while (newArr.length < pos) {
            newArr.push(null);
        }
        newArr[pos] = val;

        rebuildFromArray(newArr);
        setInsertPos('');
        setInsertVal('');
    };

    const handleDelete = () => {
        const pos = Number(deletePos);
        if (pos < 0 || pos >= nodesArr.length) {
            alert('Invalid index');
            return;
        }
        const newArr = nodesArr;
        newArr[pos] = null;
        rebuildFromArray(newArr);
        setDeletePos('');
    };

    const updateNodesArrAfterEdit = (i, newVal) => {
        const val = Number(newVal);
        if (isNaN(val)) return;
        const newArr = [...nodesArr];
        newArr[i] = val;
        rebuildFromArray(newArr);
    };

    const renderTree = (node, x = 0, y = 0, level = 0, spacing = 220, lines = []) => {
        if (!node) return { elements: [], lines };
        const offset = spacing / Math.pow(2, level);
        const cx = x, cy = y;

        const displayVal = node.key !== undefined && node.key !== null ? node.key : "";
        const elements = [
            <div
                key={`${cx}-${cy}`}
                className="tree-node"
                style={{ left: `calc(50% + ${cx}px)`, top: `${cy}px` }}
            >
                {displayVal}
            </div>
        ];

        if (node.left) {
            const lx = x - offset;
            const ly = y + 100;
            lines.push({ x1: cx, y1: cy, x2: lx, y2: ly });
            const left = renderTree(node.left, lx, ly, level + 1, spacing, lines);
            elements.push(...left.elements);
        }

        if (node.right) {
            const rx = x + offset;
            const ry = y + 100;
            lines.push({ x1: cx, y1: cy, x2: rx, y2: ry });
            const right = renderTree(node.right, rx, ry, level + 1, spacing, lines);
            elements.push(...right.elements);
        }

        return { elements, lines };
    };

    const generateRandomArray = () =>
        Array.from({ length: Math.floor(Math.random() * 2) + 3 }, () => Math.floor(Math.random() * 50) + 1);

    const createQuestion = () => {
        const arr = generateRandomArray();
        const baseTree = new BST();
        arr.forEach(v => baseTree.insert(v));

        const answerTree = new BST();
        arr.forEach(v => answerTree.insert(v));

        const type = Math.random() < 0.5 ? "insert" : "delete";
        let questionObj = {};
        const value = Math.floor(Math.random() * 50) + 1;

        if (type === "insert") {
            answerTree.insert(value);
            questionObj = {
                type,
                prompt: `Insert ${value} into the BST.`,
                value,
                list: treeToLevelOrder(baseTree),
                answer: treeToLevelOrder(answerTree)
            };
        } else {
            const delVal = arr[Math.floor(Math.random() * arr.length)];
            answerTree.treeDelete(delVal);
            questionObj = {
                type,
                prompt: `Delete ${delVal} from the BST.`,
                value: delVal,
                list: treeToLevelOrder(baseTree),
                answer: treeToLevelOrder(answerTree)
            };
        }

        bstRef.current = baseTree;
        setNodesArr(treeToLevelOrder(baseTree));
        setQuestion(questionObj);
    };

    useEffect(() => { createQuestion(); }, []);

    const handleSubmit = () => {
        const trimNulls = (arr) => {
            const copy = [...arr];
            while (copy.length && (copy[copy.length - 1] === null || copy[copy.length - 1] === undefined)) {
                copy.pop();
            }
            return copy;
        };

        const userAnswer = trimNulls(nodesArr);
        const expected = trimNulls(question.answer);

        const equal = userAnswer.length === expected.length && userAnswer.every((v, i) => v === expected[i]);
        setIsCorrect(equal);
        setFeedbackShowing(true);
    };

    const AnswerFeedback = () => feedbackShowing && (
        <div className="answer-feedback-popup quiz-overlay">
            <div className="popup-content">
                <h3 className={isCorrect ? "correct-text" : "incorrect-text"}>
                    {isCorrect ? "Correct" : "Incorrect"}
                </h3>
                <button
                    className="quiz-button"
                    onClick={() => {
                        setFeedbackShowing(false);
                        if (isCorrect) createQuestion();
                    }}
                >
                    Close
                </button>
            </div>
        </div>
    );

    const { elements, lines } = bstRef.current.root
        ? renderTree(bstRef.current.root)
        : { elements: [], lines: [] };

    return (
        <div className="quiz-page">
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="hamburger" onClick={toggleSidebar}>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
            </div>

            <h1 className="page-title">Binary Search Tree Quiz</h1>
            <Link to="/" className="back-icon">
                <img src="/favicon.ico" alt="Home" />
            </Link>

            <div className="bst-content">
                <div className="visualization-area">
                    <div className="tree-container">
                        <svg className="tree-lines">
                            {lines.map((l, i) => (
                                <line
                                    key={i}
                                    x1={`calc(50% + ${l.x1}px)`}
                                    y1={l.y1 + 25}
                                    x2={`calc(50% + ${l.x2}px)`}
                                    y2={l.y2}
                                    stroke="#F0F6FC"
                                    strokeWidth="2"
                                />
                            ))}
                        </svg>
                        <div className="tree-layout">{elements}</div>
                    </div>

                    <div className="visual-edits">
                        <div className="node-container">
                            {nodesArr.map((v, i) => (
                                <div
                                    key={i}
                                    ref={el => nodesRefs.current[i] = el}
                                    className="node-box"
                                    contentEditable={true}
                                    suppressContentEditableWarning
                                    onInput={(e) => updateNodesArrAfterEdit(i, e.currentTarget.textContent.trim())}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            e.currentTarget.blur();
                                        }
                                    }}
                                    onBlur={(e) => updateNodesArrAfterEdit(i, e.target.textContent.trim())}
                                >
                                    {v}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="side-actions">
                    <div className="panel actions-panel">
                        <div className="panel-header" onClick={() => togglePanel('textInput')}>
                            <div className={`triangle-icon ${openPanels.textInput ? 'open' : ''}`}></div>
                            <h3>Text Input</h3>
                        </div>
                        {openPanels.textInput && (
                            <div className="panel-body actions-body">
                                <input
                                    type="text"
                                    placeholder="Type list: 1,2,3"
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                />
                                <button className="actions-button" onClick={handleTextInput}>Update List</button>
                            </div>
                        )}
                    </div>

                    <div className="panel actions-panel">
                        <div className="panel-header" onClick={() => togglePanel('insert')}>
                            <div className={`triangle-icon ${openPanels.insert ? 'open' : ''}`}></div>
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
                                <button className="actions-button" onClick={handleInsert}>Insert</button>
                            </div>
                        )}
                    </div>

                    <div className="panel actions-panel">
                        <div className="panel-header" onClick={() => togglePanel('delete')}>
                            <div className={`triangle-icon ${openPanels.delete ? 'open' : ''}`}></div>
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
                                <button className="actions-button" onClick={handleDelete}>Delete</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="quiz-container">
                    <p className="quiz-title">{question.prompt}</p>
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