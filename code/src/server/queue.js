export class Queue {
    constructor() {
        this.items = {}
        this.frontIndex = 0
        this.backIndex = 0
    }
    enqueue(item) {
        this.items[this.backIndex] = item
        this.backIndex++
        return item + ' inserted'
    }
    dequeue() {
        const item = this.items[this.frontIndex]
        delete this.items[this.frontIndex]
        this.frontIndex++
        return item
    }
    peek(index) {
        return this.items[index];
    }
    get printQueue() {
        return this.items;
    }
    getSize(){
        return this.backIndex - this.frontIndex;    
    }

    removeElement(socket) {
        for (let i = this.frontIndex; i < this.backIndex; i++) {
            if (this.items[i][1] === socket) {
                delete this.items[i];
                // Shift elements to fill the gap
                for (let j = i; j < this.backIndex - 1; j++) {
                    this.items[j] = this.items[j + 1];
                }
                delete this.items[this.backIndex - 1];
                this.backIndex--;
                return true;
            }
        }
        return false;
    }
}