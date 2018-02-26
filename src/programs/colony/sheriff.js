'use strict'

/**
 * Polices the borders and ensures that our civilians are safe.
 */

class Sheriff extends kernel.process {
  getDescriptor() {
    return this.data.room
  }

  main () {
  }
}

module.exports = Sheriff
