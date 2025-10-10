INT_MAX = 2147483647;

class Node {
    constructor(key = null, color = 0, parent = null, left = null, right = null) {
        this.key = key;
        this.color = color; // 0 = black, 1 = red
        this.parent = parent;
        this.left = left;
        this.right = right;
    }
}

class RBT {
    constructor() {
        this.NIL = new Node(INT_MAX, 0);
        this.NIL.left = this.NIL.right = this.NIL.parent = this.NIL;
        this.root = this.NIL;
    }

    rotate = function(x, grandparent) {
        if (x.parent.right == x) {
            // Left Rotate
            let alpha = x.parent.left;
            let beta = x.left;
            let gamma = x.right;
            let a = x.parent;
            let b = x;
            let pi = grandparent;

            let temp_color = x.parent.color;
            x.parent.color = x.color;
            x.color = temp_color;

            if (pi != null) {
                pi.right == a ? pi.right = b : pi.left = b;
            } else {
                this.root = x;
            }

            b.parent = pi;
            b.left = a;
            a.parent = b;
            a.left = alpha;
            a.right = beta;
            alpha.parent = a;
            beta.parent = a;
            b.right = gamma;
            gamma.parent = b;
        } else {
            // Right Rotate
            let alpha = x.left;
            let beta = x.right;
            let gamma = x.parent.right;
            let a = x;
            let b = x.parent;
            let pi = grandparent;

            let temp_color = x.parent.color;
            x.parent.color = x.color;
            x.color = temp_color;

            if (pi != null) {
                pi.right == b ? pi.right = a : pi.left = a;
            } else {
                this.root = x;
            }

            a.parent = pi;
            a.right = b;
            b.parent = a;
            b.right = gamma;
            b.left = beta;
            gamma.parent = b;
            beta.parent = b;
            a.left = alpha;
            alpha.parent = a;
        }
    }

    printTree = function(root) {
        let curr = root;

        if (root.key == INT_MAX) {
            console.log("Error: Tree is NULL");
        }

        if (curr != null) {
            let color_one = curr.color == 0 ? "B" : "R";
            
            if (curr.left != this.NIL) {
                let color_two = curr.left.color == 0 ? "B" : "R";
                console.log("${color_one} ${curr.key} ${color_one} ->LEFT-> ${color_two} ${curr.left.key} ${color_two}");
                printTree(curr.left, this.NIL);
            }
            if (curr.right != this.NIL) {
                let color_two = curr.right.color == 0 ? "B" : "R";
                console.log("${color_one} ${curr.key} ${color_one} ->RIGHT-> ${color_two} ${curr.right.key} ${color_two}");
                printTree(curr.right, this.NIL);
            }
        }
    }

    insert = function(key) {
        let curr = this.root;
        let x = new Node(key, 1, this.NIL, this.NIL, this.NIL);

        // BST Insertion
        while (curr != this.NIL) {
            if (key < curr.key) {
                if (curr.left == this.NIL) {
                    curr.left = x;
                    x.parent = curr;
                    break;
                }
                curr = curr.left;
                this.root = curr; 
            }

            if (key > curr.key) {
                if (curr.right == this.NIL) {
                    curr.right = x;
                    x.parent = curr;
                    break;
                }
                curr = curr.right;
                this.root = curr;
            }   
        }

        while (x.color == 1 && x.parent.color == 1) {
            // Case 1: x.color == 1, x.parent.color == 1, uncle.color == 1
            // Get uncle of x
            let uncle = new Node();
            let grandparent = new Node();
            grandparent = x.parent.parent;
            grandparent.left == x.parent ? uncle = grandparent.right : uncle = grandparent.left;

            if (x.color == 1 && x.parent.color == 1 && uncle.color == 1) {
                x.parent.color = 0;
                uncle.color = 0;
                if (x.parent.parent == root) {
                    break;
                }
                x.parent.parent.color = 1;
                x = x.parent.parent;
            }

            // Case 2: x.color == 1, x.parent.color == 1, uncle.color == 0, x is near uncle
            grandparent = x.parent.parent;
            grandparent.left == x.parent ? uncle = grandparent.right : uncle = grandparent.left

            if (x.color == 1 && x.parent.color == 1) {
                // Check if x is near uncle
                if ((x.parent.right == x && grandparent.right == uncle) || (x.parent.left == x && grandparent.left == uncle)) {
                    rotate(this.root, x, grandparent);
                    x.left.color == 1 ? x = x.left : x = x.right;
                }
            }

            // Case 3: x.color == 1, x.parent.color == 1, uncle.color == 0, x is far from uncle
            if (x.color == 1 && x.aprent.color == 1) {
                // Check if x is far from uncle
                if ((x.aprent.right == x && grandparent.left == uncle) || (x.parent.left == x && grandparent.right == uncle)) {
                    x = x.parent;
                    grandparent = grandparent.parent;
                    rotate(this.root, x, grandparent);
                }
            }
        }
    }

