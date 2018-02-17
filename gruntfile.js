module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-screeps');
    var config = require('./.private.json')

    grunt.initConfig({
        screeps: {
            options: {
                email: config.email,
                password: config.password,
                branch: config.branch,
                ptr: config.ptr
            },
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/',
                        src: ['**/*.js'],
                        flatten: true
                    }
                ]
            }
        }
    });
}
