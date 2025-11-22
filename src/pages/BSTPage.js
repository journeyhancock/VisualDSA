import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { BST } from "../data_structures/BST";
import { Node } from "../data_structures/BST";
import "../App.css";
import "./styles/BSTPage.css";

function verifyInput(value) {
    return (!Number.isInteger(Number(value)) || value === "" || value.includes("."));
}

function Sidebar({ isOpen, toggleSidebar }) {
    return (
        <div className={`sidebar ${isOpen ? "open" : ""}`}>
            <div className="sidebar-list">
                <h3>New Canvas</h3>
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
                <h3>Code</h3>
                <ul>
                    <li>
                        <Link to="/code" onClick={toggleSidebar}>Linked List</Link>
                    </li>
                    <li>
                        <Link to="/code" onClick={toggleSidebar}>Binary Search Tree</Link>
                    </li>
                </ul>
            </div>
        </div>
    );
}

function BSTPage() {
    // Tree Display
    const displayTree = useRef(new BST());
    const initialized = useRef(false);
    const [nodes, setNodes] = useState(displayTree.current.toArray());

    // Sidebar and Actions
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [codeSnippet, setCodeSnippet] = useState(false);
    const [nodeSnippet, setNodeSnippet] = useState(false);
    const [openPanels, setOpenPanels] = useState({
        nodes: false,
        actions: false,
        controls: false,
    });

    // Live Display Editing
    const [insertValue, setInsertValue] = useState("");
    const [deleteValue, setDeleteValue] = useState("");
    const [editingIndex, setEditingIndex] = useState("");

    // Sidebar toggling and Actions opening
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const togglePanel = (panel) => {
        setOpenPanels((prev) => ({
            ...prev,
            [panel]: !prev[panel],
        }));
    };

    // Get sample display code
    useEffect(() => {
        fetch("/code/insert_node.txt")
            .then((res) => res.text())
            .then((text) => setCodeSnippet(text))
            .catch((err) => console.error("Error loading code:", err));
    }, []);

    useEffect(() => {
        fetch("/code/node.txt")
            .then((res) => res.text())
            .then((text) => setNodeSnippet(text))
            .catch((err) => console.error("Error loading code:", err));
    }, []);

    // Initialize Display
    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const tree = displayTree.current;
        tree.root = new Node();
        tree.root.key = 1;
        [5, 4, 3, 2].forEach((val) => tree.insert(val));
        setNodes(tree.toArray());
    }, []);

    // Update nodes with the current display
    const updateNodes = () => setNodes(displayTree.current.toArray());

    // Handle the actions menu actions and live display editing
    const handleInsert = () => {
        const trimmedVal = insertValue.trim();

        if (verifyInput(trimmedVal)) {
            alert("Enter a valid integer");
            return;
        }

        displayTree.current.insert(Number(trimmedVal));
        setInsertValue("");
        updateNodes();
    };

    const handleDelete = () => {
        const trimmedVal = deleteValue.trim();

        if (verifyInput(trimmedVal)) {
            alert("Enter a valid integer");
            return;
        }

        displayTree.current.treeDelete(Number(trimmedVal));
        setDeleteValue("");
        updateNodes();
    };

    const handleEdit = (oldKey, newVal) => {
        newVal = newVal.trim();

        if (verifyInput(newVal)) {
            alert("Enter a valid integer");
            return;
        }

        const tree = displayTree.current;
        const newKey = Number(newVal);

        // Only perform fix-up if the key actually changed
        if (newKey !== oldKey) {
            // Remove the old key and reinsert new one to maintain BST property
            tree.treeDelete(oldKey);
            tree.insert(newKey);
            updateNodes();
        }
    };

    const handleBlur = (e, key) => {
        const newVal = e.target.textContent.trim();
        if (editingIndex === key) {
            if (verifyInput(newVal)) {
                alert("Enter a valid integer");
                e.target.textContent = key;
                return;
            }
            handleEdit(key, newVal);
            setEditingIndex(null);
        }
    };

    const handleEnter = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            e.target.blur();
        }
    };

    const handleClick = (key) => {
        setEditingIndex(key);
    };

    const handleMouseEnter = (key) => {
        setEditingIndex(key);
    };

const renderTree = (node, x = 0, y = 0, level = 0, spacing = 220, lines = []) => {
        if (!node) return { elements: [], lines };
        const offset = spacing / Math.pow(2, level);
        const cx = x, cy = y;

        const elements = [
                <div
                    className="tree-node"
                    style={{
                            left: `calc(50% + ${x}px)`,
                            top: `${y}px`,
                            width: "50px",
                            height: "50px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "50%",
                            border: "2px solid #2D333B",
                            backgroundColor: "#13171D",
                            color: "#F0F6FC",
                            fontSize: "18px",
                            textAlign: "center",
                            overflow: "hidden",
                    }}
                    contentEditable={editingIndex === node.key}
                    suppressContentEditableWarning={true}
                    onClick={() => handleClick(node.key)}
                    onBlur={(e) => handleBlur(e, node.key)}
                    onKeyDown={(e) => handleEnter(e)}
                    onMouseEnter={() => handleMouseEnter(node.key)}
                    onFocus={(e) => {
                            // Prevent default blue outline on focus
                            e.target.style.outline = "none";
                    }}
                >
                    <span style={{ display: "inline-block", width: "100%", textAlign: "center" }}>
                            {node.key}
                    </span>
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


    const {elements, lines} = renderTree(displayTree.current.root);
    return (
        <div className="bst-page">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar}/>

            {/* Hamburger Sidebar */}
            <div className="hamburger" onClick={toggleSidebar}>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
            </div>

            {/* Title */}
            <h1 className="page-title">Binary Search Tree</h1>

            {/* Return to home */}
            <Link to="/" className="back-icon">
                <img src="/favicon.ico" alt="Back to Home" />
            </Link>

            {/* Content */}
            <div className="bst-content">
                {/* Visualization */}
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
                                    <pre><code>{nodeSnippet}</code></pre>
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
                                    <button className="actions-button" onClick={handleInsert}>Insert</button>
                                    <input 
                                        type="text" 
                                        placeholder="Type a value here"
                                        value={insertValue}
                                        onChange={(e) => setInsertValue(e.target.value)}
                                    />
                                </div>

                                <div className="actions-row">
                                    <button className="actions-button" onClick={handleDelete}>Delete</button>
                                    <input 
                                        type="text" 
                                        placeholder="Type a value here"
                                        value={deleteValue}
                                        onChange={(e) => setDeleteValue(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Controls panel */}
                    <div className="panel controls-panel">
                        <div className="panel-header" onClick={() => togglePanel("controls")}>
                            <div className={`triangle-icon ${openPanels.controls ? "open" : ""}`}></div>
                            <h3>Controls</h3>
                        </div> 

                        {openPanels.controls && (
                            <div className="panel-body controls-body">
                                <div className="controls-row">
                                    <button className="controls-button">&gt; Play</button>
                                    <button className="controls-button">&gt;&gt; Step</button>
                                </div>
                                <div className="controls-row">
                                    <button className="controls-button">|| Pause</button>
                                    <button className="controls-button">&lt;&lt; Step</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Code */}
                <div className="code-panel">
                    <pre><code>{codeSnippet}</code></pre>
                </div>
            </div>

        </div>
    );
}

export default BSTPage;