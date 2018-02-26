'use strict'

/**
 * This process runs in the background to monitor how often a specific priority
 * runs. This in turn can feed into other systems (ex, adding remote mines when
 * there is available CPU).
 */

class MetaMonitorPriority extends kernel.process {
  constructor (...args) {
    super(...args)
    this.priority = this.data.priority
  }

  getDescriptor () {
    return this.data.priority
  }

  main () {
    sos.lib.monitor.markRun(this.data.priority)
  }
}

module.exports = MetaMonitorPriority
