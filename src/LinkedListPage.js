import React from "react";
import linkedListImg from './linkedList.png'; // Image Credit: https://github.com/ngryman/ds-linked-list
import './LinkedListPage.css'
import { LinkedList } from './data_structures/LinkedList.js'

const displayList = new LinkedList();
displayList.insert(1);
displayList.insert(2000);
displayList.insert(3);

function linkedListPage() {
  let nodes = displayList.toArray();

  const edit = (index, newKey) => {
    newKey = newKey.trim()
    if (!Number.isInteger(Number(newKey)) || newKey === "" || newKey.includes(".")) {
      alert("Enter a valid integer");
      return;
    }
    let key = nodes[index];
    let temp = displayList.search(key);
    temp.key = newKey;
    nodes = displayList.toArray();
    displayList.print();
  }

  const enter = (event, index) => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.target.blur();
    }
  }

  return (
    <div className="linkedListPage">
        <div className="header">
          <h1>Linked Lists</h1>
          <img src={linkedListImg} alt="Linked List" className="header-image"/>
        </div>
        <div className="linkedListDisplay" id="linkedListDisplay">
          <div className="node-container">
            {nodes.map((key, index) => {
              const node = (
                <div 
                  key={index} 
                  className="node-box" 
                  contentEditable="true"
                  suppressContentEditableWarning="true"
                  onBlur={(e) => edit(index, e.target.textContent)}
                  onKeyDown={(e) => enter(e, index)}
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

export default linkedListPage;
