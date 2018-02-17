
const HarvesterRole = require('roles_harvester')

module.exports.loop = function () {
    if (Game.time % 13 == 5) {
        console.log('Loop is running!')
        new HarvesterRole();
    }
}
