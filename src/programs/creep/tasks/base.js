'use strict'

/**
 * Organizes the creep workforce within the colony.
 */

class BaseTask extends kernel.process {
  constructor (...args) {
    super(...args)
    this.priority = PRIORITIES_CREEP_DEFAULT
  }

}

module.exports = BaseTask
