'use strict';
var version = process.env.GIT_COMMIT || 'latest';

module.exports = function (grunt) {

	require('load-grunt-tasks')(grunt);

	grunt.registerTask('prebuild', 'Runs lint and stylecheck tasks', [
		'jshint',
	]);

	grunt.registerTask('build', 'Copy, concat and minify everything, etc', [
		'clean',
		'copy',
		'compress'
	]);

	grunt.registerMultiTask('test', 'Runs various test suites. Try :unit or :e2e', function () {
		grunt.task.run(this.data);
	});

	var path = {
		client: 'src/client',
		server: 'src/server',
		test: 'test',
		dist: {
			base: 'dist',
			server: 'dist/server',
			'static': 'dist/static'
		}
	};

	grunt.initConfig({
		test: {
			unit: ['prebuild', 'mocha_istanbul:server']
		},
		clean: {
			options: {
				force: true
			},
			dist: {
				files: [{
					dot: true,
					src: [path.dist.base]
				}]
			},
			deployable: ['deployable_*.zip']
		},
		compress: {
			deployment: {
				options: {
					archive: 'deployable_' + version + '.zip'
				},
				files: [{
					dot: true,
					dest: './',
					src: ['**/*'],
					cwd: './dist',
					expand: true
				}]
			}
		},
		copy: {
			options: {
				mode: true
			},
			config: {
				expand: true,
				cwd: 'config',
				src: '**/*',
				dest: path.dist.base + '/config/'
			},
			server: {
				expand: true,
				cwd: path.server + '/',
				src: '**/*',
				dest: path.dist.base + '/server/'
			},
			'package': {
				src: 'package.json',
				dest: path.dist.base + '/'
			}
		},
		jshint: {
			server: {
				files: {
					src: [
						'*.js',
						path.server + '/**/*.js',
						path.server + '/**/**/*.js'
					]
				},
				options: {
					jshintrc: '.jshintrc'
				}
			},
			test: {
				files: {
					src: [
						path.test + '/server/**/*.spec.js',
					]
				},
				options: {
					jshintrc: path.test + '/.jshintrc'
				}
			}
		},
		jssourcemaprev: {
			files: {
				src: [path.dist.static + '/{js}/**/*.js']
			}
		},
		mocha_istanbul: {
			prepublish: {
				src: [
					'test/server/conf.js'
				]
			},
			server: {
				src: [
					'test/server/conf.js',
					'test/server/**/*.spec.js',
					'test/*.spec.js'
				]
			},
			options: {
				root: 'src/server',
				reporter: 'spec',
				coverageFolder: 'test/server/coverage',
				reportFormats: ['text-summary', 'html'],
				istanbulOptions: ['--include-all-sources']
			}
		},
	});
};
