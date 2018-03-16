global.ONE_MILLION = 1000000
global.THREE_HUNDRED_MILLION = 300000000
global.STRUCTURE_BARRIER = [STRUCTURE_WALL, STRUCTURE_RAMPART]
global.TOWER_ATTACK_RANGE = Math.floor((TOWER_OPTIMAL_RANGE + TOWER_FALLOFF_RANGE)/2)

global.PRIORITIES_DEFAULT = 6

global.PRIORITIES_CREEP_MOVE = 3
global.PRIORITIES_CREEP_DEFAULT = 4
global.PRIORITIES_CREEP_UPGRADER = 6
global.PRIORITIES_FORTIFY = 6
global.PRIORITIES_MINE = 6
global.PRIORITIES_CREEP_CLEAN = 8

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
  flee:    {stroke: '#00ff00', strokeWidth: 0.15, opacity: 0.7, lineStyle: 'dotted'}
}
