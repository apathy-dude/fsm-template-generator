module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                },
                src: ['test/**/*.js']
            }
        },
        browserify: {
            dist: {
                files: {
                    'bin/<%= pkg.name %>.js': ['src/**/*.js', 'main.js'],
                }
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'bin/<%= pkg.name %>.min.js': ['bin/<%= pkg.name %>.js']
                }
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'main.js', 'src/**/*.js', 'test/**/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        watch: {
            toArray: {
                files: ['images/**/*.png', 'src/layers/*.js'],
                tasks: ['toArray']
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-browserify');

    grunt.registerTask('test', ['jshint', 'mochaTest']);
    // uglify doesn't work with es6 functions yet
    grunt.registerTask('default', ['jshint', 'mochaTest', 'browserify']);
};

