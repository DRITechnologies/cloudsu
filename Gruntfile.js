/*jshint esversion: 6 */
'use strict';

module.exports = function (grunt) {
    // ===========================================================================
    // CONFIGURE GRUNT ===========================================================
    // ===========================================================================
    function distFiles() {
        const files = [{
            expand: true,
            src: 'server.js'
        }, {
            expand: true,
            src: 'package.json'
        }, {
            expand: true,
            src: 'version.json'
        }, {
            expand: true,
            src: 'config/**'
        }, {
            expand: true,
            src: 'public/**'
        }, {
            expand: true,
            src: 'api/**'
        }, {
            expand: true,
            src: 'templates/**'
        }, {
            expand: true,
            src: 'utls/**'
        }];
        return files;
    }


    grunt.initConfig({

        // get the configuration info from package.json ----------------------------
        // this way we can use things like name and version (pkg.name)
        pkg: grunt.file.readJSON('package.json'),

        // all of our configuration will go here
        watch: {
            browser_js: {
                files: ['public/scripts/**/*.js', 'api/**/*.js'],
                tasks: ['jshint', 'build']
            }

        },

        nodemon: {
            main: {
                script: 'server.js'
            }
        },
        // grunt-contrib-compress config
        compress: {
            source: {
                options: {
                    mode: 'tgz',
                    pretty: 'true',
                    archive: 'artifacts/service.tar.gz',
                    level: 1
                },
                files: distFiles()
            }
        },
        aws_s3: {
            options: {
                access: 'private',
                accessKeyId: '',
                secretAccessKey: '',
                region: 'us-west-2'
            },
            main: {
                options: {
                    bucket: ''
                },
                files: [{
                    src: 'artifacts/service.tar.gz',
                    dest: '<%= grunt.config.get("service.version") %>/service.tar.gz'
                }]
            }
        },

        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },

            build: ['Gruntfile.js', 'public/scripts/**/*.js', 'api/**/*.js']
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
                tasks: ['nodemon::main', 'watch::browser_js'],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        concat: {
            dist: {
                // the files to concatenate
                src: ['public/index.js', 'public/scripts/**/*.js'],
                // the location of the resulting JS file
                dest: 'public/concat.js'
            }
        }

    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-aws-s3');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.loadNpmTasks('grunt-nodemon');

    grunt.registerTask('version_file', 'create artifact version file', () => {
        const version = grunt.config.get('service.version') || grunt.option('build-version') || null;
        if (!version) {
            grunt.log.write('NO version --  setting to null');
        }
        grunt.file.write('./version.json', JSON.stringify({
            version: version
        }));
    });

    // publish service artifact
    grunt.registerTask('publish', 'publish artifacts to s3', () => {
        let version = grunt.option('build-version');

        const now = new Date().getTime();
        if (!version) {
            // use timestamp
            version = ['local', now].join('-');
        }

        grunt.log.write('publishing artifact with version', version);

        grunt.config.set('service.version', version);
        grunt.task.run([
            'version_file',
            'build',
            'compress:source',
            'aws_s3'
        ]);
    });

    grunt.registerTask('eslint', [
        'eslint'
    ]);

    grunt.registerTask('lint', [
        'jshint'
    ]);

    grunt.registerTask('build', [
        'concat',
        'browserify'
    ]);

    grunt.registerTask('run', ['nodemon:main']);

    grunt.registerTask('server', () => {
        const taskList = [
            'concurrent:main'
        ];
        grunt.task.run(taskList);
    });


};
