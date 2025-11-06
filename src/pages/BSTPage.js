import React, {useState, useEffect, useRef} from "react";
import {Link} from "react-router-dom";
import {BST} from "../data_structures/BST"
import {Node} from "../data_structures/BST"
import "../App.css"
import "./styles/BSTPage.css"

function verifyInput(value) {
    return (!Number.isInteger(Number(value)) || value === "" || value.includes("."))
}

function Sidebar({isOpen, toggleSidebar}) {
  return (
    <div className={`sidebar ${isOpen ? "open" : ''}`}>
      <div className="sidebar-list">
        <h3>New Canvas</h3>

        <h3>Visualize</h3>
        <ul>
          <li><Link to="/linkedlist" onClick={toggleSidebar}>Linked List</Link></li>
          <li><Link to="/bst" onClick={toggleSidebar}>Binary Search Tree</Link></li>
        </ul>

        <h3>Quiz</h3>
        <ul>
          <li><Link to="/linkedlist" onClick={toggleSidebar}>Linked List</Link></li>
          <li><Link to="/bst" onClick={toggleSidebar}>Binary Search Tree</Link></li>
        </ul>

        <h3>Code</h3>
        <ul>
          <li><Link to="/linkedlist" onClick={toggleSidebar}>Linked List</Link></li>
          <li><Link to="/bst" onClick={toggleSidebar}>Binary Search Tree</Link></li>
        </ul>
      </div>
    </div>
  )
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
        [5, 4, 3, 2].forEach(val => tree.insert(val));
        setNodes(tree.toArray());
    }, []);

    // Update nodes with the current display
    const updateNodes = () => setNodes(displayTree.current.toArray());

    // Handle the actions menu actions and live display editing
    const handleInsert = () => {
        const trimmedVal = insertValue.trim()

        if (verifyInput(trimmedVal)) {
            alert("Enter a valid integer");
            return;
        }

        displayTree.current.insert(Number(trimmedVal));
        setInsertValue("");
        updateNodes();
    }

    const handleDelete = () => {
        const trimmedVal = deleteValue.trim()

        if (verifyInput(trimmedVal)) {
            alert("Enter a valid integer");
            return;
        }

        displayTree.current.listDelete(Number(trimmedVal));
        setDeleteValue("");
        updateNodes();
    }

    const handleEdit = (index, newVal) => {
        newVal = newVal.trim();

        let key = nodes[index];
        displayTree.current.editByPosition(index, key)
        updateNodes();
    }


    const handleBlur = (e, index) => {
        let newVal = e.target.textContent;
        newVal = newVal.trim();

        if (index === editingIndex) {
            if (verifyInput(newVal)) {
                e.target.textContent = nodes[index];
                alert("Enter a valid integer");
                return;
            }

            handleEdit(index, newVal);
            setEditingIndex(null);
        }
    }

    const handleEnter = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            e.target.blur();
        }
    }

    const handleClick = (index) => {
        setEditingIndex(index);
    }

    const handleMouseEnter = (index) => {
        setEditingIndex(index);
    }

    const renderTree = (node, x = 0, y = 0, level = 0, spacing = 220, connections = []) => {
        if (!node) return {elements: [], connections};

        const offset = spacing / Math.pow(2, level);
        const currX = x;
        const currY = y;
        let elements = [];

        elements.push(
            <div
                key={`${currX}-${currY}-${node.key}`}
                className="tree-node"
                style={{
                    left: `calc(50% + ${currX}px)`,
                    top: `${currY}px`
                }}
            >
                <div className="node-box">{node.key}</div>
            </div>
        );

        if (node.left) {
             const leftX = x - offset;
             const leftY = y + 100;
             connections.push({x1: currX, y1:currY, x2: leftX, y2: leftY});
             const left = renderTree(node.left, leftX, leftY, level + 1, spacing, connections)
             elements = elements.concat(left.elements);
        }

        if (node.right) {
            const rightX = x + offset;
            const rightY = y + 100;
            connections.push({x1: currX, y1: currY, x2: rightX, y2: rightY});
            const right = renderTree(node.right, rightX, rightY, level + 1, spacing, connections);
            elements = elements.concat(right.elements);
        }

        return {elements, connections};
    }

    const {elements, connections} = renderTree(displayTree.current.root);
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
                            {connections.map((line, i) => (
                                <line
                                    key={i}
                                    x1={`calc(50% + ${line.x1}px)`}
                                    y1={line.y1 + 25}
                                    x2={`calc(50% + ${line.x2}px)`}
                                    y2={line.y2}
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