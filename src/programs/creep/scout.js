'use strict'

/**
 * Tells Scout creeps what to do.
 */

class Scout extends kernel.process {
  main () {
    this.creep = Game.creeps[this.data.cp]

    if (!this.creep) {
      this.suicide()
      return
    }

    if (this.creep.spawning) {
      return
    }
    // costs 0.2 CPU the first time it's run, but not after
    this.creep.notifyWhenAttacked(false)

    this.data.prev = this.data.room
    this.data.room = this.creep.room.name

    this.whistle()
    this.recordRoomInfo()
    this.makeDecisions()
  }

  makeDecisions() {
    if (this.changedRooms()) {
      this.killChild('move')
    }
    let next = this.getNeighbor()
    this.launchChildProcess(`move`, 'creep_tasks_move_room', {
      cp:          this.creep.name,
      room:        next,
      style:       'scout',
      ignoreRoads: true
    })
    this.sleep(50)
  }

  getNeighbor() {
    let exit = this.data.goal
    if (this.changedRooms() || !exit) {
      exit = this.findNeighbor()
      this.data.goal = exit
    }
    return exit
  }

  findNeighbor(ignore = []) {
    let exits = _.filter(this.creep.room.neighbors, (n) => !ignore.includes(n.room))
    let select = _.min(exits, (n) => Surveyor.fetch(n.room).updated )
    let exit = this.creep.pos.findClosestByPath(select.dir, {maxOps: 500, maxRooms: 1})
    if (exit === null) {
      ignore.push(select.room)
      return this.findNeighbor(ignore)
    }
    return select.room
  }

  recordRoomInfo() {
    if (!this.changedRooms()) {
      return
    }
    Logger.audit(`${this.creep} recording info about room ${this.creep.room}`)
    Surveyor.add(this.creep.room)
  }

  changedRooms() {
    return this.data.prev !== this.data.room
  }

  whistle(){
    this.launchChildProcess(`whistle`, 'creep_tasks_whistle', {
      cp:          this.creep.name,
      style:       'scout'
    })
  }
}

module.exports = Scout
