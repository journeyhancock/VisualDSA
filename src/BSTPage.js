import bstImg from './bst.png'; // Image Credit: https://www.cs.cmu.edu/~rdriley/121/notes/bst/

function BSTPage() {
    return (
        <div className="bstPage">
            <div className="header">
              <h1>Binary Search Trees</h1>
              <img src={bstImg} alt="Binary Search Tree" className="header-image"/>
            </div>
        </div>
    );
}

export default BSTPage