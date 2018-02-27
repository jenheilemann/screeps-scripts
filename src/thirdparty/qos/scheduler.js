'use strict'

const Queue = require('thirdparty_qos_queue')

global.DEFAULT_PRIORITY = global.PRIORITIES_DEFAULT || 6
const MAX_PRIORITY = 16
const MAX_PID = 9999999
const WALL = 9

class Scheduler {
  constructor () {
    if (!Memory.qos.scheduler) {
      Memory.qos.scheduler = {}
    }
    this.memory = Memory.qos.scheduler

    if (!this.memory.processes) {
      this.memory.processes = {
        index: {},
        lastPid: 0
      }
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
    for (var pid in this.memory.processes.index) {
      list.push(this.getProcessForPid(pid))
    }
    return _.shuffle(list)
  }

  shutdown() {
    this.memory.processes.index = {}
    for (var pid in this.processCache) {
      if (this.processCache[pid].isDead()) {
        continue
      }
      this.memory.processes.index[pid] = this.processCache[pid].toHash()
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
      if (this.memory.processes.index[this.memory.lastPid]) {
        continue
      }
      return this.memory.lastPid
    }
  }

  kill (pid) {
    var proc = this.getProcessForPid(pid)
    if (proc) {
      proc.suicide()
    }
    delete this.memory.processes.index[pid]
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
    return Object.keys(this.memory.processes.index).length
  }

  getCompletedProcessCount () {
    return Object.keys(this.processCache).
      map((pid) => this.processCache[pid]).
      filter((p) => p.completed).length
  }

  isPidActive(pid) {
    var proc = this.getProcessForPid(pid)
    return !proc.isDead()
  }

  getProcessForPid (pid) {
    if (!this.processCache[pid]) {
      let info = this.memory.processes.index[pid]
      const ProgramClass = this.getProgramClass(info.n)
      this.processCache[pid] = new ProgramClass(pid, info.n, info.d, info.p, info.w)
    }
    return this.processCache[pid]
  }

  getProgramClass (program) {
    return require(`programs_${program}`)
  }

  clear () {
    this.memory.processes.index = {}
  }
}

module.exports = Scheduler