    bstDelete = function(key) {
        let z = search(this.root, key, this.NIL);

        // Case 1
        if (z.left == this.NIL && z.right == this.NIL) {
            z.parent.left == z ? z.parent.left = this.NIL : z.parent.right = this.NIL;
            return z;
        }

        // Case 2
        if (z.left == this.NIL || z.right == this.NIL) {
            if (z.left != this.NIL) {
                z.parent.left == z ? z.parent.left = z.left : z.parent.right = z.left;
                return z;
            }
            z.parent.left == z ? z.parent.left = z.right : z.parent.right = z.right;
            return z;
        }

        // Case 3
        // Find successor
        let curr = new Node();
        let successor = new Node();
        curr = this.root

        while (curr != this.NIL) {
            if (z.key < curr.key) {
                successor = curr;
                curr = curr.left;
            } else if (z.key >= curr.key) {
                curr = curr.right;
            } else {
                break;
            }
        }

        return bstDelete(successor.key); // Delete successor
    }

    treeDelete = function(key) {
        let y = bstDelete(key); // Successor node

        let x = new Node(); // x will move into y's spot
        if (y.left != this.NIL) {
            x = y.left;
        } else if (y.right != this.NIL) {
            x = y.right;
        } else {
            x.parent = y.parent;
            x.key = INT_MAX;
            x.color = 0;
            x.right = this.NIL;
            x.left= this.NIL;
        }

        if (y.key != key) {
            let z = new Node();
            z = serach(key, this.NIL);
            z.key = y.key;
        }

        let w = new Node();
        if (x.color == 0) {
            y.parent.left.key == x.key ? w = y.parent.right : w = y.parent.left; // Set w as sibling of x
        }

        if (x.color == 1) {
            x.color = 0;
            // Tree is now valid 
        } else {
            // Perform fixup
            while (x != this.root && x.color == 0) {
                // Case 1: x.color == 0, w.color == 1
                if (w.color == 1) {
                    rotate(w, w.parent.parent);
                    if (x != this.root) x.parent.left.key == x.key ? w = x.parent.right : w = x.parent.left; // Update w based on new x
                }

                // Case 2: x.color == 0, w.color == 0, w.left.color == 0, w.right.color == 0
                if (w.color == 0 && w.left.color == 0 && w.right.color == 0) {
                    x = w.parent;
                    if (x != this.root) {
                        w.color = 1;
                        if (x.color == 1) {
                            x.color = 0;
                        }
                    }
                    if (x != this.root) x.parent.left.key == x.key ? w = x.parent.right : w = x.parent.left // Update w based on new x
                }

                // Case 3: w.color == 0, w.nearChild.color == 1, w.otherChild.color == 0
                if (w.color == 0) {
                    if (w.parent.right == w) {
                        if (w.left.color == 1 && w.right.color == 0) {
                            rotate(w.left, w.left.parent.parent);
                            if (x != this.root) x.parent.left.key == x.key ? w = x.parent.right : w = x.parent.left; // Update w based on new x
                        }
                    } else if (w.parent.left == w) {
                        if (w.right.color == 1 && w.left.color == 0) {
                            rotate(w.right, w.right.parent.parent);
                            if (x != this.root) x.parent.left.key == x.key ? w = x.parent.right : w = x.parent.left; // Update w based on new x
                        }
                    }
                }

                // Case 4: w.color == 0, w.farchild.color == 1
                if (w.color == 0) {
                    if (w.parent.right == w) {
                        if (w.right.color == 1) {
                            rotate(w, w.parent.parent);
                            w.right.color = 0
                            break; // End loop since RBTree is valid after case 4
                        }
                    } else if (x.parent.left == w) {
                        if (w.left.color == 1) {
                            rotate(w, w.parent.parent);
                            w.left.color = 0;
                            break; // End loop since RBTree is valid after case 4
                        }
                    }
                }
            }
        }
    }

    search = function(root, key) {
        let curr = root;

        if (curr.key == INT_MAX) {
            return this.NIL;
        }
        if (key == curr.key) {
            return curr;
        }
        if (key < curr.key) {
            return search(curr.left, key);
        }
        return search(curr.right, key);
    }
}