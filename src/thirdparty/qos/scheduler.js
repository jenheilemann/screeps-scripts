'use strict'

const Queue = require('thirdparty_qos_queue')

global.DEFAULT_PRIORITY = global.PRIORITIES_DEFAULT || 6
const MAX_PID = 9999999

class Scheduler {
  constructor () {
    if (!Memory.qos.scheduler) {
      Memory.qos.scheduler = {}
    }
    this.memory = Memory.qos.scheduler

    if (this.memory.processes === undefined) {
      this.memory.processes = {}
    }
    if (this.memory.lastPid === undefined) {
      this.memory.lastPid = 0
    }

    this.processCache = {}
  }

  get queue() {
    if (!this._queue) {
      this._queue = new Queue(this.inflateProcesses(), 'priority')
    }
    return this._queue
  }

  getNextProcess () {
    var candidate
    while (candidate = this.queue.pop()) {
      // Don't run this pid twice in a single tick.
      if (candidate.completed) {
        continue
      }

      // If process is dead, don't use it.
      if (candidate.isDead()) {
        continue
      }

      // If this process is sleeping, then don't run it
      if (candidate.isSleeping()) {
        continue
      }

      return candidate
    }

    return false
  }

  inflateProcesses() {
    var list = []
    for (var pid in this.memory.processes) {
      list.push(this.getProcessForPid(pid))
    }
    return _.shuffle(list)
  }

  shutdown() {
    this.memory.processes = {}
    for (var pid in this.processCache) {
      if (this.processCache[pid].isDead()) {
        continue
      }
      this.memory.processes[pid] = this.processCache[pid].toHash()
    }
  }

  launchProcess (name, data = {}, parent = false, sleep = 0) {
    const pid = this.getNextPid()
    const ProgramClass = this.getProgramClass(name)
    let program = new ProgramClass(pid, name, data, parent, Game.time + sleep)
    this.processCache[pid] = program
    this.queue.push(program)
    return pid
  }

  getNextPid () {
    while (true) {
      this.memory.lastPid++
      if (this.memory.lastPid > MAX_PID) {
        this.memory.lastPid = 0
      }
      var short = this.memory.lastPid.toString(36)
      if (this.memory.processes[short]) {
        continue
      }
      return short
    }
  }

  kill (pid) {
    var proc = this.getProcessForPid(pid)
    if (proc) {
      proc.suicide()
    }
    delete this.memory.processes[pid]
  }

  wake (pid) {
    var proc = this.getProcessForPid(pid)
    if (proc) {
      proc.wake()
      this.queue.push(proc)
    }
  }

  sleep (pid, ticks) {
    var proc = this.getProcessForPid(pid)
    if (proc) {
      proc.sleep(ticks)
    }
  }

  getProcessCount () {
    return Object.keys(this.memory.processes).length
  }

  getCompletedProcessCount () {
    return Object.keys(this.processCache).
      map((pid) => this.processCache[pid]).
      filter((p) => p.completed).length
  }

  isPidActive(pid) {
    if (!this.memory.processes[pid]) {
      return false
    }
    var proc = this.getProcessForPid(pid)
    return !proc.isDead()
  }

  getProcessForPid (pid) {
    if (!this.processCache[pid]) {
      let info = this.memory.processes[pid]
      if (!info) { return false }
      const ProgramClass = this.getProgramClass(info.n)
      this.processCache[pid] = new ProgramClass(pid, info.n, info.d, info.p, info.w)
    }
    return this.processCache[pid]
  }

  getProgramClass (program) {
    return require(`programs_${program}`)
  }

  clear () {
    this.memory.processes = {}
  }
}

module.exports = Scheduler
