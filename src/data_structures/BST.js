class Node {
    constructor() {
        this.parent = null;
        this.left = null;
        this.right = null;
        this.key = null;
    }
}

class BST {
    constructor() {
        this.root = null;
    }

    search = function(key) {
        let curr = this.root; 
    
        while (curr != null) {
            if (curr.key == key) {
                return curr;
            }

            curr = key < curr.key ? curr.left : curr.right;
        }
        return null; 
    }

    findSuccessor = function(key) {
        let curr = this.root;
        let successor = null;

        while (curr != null) {
            if (key < curr.key) {
                successor = curr;
                curr = curr.left;
            } else if (key >= curr.key) {
                curr = curr.right;
            } else {
                break;
            }
        }

        return successor;
    }

    insert = function(key) {
        let curr = this.root; 
        let parent = null;
        let temp = new Node();
        temp.key = key;

        if (this.root == null) {
            this.root = temp;
            return;
        }

        while (curr != null) {
            parent = curr;
            if (key < curr.key) {
                curr = curr.left;
            } else {
                curr = curr.right;
            }
        }

        if (key < parent.key) {
            parent.left = temp;
        } else {
            parent.right = temp;
        }

        temp.parent = parent;
    }

    treeDelete = function(key) {
        let toDelete = this.search(key);

        if (toDelete == null) {
            return;
        }

        if (toDelete.left == null && toDelete.right == null) {
            if (toDelete.parent == null) {
                this.root = null;
            } else if (toDelete.parent.left == toDelete) {
                toDelete.parent.left = null;
            } else {
                toDelete.parent.right = null;
            }
            return;
        }

        if (toDelete.right == null || toDelete.right == null) {
            let child = toDelete.left != null ? toDelete.left : toDelete.right;

            if (toDelete.parent == null) {
                this.root = child;
            } else if (toDelete.parent.left == toDelete) {
                toDelete.parent.left = child;
            } else {
                toDelete.parent.right = child;
            }

            child.parent = toDelete.parent;
            return;
        }

        let successor = this.findSuccessor(toDelete.key);
        
        if (successor != null) {
            toDelete.key = successor.key;

            if (successor.parent.left == successor) {
                successor.parent.left = successor.right;
            } else {
                successor.parent.right = successor.right;
            }

            if (successor.right != null) {
                successor.right.parent = successor.parent;
            }
        }
    }

    // in-order traversal
    print = function() {
        const stack = [];
        let curr = this.root; 
        const message = [];
        
        while (curr != null || stack.length > 0) {
            while (curr != null) {
                stack.push(curr);
                curr = curr.left;
            }

            curr = stack.pop();
            message.push(curr.key)

            curr = curr.right;
        }

        console.log(message);
    }
}