class Node {
    constructor() {
        this.next = null;
        this.key = null;
    }
};

class LinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
    }

    search = function(key) {
        let curr = this.head;
        
        while (curr !== null) {
            if (curr.key === key) {
                return curr;
            } else {
                curr = curr.next;
            }
        }
        return null;
    }
    
    insert = function(key) {
        // insert at head to provide a better runtime
        const temp = new Node();
        temp.key = key;
        temp.next = null;
    
        if (this.head == null) {
            this.head = temp;
            this.tail = temp;
        } else {
            temp.next = this.head;
            this.head = temp;
        }
    };

    listDelete = function(key) {
        if (this.head.key === key) {
            this.head = this.head.next;
            if (this.head == null) {
                this.tail = null;
            }
        } else {
            let curr = this.head;

            while (curr.next != null) {
                if (curr.next.key === key) {
                    if (curr.next === this.tail) {
                        this.tail = curr;
                    }
                    curr.next = curr.next.next;
                    break;
                } else {
                    curr = curr.next;
                }
            }
        }
    };

    print = function() {
        if (this.head != null) {
            let curr = this.head;
            let message = "";

            while (curr.key !== null && curr !== this.tail) {
                message += curr.key + " -> ";
                curr = curr.next;
            }

            message += this.tail.key;
            console.log(message);
            return message;
        } else {
            console.log("null");
            return "null";
        }
    }

    toArray = function() {
        let nodes = [];
        let curr = this.head;

        while (curr !== null) {
            nodes.push(curr.key);
            curr = curr.next;
        }

        return nodes;
    }
};

export { Node, LinkedList };