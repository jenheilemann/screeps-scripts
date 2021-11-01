if (!Memory.username) {
  const struc = _.find(Game.structures)
  const creep = _.find(Game.creeps)
  Memory.username = (struc ? struc.owner.username : false) || (creep ? creep.owner.username : false)
}
global.USERNAME = Memory.username

global.ONE_MILLION = 1000000
global.THREE_HUNDRED_MILLION = 300000000
global.STRUCTURE_BARRIER = [STRUCTURE_WALL, STRUCTURE_RAMPART]
global.TOWER_ATTACK_RANGE = Math.floor((TOWER_OPTIMAL_RANGE + TOWER_FALLOFF_RANGE)/2)
// A little more than a day if tick lengths are ~3.5 seconds
global.ONE_DAY = 29443
global.ONE_WEEK = 172801

global.ROOM_TYPES = {
  Normal: 0,        // Controller, settle-able
  Highway: 1,       // empty, between sectors
  Intersection: 2,  // cross of highways, contains terminal
  SourceKeeper: 3,  // eight central rooms of a sector, source keeper rooms
  Center: 4         // exact center of a sector, three sources, no controller
}

global.SHORT_STRUCTURE_TYPES = {
  spawn:           0,
  extension:       1,
  road:            2,
  constructedWall: 3,
  rampart:         4,
  keeperLair:      5,
  portal:          6,
  controller:      7,
  link:            8,
  storage:         9,
  tower:           10,
  observer:        11,
  powerBank:       12,
  powerSpawn:      13,
  extractor:       14,
  lab:             15,
  terminal:        16,
  container:       17,
  nuker:           18,
}

global.UNOWNABLE_STRUCTURE_TYPES = [STRUCTURE_ROAD, STRUCTURE_WALL, STRUCTURE_CONTAINER]

global.REPAIR_PRIORITIES = {
  Rotting_Rampart: 100,
  Dying_Structure: 80,
  Dying_Barrier: 60,
  Structure: 40,
  Barrier: 20
}

global.PRIORITIES_DEFAULT = 6

global.PRIORITIES_CREEP_MOVE = 3
global.PRIORITIES_CREEP_DEFAULT = 4
global.PRIORITIES_CREEP_UPGRADER = 6
global.PRIORITIES_FORTIFY = 6
global.PRIORITIES_MINE = 6
global.PRIORITIES_CREEP_CLEAN = 8
global.PRIORITIES_CREEP_WHISTLE = 16

global.PRIORITIES_SPAWNS = 3
global.PRIORITIES_DEFENSE = 3

global.PRIORITIES_EMPIRE_INTEL = 4

global.PRIORITIES_CREEP_SPOOK = 6
global.PRIORITIES_CREEP_REPLENISHER = 6
global.PRIORITIES_CREEP_FACTOTUM = 7

global.PRIORITIES_PUBLICWORKS = 7
global.PRIORITIES_EXPAND = 8
global.PRIORITIES_PLAYER = 8
global.PRIORITIES_COLONY = 8
global.PRIORITIES_LABS = 8

global.PRIORITIES_CONSTRUCTION = 9
global.PRIORITIES_CITY_REBOOT = 9
global.PRIORITIES_EMPIRE_MARKET = 10
global.PRIORITIES_COLONY_CENSUS = 10
global.PRIORITIES_RESPAWNER = 12
global.PRIORITIES_MAINTENANCE = 12

global.PRIORITIES_REPORTING = 13

// Which priorities to monitor.
global.MONITOR_PRIORITIES = _.uniq([
  PRIORITIES_CREEP_DEFAULT,
  PRIORITIES_DEFAULT,
  9
])

// Line styles for showing what action a creep is taking
global.CREEP_MOVE_STYLE = {
  move:    {stroke: '#ffffff', strokeWidth: 0.1, opacity: 0.6},
  collect: {stroke: '#ff3366', strokeWidth: 0.1, opacity: 0.6},
  harvest: {stroke: '#ffbb33', strokeWidth: 0.1, opacity: 0.6},
  build:   {stroke: '#aaccff', strokeWidth: 0.1, opacity: 0.6},
  upgrade: {stroke: '#55ff55', strokeWidth: 0.1, opacity: 0.6},
  courier: {stroke: '#ffaaff', strokeWidth: 0.1, opacity: 0.6},
  repair:  {stroke: '#aaaaff', strokeWidth: 0.1, opacity: 0.6},
  renew:   {stroke: '#aaaaff', strokeWidth: 0.1, opacity: 0.6},
  recycle: {stroke: '#aaaaff', strokeWidth: 0.1, opacity: 0.6},
  pickup:  {stroke: '#ffddbb', strokeWidth: 0.1, opacity: 0.6},
  run:     {stroke: '#ff0000', strokeWidth: 0.15, opacity: 0.7, lineStyle: 'dotted'},
  flee:    {stroke: '#00ff00', strokeWidth: 0.15, opacity: 0.7, lineStyle: 'dotted'},
  scout:   {stroke: '#3333ff', strokeWidth: 0.10, opacity: 0.7, lineStyle: 'dotted'}
}
