import banner from './BannerText.png';
import linkedListImg from './linkedList.png'; // Image Credit: https://github.com/ngryman/ds-linked-list
import bstImg from './bst.png'; // Image Credit: https://www.cs.cmu.edu/~rdriley/121/notes/bst/
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import './App.css';

import LinkedListPage from "./LinkedListPage";
import BSTPage from "./BSTPage"

function Layout({ children }) {
  return (
    <div className="App">
      {children}
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <Layout>
            <div className="header">
              <img src={banner} alt="VisualDSA" className="header-banner" />
            </div>
            <div className="modules">
              <Link to="/linkedlist" className="selection">
                <img src={linkedListImg} alt="Linked List" className="selection-image" />
                <span className="selection-text">Linked List</span>
              </Link>
              <Link to="/binarysearchtree" className="selection">
                <img src={bstImg} alt="Binary Search Tree" className="selection-image" />
                <span className="selection-text">Binary Search Tree</span>
              </Link>
            </div>
          </Layout>
        }/>
      
        <Route path="/linkedlist" element={
          <Layout>
            <LinkedListPage />
          </Layout>
        }/>
        <Route path="/binarysearchtree" element={
          <Layout>
            <BSTPage />
          </Layout>
        }/>
      </Routes>
    </Router>
  );
}

export default App;
