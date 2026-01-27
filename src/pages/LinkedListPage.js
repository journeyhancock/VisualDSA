import React, {useState, useEffect, useRef} from "react";
import {Link} from "react-router-dom";
import {LinkedList} from "../data_structures/LinkedList"
import "../App.css";
import "./styles/LinkedListPage.css";

const SPEED_MULTIPLIER = 7.5;
const delay = (ms) => new Promise(res => setTimeout(res, ms * SPEED_MULTIPLIER));

const slowTimeout = (fn, ms) =>
  setTimeout(fn, ms * SPEED_MULTIPLIER);


function verifyInput(value) {
    return (!Number.isInteger(Number(value)) || value === "" || value.includes("."))
}

function LinkedListPage() {
    /* List Display */
    const displayList = useRef(new LinkedList());
    const initialized = useRef(false);
    const [nodes, setNodes] = useState(displayList.current.toArray());

    /* Actions */
    const [codeSnippet, setCodeSnippet] = useState([]);
    const [insertSnippet, setInsertSnippet] = useState([]);
    const [deleteSnippet, setDeleteSnippet] = useState([]);
    const [nodeSnippet, setNodeSnippet] = useState(false);
    const [openPanels, setOpenPanels] = useState({
        nodes: false,
        actions: false,
        controls: false,
    });
    const [selectedNodeRef, setSelectedNodeRef] = useState(null);
    const [selectedNodeCode, setSelectedNodeCode] = useState("");

    /* Live Display Editing */
    const [insertValue, setInsertValue] = useState("");
    const [deleteValue, setDeleteValue] = useState("");
    const [editingIndex, setEditingIndex] = useState("");

    /* Actions opening */
    const togglePanel = (panel) => {
        setOpenPanels((prev) => ({
            ...prev,
            [panel]: !prev[panel],
        }));
    };

    const [animating, setAnimating] = useState(false);
    const [activeLine, setActiveLine] = useState(null);
    const [activeNodeIndex, setActiveNodeIndex] = useState(null);

    // Get sample display code
    useEffect(() => {
        fetch("/code/LinkedList/insert_node.txt")
            .then((res) => res.text())
            .then((text) => setInsertSnippet(text.split("\n")))
            .catch((err) => console.error("Error loading code:", err));
    }, []);

    useEffect(() => {
        fetch("/code/LinkedList/delete_node.txt")
            .then((res) => res.text())
            .then((text) => setDeleteSnippet(text.split("\n")))
            .catch((err) => console.error("Error loading code:", err));
    }, []);

    useEffect(() => {
        fetch("/code/LinkedList/node.txt")
            .then((res) => res.text())
            .then((text) => setNodeSnippet(text))
            .catch((err) => console.error("Error loading code:", err));
    }, []);

    // Initialize Display
    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        const list = displayList.current;
        [3, 2, 1].forEach(val => list.insert(val));
        setNodes(list.toArray());
    }, []);

    // Update nodes with the current display 
    const updateNodes = () => {
        const arr = displayList.current.toArray();
        setNodes(arr);

        // Selected node exists?
        if (selectedNodeRef) {

            // Check if this node is still in the linked list
            let stillExists = false;
            let curr = displayList.current.head;
            while (curr) {
                if (curr === selectedNodeRef) {
                    stillExists = true;
                    break;
                }
                curr = curr.next;
            }

            if (stillExists) {
                setSelectedNodeCode(generateNodeCode(selectedNodeRef));
            } else {
                // Node was deleted → show "null" placeholder
                setSelectedNodeCode(generateNodeCode(null));
                setSelectedNodeRef(null);
            }
        }
    };

    // Handle the actions menu actions and live display editing
    const handleInsert = () => {
        setCodeSnippet(insertSnippet);

        const trimmedVal = insertValue.trim();
        if (verifyInput(trimmedVal)) {
            alert("Enter a valid integer");
            return;
        }

        const val = Number(trimmedVal);
        setInsertValue("");

        setActiveNodeIndex(0);
        setAnimating(true);

        // 1: Node* to_insert = new Node(val);
        setActiveLine(1);

        setNodes(prev => [
            { value: val, animClass: "node-inserting" },
            ...prev.map(n => ({ value: n.value ?? n, animClass: "" }))
        ]);

        // 3: to_insert->next = head;
        slowTimeout(() => {
            setActiveLine(3);
        }, 250);

        // 5: head = to_insert;
        slowTimeout(() => {
            setActiveLine(5);
            displayList.current.insert(val);
            updateNodes();
        }, 500);

        // 7: return head;
        slowTimeout(() => {
            setActiveLine(7);
            setAnimating(false);
            setActiveNodeIndex(null);
        }, 750);
    };

    const handleDelete = () => {
        setCodeSnippet(deleteSnippet);

        const trimmedVal = deleteValue.trim();
        if (verifyInput(trimmedVal)) {
            alert("Enter a valid integer");
            return;
        }

        const val = Number(trimmedVal);
        setDeleteValue("");
        setAnimating(true);

        const currentNodes = [...nodes];
        let i = 0;

        // Start of function
        setActiveLine(1); // if (head == nullptr)

        // Highlight head node first
        setActiveNodeIndex(0);

        let interval = setInterval(() => {
            setActiveNodeIndex(i);

            // Check head match — line 3
            if (i === 0) setActiveLine(3);

            const nodeValue = currentNodes[i].value ?? currentNodes[i];

            // HEAD CASE
            if (i === 0 && nodeValue === val) {
                clearInterval(interval);

                // Highlight deletion block
                setActiveLine(4); // new_head = head->next

                slowTimeout(() => setActiveLine(5), 250); // delete head
                slowTimeout(() => setActiveLine(6), 500); // return new_head

                slowTimeout(() => {
                    displayList.current.listDelete(val);
                    updateNodes();
                    setAnimating(false);
                    setActiveNodeIndex(null);
                }, 800);

                return;
            }

            // AFTER HEAD → set prev/curr
            if (i === 0) {
                setActiveLine(9);  // prev = head
                slowTimeout(() => setActiveLine(10), 250); // curr = head->next
            }

            // Traverse loop
            setActiveLine(12); // while (curr != nullptr)

            // MATCH INSIDE LOOP
            if (nodeValue === val) {
                clearInterval(interval);

                setActiveLine(13); // if (curr->val == val)

                slowTimeout(() => setActiveLine(14), 250); // prev->next = next
                slowTimeout(() => setActiveLine(15), 500); // delete curr
                slowTimeout(() => setActiveLine(16), 750); // return head

                slowTimeout(() => {
                    displayList.current.listDelete(val);
                    updateNodes();
                    setAnimating(false);
                    setActiveNodeIndex(null);
                }, 1000);

                return;
            }

            // Move forward (no match)
            i++;

            if (i >= currentNodes.length) {
                clearInterval(interval);
                setActiveLine(23); // return head (no deletion)
                setAnimating(false);
                return;
            }

            setActiveLine(19);  // prev = curr
            slowTimeout(() => setActiveLine(20), 250); // curr = curr->next
        }, 700);
    };

    const generateNodeCode = (nodeObj) => {
        // If node was deleted or missing
        if (!nodeObj) {
            return (
    `Node* node {
        int value = null;
        Node* next = null;
    }`
            );
        }

        const id = nodeObj.id ?? "?";
        const nextId = nodeObj.next ? (nodeObj.next.id ?? "?") : null;

        return (
    `Node* node_${id} {
        int value = ${nodeObj.key};
        Node* next = ${nextId !== null ? `node_${nextId}` : "nullptr"};
    }`
        );
    };

    const handleEdit = (index, newVal) => {
        newVal = newVal.trim();

        let key = nodes[index];
        let temp_node = displayList.current.search(key);

        temp_node.key = Number(newVal);
        updateNodes();

        if (selectedNodeRef && temp_node === selectedNodeRef) {
            setSelectedNodeCode(generateNodeCode(temp_node));
        }
    };

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

        const arr = displayList.current.toArrayObjects(); 
        const clickedNodeObj = arr[index];
        setSelectedNodeRef(clickedNodeObj);
        setSelectedNodeCode(generateNodeCode(clickedNodeObj));
    };

    const handleMouseEnter = (index) => {
        setEditingIndex(index);
    }

    return (
        <div className="linkedlist-page">

            {/* Title */}
            <h1 className="page-title">Linked List</h1> 

            {/* Return to home */}
            <Link to="/" className="back-icon">
                <img src="/favicon.ico" alt="Back to Home" />
            </Link>

            {/* Content */}
            <div className="linkedlist-content">
                {/* Visualization */}
                <div className="visualization-area">
                    <div className="node-container">
                        {nodes.map((node, index) => {
                        const value = typeof node === "object" ? node.value : node;
                        return (
                            <React.Fragment key={index}>
                            <div
                                className={`node-box 
                                    ${node.animClass || ""} 
                                    ${activeNodeIndex === index ? "node-highlight" : ""}
                                `}
                                contentEditable={editingIndex === index}
                                suppressContentEditableWarning
                                onClick={() => handleClick(index)}
                                onBlur={(e) => handleBlur(e, index)}
                                onKeyDown={(e) => handleEnter(e, index)}
                                onMouseEnter={() => handleMouseEnter(index)}
                            >
                                {value}
                            </div>
                            {index < nodes.length - 1 && <div className="arrow">→</div>}
                            </React.Fragment>
                        );
                        })}
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
                                    <pre><code>
                                        {selectedNodeCode !== "" ? selectedNodeCode : nodeSnippet}
                                    </code></pre>
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
                    {/* <div className="panel controls-panel">
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
                    </div> */}
                </div>

                {/* Code */}
                <div className="code-panel">
                    <pre>
                        {codeSnippet.map((line, i) => (
                            <div 
                                key={i}
                                className={`code-line ${activeLine === i ? "highlight-line" : ""}`}
                            >
                                {line}
                            </div>
                        ))}
                    </pre>
                </div>
            </div>
        </div>
    );
}

export default LinkedListPage;