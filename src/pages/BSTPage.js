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
	const [codeSnippet, setCodeSnippet] = useState([]);
	const [insertSnippet, setInsertSnippet] = useState([]);
	const [deleteSnippet, setDeleteSnippet] = useState([]);
	const [nodeSnippet, setNodeSnippet] = useState(false);
	const [openPanels, setOpenPanels] = useState({
		nodes: false,
		actions: false,
		controls: false,
	});

	// Live Display Editing
	const [insertValue, setInsertValue] = useState("");
	const [deleteValue, setDeleteValue] = useState("");
	const [editingIndex, setEditingIndex] = useState(null);

	// Animation / highlights
	const [animating, setAnimating] = useState(false);
	const [highlightedKey, setHighlightedKey] = useState(null);
	const [deletedKey, setDeletedKey] = useState(null);
	const [insertedKey, setInsertedKey] = useState(null);
	const [hoveredKey, setHoveredKey] = useState(null);
	const [activeLine, setActiveLine] = useState(null);

	// Sidebar toggles
	const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
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

	const updateNodes = () => setNodes(displayTree.current.toArray());

	const getTraversalPath = (val) => {
		const path = [];
		let current = displayTree.current.root;
		while (current) {
			path.push(current.key);
			if (val === current.key) break;
			if (val < current.key) current = current.left;
			else current = current.right;
		}
		return path;
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

		// Line 3: create to_insert
		setActiveLine(3);
		await new Promise(res => setTimeout(res, 300));

		// Line 4: curr_node = root
		setActiveLine(4);
		await new Promise(res => setTimeout(res, 300));

		// Traverse path, highlight tree nodes + code lines
		let currNode = displayTree.current.root;
		while (currNode) {
			setHighlightedKey(currNode.key);
			setActiveLine(6); // while loop
			await new Promise(res => setTimeout(res, 450));

			if (val < currNode.key) {
				setActiveLine(7); // if (val <)
				await new Promise(res => setTimeout(res, 300));

				if (!currNode.left) {
					// Insert left child
					setActiveLine(8);
					await new Promise(res => setTimeout(res, 300));
					setActiveLine(9);
					await new Promise(res => setTimeout(res, 300));
					break;
				}

				setActiveLine(14); // curr = curr->left
				currNode = currNode.left;
			} else {
				setActiveLine(17); // else take right path
				await new Promise(res => setTimeout(res, 300));

				if (!currNode.right) {
					setActiveLine(18);
					await new Promise(res => setTimeout(res, 300));
					setActiveLine(19);
					await new Promise(res => setTimeout(res, 300));
					break;
				}

				setActiveLine(23); // curr = curr->right
				currNode = currNode.right;
			}

			await new Promise(res => setTimeout(res, 450));
		}

		// Perform actual insertion
		displayTree.current.insert(val);
		updateNodes();

		setInsertedKey(val);
		await new Promise(res => setTimeout(res, 700));

		setInsertedKey(null);
		setHighlightedKey(null);
		setActiveLine(28); // return root

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

		// Line 1: if (root == nullptr)
		setActiveLine(1);
		await new Promise(res => setTimeout(res, 300));

		const tree = displayTree.current;
		const toDelete = tree.search ? tree.search(val) : null;

		// Line 3: to_delete = search(...)
		setActiveLine(3);
		await new Promise(res => setTimeout(res, 350));

		if (!toDelete) {
			setActiveLine(4); // not found
			await new Promise(res => setTimeout(res, 350));
			alert("Value not found.");
			setAnimating(false);
			return;
		}

		// CASE 1 — leaf node
		if (!toDelete.left && !toDelete.right) {
			setActiveLine(6);
			setHighlightedKey(toDelete.key);
			await new Promise(res => setTimeout(res, 600));

			setActiveLine(14); // return root
			tree.treeDelete(val);
			updateNodes();

			await new Promise(res => setTimeout(res, 500));
			setHighlightedKey(null);
			setAnimating(false);
			return;
		}

		// CASE 2 — one child
		if (!toDelete.left || !toDelete.right) {
			setActiveLine(17);
			setHighlightedKey(toDelete.key);
			await new Promise(res => setTimeout(res, 600));

			setActiveLine(31); // return root
			tree.treeDelete(val);
			updateNodes();

			await new Promise(res => setTimeout(res, 500));
			setHighlightedKey(null);
			setAnimating(false);
			return;
		}

		// CASE 3 — two children
		setActiveLine(34); // find successor
		await new Promise(res => setTimeout(res, 400));

		const succ = tree.findSuccessor(val);
		if (succ) {
			setActiveLine(36);
			setHighlightedKey(succ.key);
			await new Promise(res => setTimeout(res, 500));
		}

		tree.treeDelete(val);
		updateNodes();

		setActiveLine(51); // return root
		await new Promise(res => setTimeout(res, 400));

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
			{/* Sidebar */}
			<Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

			{/* Hamburger */}
			<div className="hamburger" onClick={toggleSidebar}>
				<div className="bar"></div>
				<div className="bar"></div>
				<div className="bar"></div>
			</div>

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
									<pre><code>{nodeSnippet}</code></pre>
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