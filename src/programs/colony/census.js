'use strict'

const CENSUS_FREQUENCY = 57

/**
 * Reviews the population to find any discrepencies between current creeps
 * and require creeps.
 */

class Census extends kernel.process {
  constructor (...args) {
    super(...args)
    this.priority = PRIORITIES_COLONY_CENSUS
  }

  getDescriptor() {
    return this.data.room
  }

  main () {
    this.room = Game.rooms[this.data.room]

    const PopulationManager = require('managers_population')
    let population = new PopulationManager(this.room)
    Logger.warn(`Running census for room ${this.data.room}`)
    this.room.memory.nextCreep = population.neededRole()

    this.sleep(CENSUS_FREQUENCY)
  }
}

module.exports = Census
