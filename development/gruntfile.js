
	// use "grunt build:[name]"

module.exports = function(grunt) {

	var pkg = grunt.file.readJSON('package.json');

	pkg.banner = '/*! \n ' +
	' * @package    <%= name %>\n' +
	' * @version    <%= version %>\n' +
	' * @date       <%= grunt.template.today("yyyy-mm-dd") %>\n' +
	' * @author     <%= author %>\n' +
	' * @copyright  Copyright (c) <%= grunt.template.today("yyyy") %> <%= copyright %>\n' +
	' */\n';

	pkg.banner = grunt.template.process(pkg.banner, {data: pkg});

	var meta = {
		srcPath: '',
		jsPath: 'js/',
		tmpPath: '../tmp/',
		deployPath: '../release/',
	};


	// pkg.minify = '.min';
	// var fileVars = pkg;

	// Project configuration.
	grunt.initConfig({

		//Read the package.json (optional)
		pkg: pkg,

		// Metadata.
		meta: meta,

		banner: pkg.banner,

	    // clean: {
		//     tmpDir: {
		// 		src: ['<%= meta.tmpPath %>/**/*'],
		// 		options: {
		// 			force: true // force cleanup outside of cwd
		// 		}
		//     }
	    // },

		concat: {
			options: {
				stripBanners: true,
				process: {data:pkg},
			},
			ylib: {
				src: [],
				dest: '<%= meta.deployPath %>/ylib.js'
			}
		},

		uglify : {
			ylib: {
				options: {
					banner: pkg.banner,
					beautify: false,
					preserveComments: 'some',
					mangle: false,
					compress: {
						global_defs: {
							"DEBUG": false
						},
						drop_debugger : false
					}
				},
				files: {

				}
			}
		},

		// watch: {
		// 	default : {
		// 		files: ['<%= meta.srcPath %>component/**/*','<%= meta.srcPath %>plugin/**/*','<%= meta.srcPath %>js/**/*'],
		// 		tasks: [ ]
		// 	}
		// }
	});

	// These plugins provide necessary tasks.
	// grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	// grunt.loadNpmTasks('grunt-contrib-watch');
	// grunt.loadNpmTasks('grunt-contrib-clean');
	// grunt.loadNpmTasks('grunt-contrib-requirejs');


	grunt.registerTask('build', function(name) {
		var fileName = meta.srcPath+'configurations/'+name+'.json';
		if(grunt.file.exists(fileName)) {

			var config = grunt.file.readJSON(fileName);
			config.componentFiles = [];
			config.components.forEach(function(cName,index,arr){
				config.componentFiles.push( '<%= meta.srcPath %>components/'+cName+'.js' );
			});

			var changedConfig = {
				concat: {
					ylib: {
						src: config.componentFiles,
						dest: '<%= meta.deployPath %>ylib.'+name+'.js'
					}
				},
				uglify : {
					ylib: {
						files: {

						}
					}
				},
			};

			changedConfig.uglify.ylib.files['<%= meta.deployPath %>ylib.'+name+'.min.js'] = [ '<%= meta.deployPath %>ylib.'+name+'.js' ];

			grunt.config.merge(changedConfig);

			grunt.task.run([ 'concat:ylib', 'uglify:ylib' ]);

		} else {
			var validNames = [];
			grunt.file.recurse(meta.srcPath+'configurations',function(abspath, rootdir, subdir, filename){
				validNames.push(filename.substr(0,filename.length-5));
			});
			console.log('configuration "'+name+'" not found. Valid names are:');
			console.log(validNames);
		}
	});


	// use "grunt build:[name]"

};
