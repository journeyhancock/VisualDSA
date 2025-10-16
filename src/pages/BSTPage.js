import React from "react";
import { Link } from "react-router-dom";
import "../App.css"

function BSTPage() {
    return (
        <div className="App">
            <h1>Binary Search Tree Visualizer</h1>
            <p>This page will show binary search trees</p>
            <Link to="/" className="back-link">Back to Home</Link>
        </div>
    );
}

export default BSTPage;