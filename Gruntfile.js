/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    site: {
      app_dir: 'app',
      dist_dir: 'dist'
    },
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    watch: {
      less: {
        files: ['<%= site.app_dir %>/_less/**/*.less'],
        tasks: ['less:development']
      }
    },
    less: {
      development: {
        options: {
          strictMath: true,
          sourceMap: false
        },
        files: {
          '<%= site.app_dir %>/assets/css/main.css' : '<%= site.app_dir %>/_less/main.less',
          '<%= site.app_dir %>/assets/css/blog.css' : '<%= site.app_dir %>/_less/blog.less',
          '<%= site.app_dir %>/assets/css/syntax.css' : '<%= site.app_dir %>/_less/syntax.less',
          '<%= site.app_dir %>/assets/css/bootstrap.css' : '<%= site.app_dir %>/_less/bootstrap.less'
        }
      }
    },
    'gh-pages': {
      options: {
        base: '.jekyll'
      },
      src: ['**']
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-gh-pages');

  // Default task.
  // grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);
  // grunt.registerTask('copy',['']);

  grunt.registerTask('watchless', ['watch:less']);

  grunt.registerTask('gitDeploy',['grunt_deploy']);

};
