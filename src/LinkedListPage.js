import React from "react";
import linkedListImg from './linkedList.png'; // Image Credit: https://github.com/ngryman/ds-linked-list
import './LinkedListPage.css'

function linkedListPage() {
  return (
    <div className="linkedListPage">
        <div className="header">
          <h1>Linked Lists</h1>
          <img src={linkedListImg} alt="Linked List" className="header-image"/>
        </div>
    </div>
  );
}

export default linkedListPage;
