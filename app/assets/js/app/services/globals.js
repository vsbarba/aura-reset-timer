'use strict';

/**
 * Contains all the configuration files and templates
 * - configuration variables for API
 * - default templates
 */

App.TEMPLATE = {
  // Basic Template when creating a new widget
  defaultWidget: {
    version: '0.0.1',
    name: 'sampleWidget',
    default: 'Sample Widget',
    description: 'This is a sample widget.',
    helpUrl: 'http://uikit.srv1.dc1.toroserver.com',
    iconUrl: 'http://placehold.it/60/0d85a7/FFFFFF',
    type: {
      html: 'html',
      grid_template: 'grid-template',
      in_head_html: 'in-head-html'
    },
    section: {
      head: 'head',
      header: 'header',
      body: 'body',
      main: 'main',
      footer: 'footer'
    },
    categories: {
      dynamic_content_widgets: 'dynamic-content-widgets',
      tracking_widgets: 'tracking-widgets',
      in_footer_widgets: 'in-footer-widgets',
      header_widgets: 'header-widgets',
      facet_widgets: 'facet-widgets'
    },
    variables: {
      variable: []
    },
    css: '.test { color: green; }',
    javascript: 'console.log(\' Hello World  \');',
    template: {
      language: 'velocity',
      content: '<pre class=\"test\"> Hello World </pre>'
    }
  },

  defaultExternalSrc: {
    resources: {
      framework: '1',
      jsLibs: [
        '//code.jquery.com/jquery-1.11.0.min.js',
        '//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js'
      ],
      cssLibs: [
        '//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css'
      ]
    }
  }

}

App.INCLUDES = {
  // Editor
  panelToolbar : '/views/includes/editor/panel-toolbar.html',
  panelResource : '/views/includes/editor/panel-resource.html',
  panelJsonView : '/views/includes/editor/panel-json-view.html',
  drawerWidgetOptions : '/views/includes/editor/drawer-widget-options.html',
  drawerWidgetOptionsEdit : '/views/includes/editor/drawer-widget-options-edit.html'
}
