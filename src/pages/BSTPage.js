import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { BST } from "../data_structures/BST";
import { Node } from "../data_structures/BST";
import "../App.css";
import "./styles/BSTPage.css";

const SPEED_MULTIPLIER = 5;
const delay = (ms) => new Promise(res => setTimeout(res, ms * SPEED_MULTIPLIER));

function verifyInput(value) {
	return (!Number.isInteger(Number(value)) || value === "" || value.includes("."));
}

function BSTPage() {
	// Tree Display
	const displayTree = useRef(new BST());
	const initialized = useRef(false);
	// eslint-disable-next-line
	const [nodes, setNodes] = useState(displayTree.current.toArray());

	// Actions and state
	const [codeSnippet, setCodeSnippet] = useState([]);
	const [insertSnippet, setInsertSnippet] = useState([]);
	const [deleteSnippet, setDeleteSnippet] = useState([]);
	const [nodeSnippet, setNodeSnippet] = useState(false);
	const [openPanels, setOpenPanels] = useState({
		nodes: false,
		actions: false,
		controls: false,
	});
	const [selectedKey, setSelectedKey] = useState(null);
	const [selectedNodeCode, setSelectedNodeCode] = useState("");
	const [skipReselect, setSkipReselect] = useState(false);

	// Live Display Editing
	const [insertValue, setInsertValue] = useState("");
	const [deleteValue, setDeleteValue] = useState("");
	const [editingIndex, setEditingIndex] = useState(null);

	// Animation / highlights
	const [animating, setAnimating] = useState(false);
	const [highlightedKey, setHighlightedKey] = useState(null);
	const [deletedKey] = useState(null);
	const [insertedKey, setInsertedKey] = useState(null);
	const [hoveredKey, setHoveredKey] = useState(null);
	const [activeLine, setActiveLine] = useState(null);

	const togglePanel = (panel) => {
		setOpenPanels((prev) => ({
			...prev,
			[panel]: !prev[panel],
		}));
	};

	useEffect(() => {
		fetch("/code/BST/insert_node.txt")
			.then((res) => res.text())
			.then((text) => setInsertSnippet(text.split("\n")))
			.catch((err) => console.error("Error loading code:", err));
	}, []);

	useEffect(() => {
		fetch("/code/BST/delete_node.txt")
			.then((res) => res.text())
			.then((text) => setDeleteSnippet(text.split("\n")))
			.catch((err) => console.error("Error loading code:", err));
	}, []);

	useEffect(() => {
		fetch("/code/BST/node.txt")
			.then((res) => res.text())
			.then((text) => setNodeSnippet(text.split("\n")))
			.catch((err) => console.error("Error loading code:", err));
	}, []);

	useEffect(() => {
		if (initialized.current) return;
		initialized.current = true;

		const tree = displayTree.current;
		tree.root = new Node();
		tree.root.key = 5;
		[3, 9].forEach((val) => tree.insert(val));
		setNodes(tree.toArray());
	}, []);

	const updateNodes = () => {
		const arr = displayTree.current.toArray();
		setNodes(arr);

		if (skipReselect) {
			setSkipReselect(false);
			return;
		}

		if (selectedKey !== null) {
			const stillExists = !!displayTree.current.search(selectedKey);

			if (stillExists) {
				const nodeObj = displayTree.current.search(selectedKey);
				setSelectedNodeCode(generateNodeCode(nodeObj));
			} else {
				setSelectedKey(null);
				setSelectedNodeCode(generateNodeCode(null));
			}
		}
	};

	const formatBlock = (str) => str.trim().split("\n").map(line => line.trimEnd()).join("\n");

	const generateNodeCode = (nodeObj) => {
		if (!nodeObj) {
			return formatBlock(
	`Node* node {
		int value = null;
		Node* left = null;
		Node* right = null;
		Node* parent = null;
	}`
			);
		}

		const id = nodeObj._id;
		const leftId = nodeObj.left ? nodeObj.left._id : null;
		const rightId = nodeObj.right ? nodeObj.right._id : null;
		const parentId = nodeObj.parent ? nodeObj.parent._id : null;

		return formatBlock(
	`Node* node_${id} {
		int value = ${nodeObj.key};
		Node* left = ${leftId !== null ? `node_${leftId}` : "nullptr"};
		Node* right = ${rightId !== null ? `node_${rightId}` : "nullptr"};
		Node* parent = ${parentId !== null ? `node_${parentId}` : "nullptr"};
	}`
		);
	};

	const handleInsert = async () => {
		setCodeSnippet(insertSnippet.join("\n"));

		const trimmedVal = insertValue.trim();
		if (verifyInput(trimmedVal)) {
			alert("Enter a valid integer");
			return;
		}

		const val = Number(trimmedVal);
		setInsertValue("");

		if (displayTree.current.search && displayTree.current.search(val)) {
			alert("Duplicate keys are not allowed.");
			return;
		}

		if (animating) return;
		setAnimating(true);

		setActiveLine(3);
		await delay(300);

		setActiveLine(4);
		await delay(300);

		// Traverse path and highlight tree nodes + code lines
		let currNode = displayTree.current.root;
		while (currNode) {
			setHighlightedKey(currNode.key);
			setActiveLine(6); 
			await delay(450);

			if (val < currNode.key) {
				setActiveLine(7); 
				await delay(300);

				if (!currNode.left) {
					// Insert left child
					setActiveLine(8);
					await delay(300);
					setActiveLine(9);
					await delay(300);
					break;
				}

				setActiveLine(14);
				currNode = currNode.left;
			} else {
				setActiveLine(17);
				await delay(300);

				if (!currNode.right) {
					setActiveLine(18);
					await delay(300);
					setActiveLine(19);
					await delay(300);
					break;
				}

				setActiveLine(23); 
				currNode = currNode.right;
			}

			await delay(450);
		}

		// Perform actual insertion
		displayTree.current.insert(val);
		updateNodes();

		setInsertedKey(val);
		await delay(700);

		setInsertedKey(null);
		setHighlightedKey(null);
		setActiveLine(28);

		setAnimating(false);
	};

	const handleDelete = async () => {
		setCodeSnippet(deleteSnippet.join("\n"));

		const trimmedVal = deleteValue.trim();
		if (verifyInput(trimmedVal)) {
			alert("Enter a valid integer");
			return;
		}

		const val = Number(trimmedVal);
		setDeleteValue("");

		if (animating) return;
		setAnimating(true);

		const tree = displayTree.current;

		setActiveLine(0);
		await delay(300);
		if (!tree.root) {
			setActiveLine(1);
			await delay(350);
			alert("Tree is empty.");
			setAnimating(false);
			return;
		}

		setActiveLine(3);
		await delay(350);

		let curr = tree.root;
		while (curr) {
			setHighlightedKey(curr.key);
			await delay(450);
			if (val === curr.key) break;
			curr = val < curr.key ? curr.left : curr.right;
		}

		setActiveLine(4);
		await delay(350);

		const toDelete = tree.search ? tree.search(val) : null;

		if (!toDelete) {
			alert("Value not found.");
			setHighlightedKey(null);
			setAnimating(false);
			return;
		}

		if (selectedKey === val) {
			setSelectedKey(null);
			setSelectedNodeCode(generateNodeCode(null));
		}

		// CASE 1: leaf node
		if (!toDelete.left && !toDelete.right) {
			setActiveLine(6);
			await delay(450);

			if (!toDelete.parent) {
				setActiveLine(7);
				await delay(350);
				setActiveLine(8);
				await delay(350);
			} else if (toDelete.parent.left === toDelete) {
				setActiveLine(9);  
				await delay(350);
				setActiveLine(10); 
				await delay(350);
			} else {
				setActiveLine(12); 
				await delay(350);
			}

			setActiveLine(15); 
			await delay(350);
			tree.treeDelete(val);
			updateNodes();

			setActiveLine(16); 
			await delay(400);
			setHighlightedKey(null);
			setAnimating(false);
			return;
		}

		// CASE 2: one child 
		if (!toDelete.left || !toDelete.right) {
			setActiveLine(19); 
			await delay(450);

			setActiveLine(20); 
			await delay(300);

			if (toDelete.left) {
				setActiveLine(21); 
				await delay(300);
				setActiveLine(22); 
				await delay(350);
			} else {
				setActiveLine(24); 
				await delay(350);
			}

			if (!toDelete.parent) {
				setActiveLine(27); 
				await delay(300);
				setActiveLine(28); 
				await delay(350);
			} else if (toDelete.parent.left === toDelete) {
				setActiveLine(29); 
				await delay(300);
				setActiveLine(30); 
				await delay(350);
			} else {
				setActiveLine(32); 
				await delay(350);
			}

			setActiveLine(35);
			await delay(350);
			setActiveLine(36);
			await delay(350);
			tree.treeDelete(val);
			updateNodes();

			setActiveLine(38); 
			await delay(400);
			setHighlightedKey(null);
			setAnimating(false);
			return;
		}

		// CASE 3: two children
		setActiveLine(41);
		await delay(450);

		const succ = tree.findSuccessor ? tree.findSuccessor(val) : null;

		setActiveLine(43);
		await delay(350);

		if (succ) {
			let s = tree.root;
			while (s && s.key !== succ.key) {
				setHighlightedKey(s.key);
				await delay(350);
				s = succ.key < s.key ? s.left : s.right;
			}
			setHighlightedKey(succ.key);

			setActiveLine(44);
			await delay(450);

			if (succ.parent && succ.parent.left === succ) {
				setActiveLine(46); 
				await delay(350);
				setActiveLine(47);
				await delay(350);
			} else {
				setActiveLine(49); 
				await delay(350);
			}

			if (succ.right) {
				setActiveLine(52); 
				await delay(350);
				setActiveLine(53);
				await delay(350);
			}

			setActiveLine(56);
			await delay(400);
		}

		tree.treeDelete(val);
		updateNodes();

		setActiveLine(59); 
		await delay(400);

		setHighlightedKey(null);
		setAnimating(false);
	};

	const handleEdit = (oldKey, newValStr) => {
		const newValTrim = newValStr.trim();
		if (verifyInput(newValTrim)) {
			alert("Enter a valid integer");
			return;
		}
		const newKey = Number(newValTrim);
		const tree = displayTree.current;

		const found = tree.search && tree.search(newKey);
		if (found && newKey !== oldKey) {
				alert("Duplicate keys are not allowed.");
				const el = document.querySelector(`.tree-node[data-key='${oldKey}']`);
				if (el) el.textContent = oldKey;
				updateNodes();
				return;
		}

		if (newKey === oldKey) {
			updateNodes();
			return;
		}

		setAnimating(true);
		setHighlightedKey(oldKey);
		setTimeout(() => {
			tree.treeDelete(oldKey);
			tree.insert(newKey);
			updateNodes();
			setInsertedKey(newKey);
			setHighlightedKey(null);
			setTimeout(() => {
				setInsertedKey(null);
				setAnimating(false);
			}, 700);
		}, 450);
	};

	const handleBlur = (e, key) => {
		const newVal = e.target.textContent.trim();
		if (editingIndex === key) {
			if (verifyInput(newVal)) {
				alert("Enter a valid integer");
				e.target.textContent = key;
				setEditingIndex(null);
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
		if (animating) return;

		setSelectedKey(key);
		const realNode = displayTree.current.search(key);
		setSelectedNodeCode(generateNodeCode(realNode));

		setEditingIndex(key);
		
		setTimeout(() => {
			const el = document.querySelector(`.tree-node[data-key='${key}']`);
			if (el) {
				el.setAttribute("contenteditable", "true");
				el.focus();

				const range = document.createRange();
				const sel = window.getSelection();
				range.selectNodeContents(el);
				range.collapse(false);
				sel.removeAllRanges();
				sel.addRange(range);
			}
		}, 0);
	};

	const handleMouseEnter = (key) => {
		setHoveredKey(key);
	};

	const handleMouseLeave = () => {
		setHoveredKey(null);
	};

	const renderTree = (node, x = 0, y = 0, level = 0, spacing = 220, lines = []) => {
		if (!node) return { elements: [], lines };
		const offset = spacing / Math.pow(2, level);
		const cx = x, cy = y;

		const nodeClasses = [
			"tree-node",
			highlightedKey === node.key ? "node-highlight" : "",
			deletedKey === node.key ? "node-deleting" : "",
			insertedKey === node.key ? "node-inserting" : "",
			hoveredKey === node.key ? "node-hovered" : "",
		].join(" ");

		const elements = [
			<div
				key={node.key}
				data-key={node.key}
				className={nodeClasses}
				style={{
					left: `calc(50% + ${x}px)`,
					top: `${y}px`,
				}}
				contentEditable={editingIndex === node.key}
				autoFocus={editingIndex === node.key}
				suppressContentEditableWarning
				onClick={() => handleClick(node.key)}
				onBlur={(e) => handleBlur(e, node.key)}
				onKeyDown={(e) => handleEnter(e)}
				onMouseEnter={() => handleMouseEnter(node.key)}
				onMouseLeave={() => handleMouseLeave()}
				tabIndex={0}
			>
				<span>{node.key}</span>
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

	const { elements, lines } = renderTree(displayTree.current.root);

	return (
		<div className="bst-page">

			<h1 className="page-title">Binary Search Tree</h1>

			<Link to="/" className="back-icon">
				<img src="/favicon.ico" alt="Back to Home" />
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
									y2={l.y2 + 25}
									stroke="#F0F6FC"
									strokeWidth="2"
								/>
							))}
						</svg>

						<div className="tree-layout">{elements}</div>
					</div>
				</div>

				{/* Side Actions */}
				<div className="side-actions">
					<div className="panel nodes-panel">
						<div className="panel-header" onClick={() => togglePanel("nodes")}>
							<div className={`triangle-icon ${openPanels.nodes ? "open" : ""}`}></div>
							<h3>Nodes</h3>
						</div>

						{openPanels.nodes && (
							<div className="panel-body nodes-body">
								<div className="code-panel small">
									<pre><code>
									{selectedNodeCode !== "" ? selectedNodeCode : nodeSnippet.join("\n")}
									</code></pre>
								</div>
							</div>
						)}
					</div>

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
										disabled={animating}
									/>
								</div>

								<div className="actions-row">
									<button className="actions-button" onClick={handleDelete}>Delete</button>
									<input
										type="text"
										placeholder="Type a value here"
										value={deleteValue}
										onChange={(e) => setDeleteValue(e.target.value)}
										disabled={animating}
									/>
								</div>
							</div>
						)}
					</div>
				</div>

				<div className="code-panel">
					<pre>
						{String(codeSnippet)
							.split("\n")
							.map((line, i) => (
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

export default BSTPage;