import banner from './BannerText.png';
import linkedListImg from './linkedList.png'; // Image Credit: https://github.com/ngryman/ds-linked-list
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import './App.css';

import LinkedListPage from "./LinkedListPage";

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
              {/* <Link to="/page1" className="selection">Go to Page 2</Link>
              <Link to="/page1" className="selection">Go to Page 3</Link> */}
            </div>
          </Layout>
        }/>
      
        <Route path="/linkedlist" element={
          <Layout>
            <LinkedListPage />
          </Layout>
        }/>
      </Routes>
    </Router>
  );
}

export default App;
