
'use strict'

/**
 * Runs the towers that protect and repair the room.
 */

class Commander extends kernel.process {
  constructor (...args) {
    super(...args)
    this.priority = PRIORITIES_DEFENSE
  }

  main () {
    this.room = Game.rooms[this.data.room]
    if (!this.room) {
      this.suicide()
      return
    }

    this.enemies = _.filter(this.room.enemies, (e) => !e.pos.onEdge )
    this.hurt = _.filter(this.room.friendlies, (c) => c.hits < c.hitsMax)

    let towers = this.room.towers
    for (let i in towers) {
      this.run(towers[i])
    }

    if (this.enemies.length == 0 && this.hurt.length == 0) {
      this.repair()
    }
    this.sleep(5)
  }

  run(tower) {
    if (tower.energy == 0) {
      return
    }

    if (this.enemies.length > 0 && this.attack(tower) === true) {
      this.killChild(`repair`)
      this.killChild(`heal_${tower.id}`)
      return
    }
    delete this.data[tower.id]

    if (this.heal(tower) === true) {
      this.killChild(`repair`)
    }
  }

  attack(tower) {
    // probably a drain attack, ignore for this tick
    if (this.enemies.length === 0) {
      return true
    }

    let closest = _.min(notOnEdge, (e) => tower.pos.getRangeTo(e) )
    if (this.data[tower.id] !== closest.id) {
      this.killChild(`attack_${tower.id}_${this.data[tower.id]}`)
      this.data[tower.id] = closest.id
    }
    if (tower.pos.getRangeTo(closest) <= TOWER_ATTACK_RANGE) {
      this.launchChildProcess(`attack_${tower.id}_${closest.id}`, `tower_defend`, {
        'tower': tower.id,
        'enemy': closest.id
      })
    }
    return true
  }

  heal(tower) {
    if (Object.keys(this.hurt).length == 0 ) {
      return false
    }

    let closest = _.min(this.hurt, (e) => tower.pos.getRangeTo(e) )
    this.launchChildProcess(`heal_${tower.id}`, `tower_heal`, {
      'tower': tower.id,
      'hurt': closest.id
    })
    return true
  }

  repair(tower) {
    this.launchChildProcess(`repair`, `tower_repair`, {
      'room': this.data.room
    })
  }
}

module.exports = Commander
