'use strict'

class StructureNull {
  constructor() {
    this.id = null
    this.energy = 0
  }

  isNull() {
    return true
  }

  exists() {
    return false
  }
}

module.exports = StructureNull
