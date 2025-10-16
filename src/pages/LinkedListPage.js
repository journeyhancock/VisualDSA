import React from "react";
import { Link } from "react-router-dom";
import "../App.css";

function LinkedListPage() {
    return (
        <div className="App">
            <h1>Linked List Visualizer</h1>
            <p>This page will show linked lists</p>
            <Link to="/" className="back-link">Back to Home</Link>
        </div>
    );
}

export default LinkedListPage;