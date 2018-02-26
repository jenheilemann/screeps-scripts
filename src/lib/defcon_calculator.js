'use strict'

class DefconCalculator {
  constructor(room) {
    this.room = room
    this.memory = this._initializeMemory()
  }

  level() {
    var previous = new DefconLevel(this.memory.level, this.memory.timer)
    var level = this.calculateLevel(previous)

    if (level !== previous.level) {
      this.memory.timer = Game.time
    }
    this.memory.level = level
    return new DefconLevel(level, this.memory.timer)
  }

  calculateLevel(previous) {
    var enemies = this.room.enemies
    var safe = this.room.safeModeActive

    switch(true) {
      case enemies.length == 0 || safe:
        return 0
      case enemies.length > 0 && enemies.length < 5:
        return 1
      case previous.timer > 50 && previous.level == 1:
        return 2
      case enemies.length >= 5 && enemies.length < 10:
        return 3
      default:
        return 4
    }
  }

  _initializeMemory() {
    if (!this.room.memory.defcon) {
      this.room.memory.defcon = { level: 0 }
    }
    return this.room.memory.defcon
  }
}

class DefconLevel {
  constructor(level, startTime) {
    this.level = level
    this.startTime = startTime
    this.timer = Game.time - startTime
  }

  reset() {
    return new constructor(0, Game.time)
  }
}

module.exports = DefconCalculator;
