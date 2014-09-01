module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        nodeunit: {
            all: ['test/*Test.js']
        },
        watch: {
            nodeunit: {
                files: ['./**/*.js'],
                tasks: ['nodeunit']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('test', ['nodeunit']);
    grunt.registerTask('crunch', ['nodeunit', 'watch']);

}