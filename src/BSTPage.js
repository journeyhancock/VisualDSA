import React, { useState } from "react";
import bstImg from './bst.png'; // Image Credit: https://www.cs.cmu.edu/~rdriley/121/notes/bst/
import './BSTPage.css'
import { BST } from './data_structures/BST.js'

const displayList = new BST();
displayList.insert(5);
displayList.insert(3);
displayList.insert(7);
displayList.insert(2);
displayList.insert(9);

function treeViolation(list) {
    let curr = list.root;
    let stack = [];

    while (stack.length > 0 || curr) {
        while (curr) {
            stack.push(curr);
            curr = curr.left;
        }

        curr = stack.pop();

        if (curr.left && curr.left.key >= curr.key) {
            return true;
        }
        if (curr.right && curr.right.key <= curr.key) {
            return true;
        }
        
        curr = curr.right;
    }
    return false;
}

function BSTPage() {
    const [isOpen, setIsOpen] = useState(false);
    const [insertValue, setInsertValue] = useState("");
    const [deleteValue, setDeleteValue] = useState("");
    const [currentEdit, setCurrentEdit] = useState(null);
    const [nodes, setNodes] = useState(displayList.toArray());

    const edit = (index, newKey) => {
        if (displayList.toArray().includes(Number(newKey))) {
            alert("Value change violates BST");
            return;
        } 

        newKey = newKey.trim()
        if (!Number.isInteger(Number(newKey)) || newKey === "" || newKey.includes(".")) {
            alert("Enter a valid integer");
            return;
        }

        let key = nodes[index];
        let temp = displayList.search(key);
        if (temp) {
            temp.key = Number(newKey);
        } else {
            displayList.editByPosition(index + 1, Number(newKey));
        }
        

        if (treeViolation(displayList)) {
            alert("Value change violates BST");
            if (temp) {
                temp.key = key;
            } else {
                displayList.editByPosition(index + 1, key);
            }
            return;
        }

        setNodes(displayList.toArray());
        displayList.print();
    }

    const enter = (event, index) => {
        if (event.key === "Enter") {
            event.preventDefault();
            event.target.blur();
        }
    }

    const nodeClick = (index) => {
        setCurrentEdit(index);
    }

    const nodeBlur = (index, e) => {
        if (index === currentEdit) {
            edit(index, e.target.textContent);
            setCurrentEdit(null);
            e.target.textContent = nodes[index];
        }
    }

    const mouseEnter = (index) => {
        setCurrentEdit(index);
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    }

    const listInsertValue = () => {
        setInsertValue(insertValue.trim());
        
        if (!Number.isInteger(Number(insertValue)) || insertValue === "" || insertValue.includes(".")) {
            alert("Enter a valid integer");
            return;
        } else {
            displayList.insert(Number(insertValue));
            setInsertValue("");
            setNodes(displayList.toArray());
            displayList.print();
        }
    }

    const listDeleteValue = () => {
        setDeleteValue(deleteValue.trim());

        if (!Number.isInteger(Number(deleteValue)) || deleteValue === "" || deleteValue.includes(".")) {
            alert("Enter a valid integer");
            return;
        } else {
            displayList.listDelete(Number(deleteValue));
            setDeleteValue("");
            setNodes(displayList.toArray());
            displayList.print();
        }
    }

    return (
        <div className="bstPage">
            <div className="header">
              <h1>Binary Search Trees</h1>
              <img src={bstImg} alt="Binary Search Tree" className="header-image"/>
            </div>
            <div className="bstDisplay" id="bstDisplay">
                <div className="node-container" onClick={(e) => e.stopPropagation()}>
                {nodes.map((key, index) => {
                    const node = (
                    <div 
                        key={index} 
                        className="node-box" 
                        contentEditable={currentEdit === index}
                        suppressContentEditableWarning="true"
                        onClick={() => nodeClick(index)}
                        onBlur={(e) => nodeBlur(index, e)}
                        onKeyDown={(e) => enter(e, index)}
                        onMouseEnter={() => mouseEnter(index)}
                    >
                        {key}
                    </div>
                    );

                    if (index < nodes.length - 1) {
                    return (
                        <>
                        {node}
                        <div className="arrow">
                        →
                        </div>
                        </>
                    );
                    } else {
                    return node;
                    }
                })}
                </div>
            </div>
        </div>
    );
}

export default BSTPage