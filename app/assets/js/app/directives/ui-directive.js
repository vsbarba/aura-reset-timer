
/*! Application Directives
 * ========================================================================= */

'use strict';

App.directive('showHide', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {

      element.on('click', function (e) {
        
        var target = $(this).data('target'),
            hideClass = $(this).data('hide-class'),
            tabTriggerClass = $(this).data('tabTrigger');

        $(tabTriggerClass).removeClass('active');
        $(this).addClass('active');
        $(hideClass).addClass('hide-editor');
        $(target).removeClass('hide-editor');

      });

    }
  }
});