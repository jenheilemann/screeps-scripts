'use strict'

class Queue {
  constructor (comparison, processes) {
    this.comp = comparison
    this.list = [null].concat(_.sortBy(processes, (p) => p[this.comp] ))
  }

  pop () {
    this._swap(1, this.list.length - 1)
    var bottom = this.list.pop()
    this._bubbleDown(1)
    return bottom
  }

  push (process) {
    this.list.push(process)
    this._bubbleUp(this.list.length - 1)
  }

  _bubbleUp(index) {
    var parentIndex = Math.floor(index/2)

    if (index <= 1) {
      return
    }

    if (this.list[parentIndex][this.comp] <= this.list[index][this.comp] ) {
      return
    }

    this._swap(index, parentIndex)
    this._bubbleUp(parentIndex)
  }

  _bubbleDown(index) {
    var childIndex = index * 2

    if (childIndex > this.list.length - 1) {
      return
    }

    var notTheLast = childIndex < this.list.length - 1
    var leftElement = this.list[childIndex]
    var rightElement = this.list[childIndex + 1]

    if (notTheLast && rightElement < leftElement) {
      childIndex = childIndex++
    }

    if (this.list[index][this.comp] <= this.list[childIndex][this.comp]) {
      return
    }

    this._swap(index, childIndex)
    this._bubbleDown(childIndex)
  }

  _swap(source, target) {
    var temp = this.list[source]
    this.list[source] = this.list[target]
    this.list[target] = temp
  }
}

module.exports = Queue
