module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      files: ['js/**/*.js'],
      options: {
        predef: [ "document", "console", "$", "firebase", "FbAPI"],
        esnext: true,
        globalstrict: true,
        globals: {},
        browserify: true
      }
    },
     sass: {
      dist: {
        files: {
          'styles/main.css': 'sass/main.scss'
        }
      }
    },
    watch: {
      javascripts: {
        files: ['js/**/*.js'],
        tasks: ['jshint']
      },
      sassy: {
        files: ['sass/**/*.scss'],
        tasks: ['sass']
      },
      options: {
      livereload: true,
      }
    }
  });

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  grunt.registerTask('default', ['sass', 'jshint', 'watch']);
};
