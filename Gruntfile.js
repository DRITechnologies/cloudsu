/*jshint esversion: 6 */
'use strict';

module.exports = function (grunt) {


    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Show grunt task time
    require('time-grunt')(grunt);

    // Configurable paths for the app
    var appConfig = {
        app: 'app',
        dist: 'dist'
    };



    grunt.initConfig({

        // Project settings
        concord: appConfig,

        // get the configuration info from package.json ----------------------------
        // this way we can use things like name and version (pkg.name)
        pkg: grunt.file.readJSON('package.json'),

        // all of our configuration will go here
        watch: {
            browser_js: {
                files: ['app/**/*.js', 'app/**/*.html', 'api/**/*.js', 'config/**/*.js', 'utls/**/*.js', 'middleware/**/*.js'],
                tasks: ['jshint', 'build']
            }

        },

        nodemon: {
            dev: {
                script: 'server.js',
                options: {
                    ext: 'js,html',
                    watch: ['app/**/*.js', 'api/**/*.js', 'config/**/*.js', 'utls/**/*.js', 'middleware/**/*.js']
                }
            }
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },

            build: ['Gruntfile.js', 'app/**/*.js', 'api/**/*.js', 'utls/**/*.js', 'config/**/*.js']
        },

        browserify: {
            main: {
                files: {
                    'public/bundle.js': ['public/concat.js']
                }
            }
        },

        concurrent: {
            main: {
                tasks: ['nodemon::dev', 'watch::browser_js'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },


        // Compile less to css
        less: {
            development: {
                options: {
                    compress: true,
                    optimization: 2
                },
                files: {
                    'app/styles/style.css': 'app/less/style.less'
                }
            }
        },

        uglify: {
            options: {
                mangle: false
            }
        },
        // Clean dist folder
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= concord.dist %>/{,*/}*',
                        '!<%= concord.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },
        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= concord.app %>',
                    dest: '<%= concord.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        '.htaccess',
                        '*.html',
                        'views/{,*/}*.html',
                        'styles/patterns/*.*',
                        'img/{,*/}*.*'
                    ]
                }, {
                    expand: true,
                    dot: true,
                    cwd: 'bower_components/fontawesome',
                    src: ['fonts/*.*'],
                    dest: '<%= concord.dist %>'
                }, {
                    expand: true,
                    dot: true,
                    cwd: 'bower_components/bootstrap',
                    src: ['fonts/*.*'],
                    dest: '<%= concord.dist %>'
                }]
            },
            styles: {
                expand: true,
                cwd: '<%= concord.app %>/styles',
                dest: '.tmp/styles/',
                src: '{,*/}*.css'
            }
        },
        // Renames files for browser caching purposes
        filerev: {
            dist: {
                src: [
                    '<%= concord.dist %>/scripts/{,*/}*.js',
                    '<%= concord.dist %>/styles/{,*/}*.css',
                    '<%= concord.dist %>/styles/fonts/*'
                ]
            }
        },
        htmlmin: {
            dist: {
                options: {
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    collapseBooleanAttributes: true,
                    removeCommentsFromCDATA: true,
                    removeOptionalTags: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= concord.dist %>',
                    src: ['*.html', 'views/{,*/}*.html'],
                    dest: '<%= concord.dist %>'
                }]
            }
        },
        useminPrepare: {
            html: 'app/index.html',
            options: {
                dest: 'dist'
            }
        },
        usemin: {
            html: ['dist/index.html']
        }


    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('version_file', 'create artifact version file', () => {
        const version = grunt.config.get('service.version') || grunt.option('build-version') || null;
        if (!version) {
            grunt.log.write('NO version --  setting to null');
        }
        grunt.file.write('./version.json', JSON.stringify({
            version: version
        }));
    });

    // Build version for production
    grunt.registerTask('build', [
        'jshint',
        'clean:dist',
        'less',
        'useminPrepare',
        'concat',
        'copy:dist',
        'cssmin',
        'uglify',
        'filerev',
        'usemin',
        'htmlmin'
    ]);

    // Run build version of app
    grunt.registerTask('server', [
        'build',
        'connect:dist:keepalive'
    ]);


    grunt.registerTask('run', ['nodemon:main']);

    grunt.registerTask('server', () => {
        const taskList = [
            'concurrent:main'
        ];
        grunt.task.run(taskList);
    });


};
