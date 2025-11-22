import './App.css';
import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import headerBanner from "./assets/images/banner_text.png";
import linkedListImg from "./assets/images/linked_list.png"
import bstImg from "./assets/images/bst.png"

import LinkedListPage from "./pages/LinkedListPage";
import BSTPage from "./pages/BSTPage";
import LinkedListQuizPage from "./pages/LinkedListQuizPage";
import BSTQuizPage from './pages/BSTQuizPage';

import {useState} from "react";

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
          <li><Link to="/quiz/linkedlist" onClick={toggleSidebar}>Linked List</Link></li>
          <li><Link to="/quiz/bst" onClick={toggleSidebar}>Binary Search Tree</Link></li>
        </ul>

        <h3>Code</h3>
        <ul>
          <li><Link to="/code" onClick={toggleSidebar}>Linked List</Link></li>
          <li><Link to="/code" onClick={toggleSidebar}>Binary Search Tree</Link></li>
        </ul>
      </div>
    </div>
  )
}

function Home({toggleSidebar}) {
  return (
    <div className="App">
      {/* Banner Header */}
      <header className="header">
        <img src={headerBanner} alt="VisualDSA" className="header-banner" />
      </header>

      {/* Hamburger Sidebar */}
      <div className="hamburger" onClick={toggleSidebar}>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>

      {/* Module Grid */}
      <div className="modules">
        <Link to="/linkedlist" className="module-link">
          <div className="module">
            <h2 className="module-title">Linked List</h2>
            <img src={linkedListImg} alt="Linked List" className="module-image" />
          </div>
        </Link>

        <Link to="/bst" className="module-link">
          <div className="module">
            <h2 className="module-title">Binary Search Tree</h2>
            <img src={bstImg} alt="Linked List" className="module-image" />
          </div>
        </Link>

        <div className="module">
          <h2 className="module-title">Name</h2>
          {/* <img src={linkedListImg} alt="name" className="module-image" /> */}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <Router>
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <Routes>
        <Route path="/" element={<Home toggleSidebar={toggleSidebar} />} />
        <Route path="/linkedlist" element={<LinkedListPage />} />
        <Route path="/bst" element={<BSTPage />} />
        <Route path="/quiz/linkedlist" element={<LinkedListQuizPage />} />
        <Route path="/quiz/bst" element={<BSTQuizPage />} />
      </Routes>
    </Router>
  );
}

export default App;