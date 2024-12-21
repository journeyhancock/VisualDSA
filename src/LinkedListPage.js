import React, { useState } from "react";
import linkedListImg from './linkedList.png'; // Image Credit: https://github.com/ngryman/ds-linked-list
import './LinkedListPage.css'
import { LinkedList } from './data_structures/LinkedList.js'

const displayList = new LinkedList();
displayList.insert(1);
displayList.insert(2000);
displayList.insert(3);
let nodes = displayList.toArray();

function LinkedListPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [insertValue, setInsertValue] = useState("");
  const [deleteValue, setDeleteValue] = useState("");
  const [currentEdit, setCurrentEdit] = useState(null);

  const edit = (index, newKey) => {
    newKey = newKey.trim()
    if (!Number.isInteger(Number(newKey)) || newKey === "" || newKey.includes(".")) {
      alert("Enter a valid integer");
      return;
    }
    let key = nodes[index];
    let temp = displayList.search(key);
    temp.key = Number(newKey);
    nodes = displayList.toArray();
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
      nodes = displayList.toArray();
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
      nodes = displayList.toArray();
      displayList.print();
    }
  }

  return (
    <div className="linkedListPage">
        <div className="header">
          <h1>Linked Lists</h1>
          <img src={linkedListImg} alt="Linked List" className="header-image"/>
        </div>
        <div className="linkedListDisplay" id="linkedListDisplay">
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

        <div className="dropdown-container">
          <div onClick={toggleDropdown} className="dropdown-button">
            Edit Linked List {isOpen ? "▲" : "▼"}
          </div>
          {
            isOpen && (
              <div className="dropdown-options">
                <div className="dropdown-option">
                  <div onClick={listInsertValue} className="dropdown-action">
                      Insert:
                  </div>
                  <input
                    type="text"
                    value={insertValue}
                    onChange={(e) => setInsertValue(e.target.value)}
                    className="dropdown-input"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        listInsertValue();
                      }
                    }}
                  />
                </div>
                <div className="dropdown-option">
                  <div onClick={listDeleteValue} className="dropdown-action">
                      Delete:
                  </div>
                  <input
                    type="text"
                    value={deleteValue}
                    onChange={(e) => setDeleteValue(e.target.value)}
                    className="dropdown-input"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        listDeleteValue();
                      }
                    }}
                  />
                </div>
              </div>
            )
          }
        </div>
    </div>
  );
}

export default LinkedListPage;