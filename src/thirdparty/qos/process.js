'use strict'

class Process {
  constructor (pid, name, data, parent, wakeTick = 0) {
    this.pid = pid
    this.name = name
    this.data = data
    this.parent = parent
    this.wakeTick = wakeTick

    this.priority = DEFAULT_PRIORITY
    this.alive = true
    this.completed = false
  }

  toHash() {
    return {
      n: this.name,
      d: this.data,
      p: this.parent,
      w: this.wakeTick
    }
  }

  toString() {
    return `Process ${this.pid} ${this.priority} ${this.getProcessName()}`
  }

  clean () {
    if (this.data.children) {
      let label
      for (label in this.data.children) { // jshint ignore:line
        if (!kernel.scheduler.isPidActive(this.data.children[label])) {
          delete this.data.children[label]
        }
      }
    }

    if (this.data.processes) {
      let label
      for (label in this.data.processes) { // jshint ignore:line
        if (!kernel.scheduler.isPidActive(this.data.processes[label])) {
          delete this.data.processes[label]
        }
      }
    }
  }

  getDescriptor () {
    return false
  }

  getPerformanceDescriptor () {
    return false
  }

  getProcessName() {
    let name = this.name
    if (this.getDescriptor()) {
      name = `${name} ${this.getDescriptor()}`
    }
    return name
  }

  launchChildProcess (label, name, data = {}, sleep = 0) {
    if (!this.data.children) {
      this.data.children = {}
    }
    if (this.data.children[label]) {
      return true
    }
    this.data.children[label] = kernel.scheduler.launchProcess(name, data, this.pid, sleep)
    return this.data.children[label]
  }

  getChildProcessPid (label) {
    if (!this.data.children) {
      return false
    }
    if (!this.data.children[label]) {
      return false
    }
    return this.data.children[label]
  }

  isChildProcessRunning (label) {
    const pid = this.getChildProcessPid(label)
    if (!pid) {
      return false
    }
    return kernel.scheduler.isPidActive(pid)
  }

  launchProcess (label, name, data = {}, sleep = 0) {
    if (!this.data.processes) {
      this.data.processes = {}
    }

    if (this.data.processes[label]) {
      return true
    }
    this.data.processes[label] = kernel.scheduler.launchProcess(name, data, false, sleep)
    return this.data.processes[label]
  }

  getProcessPid (label) {
    if (!this.data.processes) {
      return false
    }
    if (!this.data.processes[label]) {
      return false
    }
    return this.data.processes[label]
  }

  isProcessRunning (label) {
    const pid = this.getProcessPid(label)
    if (!pid) {
      return false
    }
    return kernel.scheduler.isPidActive(pid)
  }

  launchCreepProcess (label, role, roomname, quantity = 1, options = {}) {
    const room = Game.rooms[roomname]
    if (!room) {
      return false
    }
    if (!this.data.children) {
      this.data.children = {}
    }
    let x
    for (x = 0; x < quantity; x++) {
      const specificLabel = label + x
      if (this.data.children[specificLabel]) {
        continue
      }
      const creepName = room.queueCreep(role, options)
      this.launchChildProcess(specificLabel, 'creep', {
        'creep': creepName
      })
    }
  }

  period (interval, label = 'default') {
    if (!this.data.period) {
      this.data.period = {}
    }

    const lastRun = this.data.period[label] || 0
    if (lastRun < Game.time - interval) {
      this.data.period[label] = Game.time
      return true
    }

    return false
  }

  wake () {
    this.wakeTick = Game.time
  }

  sleep (ticks) {
    this.wakeTick = Game.time + ticks
  }

  wakeParent () {
    if (this.parent) {
      return kernel.scheduler.wake(this.parent)
    }
  }

  suicide () {
    this.alive = false
    let label
    for (label in this.data.children) {
      kernel.scheduler.kill(this.data.children[label])
    }
  }

  isDead () {
    return !this.alive
  }

  isSleeping() {
    return this.wakeTick > Game.time
  }

  run () {
    this.clean()
    this.main()
    this.completed = true
  }
}

module.exports = Process
