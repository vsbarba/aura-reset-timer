'use strict';

/**
 * The main controller for the app editor page. The controller:
 * - retrieves and persists the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */

App.controller('EditorCtrl', ['$scope', '$routeParams', '$timeout', 'ToroAPI',
  function ($scope, $routeParams, $timeout, ToroAPI, $idle) {

    // ngIncludes
    // ===============================

    $scope.inclPanelToolbar = App.INCLUDES.panelToolbar;
    $scope.inclPanelResource = App.INCLUDES.panelResource;
    $scope.inclPanelJsonView = App.INCLUDES.panelJsonView;

    $scope.inclDrawerWidgetOpt = App.INCLUDES.drawerWidgetOptions;
    $scope.inclDrawerWidgetOptEdit = App.INCLUDES.drawerWidgetOptionsEdit;

    // ngIdle
    // ===============================

    $scope.$on('$idleStart', function () {
      $scope.buildIframe(false);
    });
    
    // $viewContentLoaded
    // jQuery Stuff onLoad
    // ===============================

    $scope.$on('$viewContentLoaded', function () {
      $(document).ready(function () {
        resizer.actions._init();
      });
    });

    // Setters & Getters
    // ===============================

    // Notification Popups
    $scope.sbPopup = false;
    $scope.sbPopupMessage = 'Default Message';

    $scope.showPopup = function (message) {
      $scope.sbPopup = true;
      $scope.sbPopupMessage = message;
    }

    $scope.showLoader = function (isLoading) {
      $scope.loading = isLoading;
    };

    $scope.setWidgetId = function (widgetId) {
      $scope.widgetId = widgetId;
      return;
    };

    $scope.getWidgetId = function () {
      return $scope.widgetId;
    };

    $scope.isWidgetIdExist = function () {
      if ($routeParams.widgetId == undefined || $scope.getWidgetId == null) {
        return false;
      } else {
        return true;
      }
    }

    /** 
     *  SCOPES
     *    + $scope.json - json used for most of the ng-model for viewing
     *    + $scope.master - json used for the request
     */

    $scope.json = {};
    $scope.master = {};

    //  Initialize CREATE|EDIT Widget
    //  ===============================

    if (!$scope.isWidgetIdExist()) {

      $scope.showLoader(true); // Show Loader
      $scope.setWidgetId(null); // Set widgetId ready for saving
      $scope.json = App.TEMPLATE.defaultWidget; // Get Default Widget Template
      $scope.resources = App.TEMPLATE.defaultExternalSrc; // Get Default Widget Template

      $timeout(function () {
        initCodeMirror($scope.json.template.content, $scope.json.css, $scope.json.javascript);
        $scope.buildIframe(false);
        $('#modalConfig').modal(); // Warning: Use a Directive or Emit
      });

      $scope.showLoader(false); // Hide Loader

    } else {

      $scope.showLoader(true); // Show Loader
      $scope.setWidgetId($routeParams.widgetId); // Set widgetId ready for updating
      $scope.resources = App.TEMPLATE.defaultExternalSrc; // Get Default Widget Template

      /**
       * ToroAPI.getWidgetDetails
       * @params
       *  1. widgetId [string]
       *  2. successCallback [function]
       *  3. errorCallback [function]
       */

      ToroAPI.getWidgetDetails($scope.getWidgetId(), 
        function (response) {
          var resToNgModel = processToKeyValue(response.content.widget.data);
          angular.extend($scope.json, resToNgModel);
          $scope.variables = angular.copy(resToNgModel.variables);
          initCodeMirror($scope.json.template.content, $scope.json.css, $scope.json.javascript);
          $timeout(function () {
            $scope.buildIframe(false);
          }, 0);
          $scope.showLoader(false); // Hide Loader
        }, 
        function (response) {
          $scope.showLoader(false); // Hide Loader
          onErrorWebService(response, 'ToroAPI.getWidgetDetails');
        }
      );

    }

    /**
     * CodeMirror UI-Angular
     *  This is the codemirror angular directive plugin. See ui-angular for more info.
     * Usage:
     *  <textarea ui-codemirror="{ onLoad : cmVelocityConfig }" ng-model="codemirror.velocity"></textarea>
     */

    var initCodeMirror = function (cmVelocityVal, cmCssVal, cmJavascriptVal) {
      $scope.codemirror = {
        velocity: angular.copy(cmVelocityVal),
        css: angular.copy(cmCssVal),
        javascript: angular.copy(cmJavascriptVal)
      }
    };

    $scope.cmVelocityConfig = function (_editor) {

      var _doc = _editor.getDoc();

      setDefaultCMConfig(_doc, _editor, 'text/velocity'); // Default CodeMirror Options

      _editor.on("change", function () {
        $scope.json.template.content = angular.copy($scope.codemirror.velocity);
      });

    };

    $scope.cmCssConfig = function (_editor) {

      var _doc = _editor.getDoc();

      setDefaultCMConfig(_doc, _editor, 'text/css');

      _editor.on("change", function () {
        $scope.json.css = angular.copy($scope.codemirror.css);
      });

    };

    $scope.cmJavascriptConfig = function (_editor) {

      var _doc = _editor.getDoc();

      setDefaultCMConfig(_doc, _editor, 'text/javascript');

      _editor.on("change", function () {
        $scope.json.javascript = angular.copy($scope.codemirror.javascript);
      });

    };

    var setDefaultCMConfig = function (_doc, _editor, mode) {
      _editor.setOption('theme', 'solarized dark');
      _editor.setOption('tabMode', 'indent');
      _editor.setOption('matchBrackets', true);
      _editor.setOption('matchTags', true);
      _editor.setOption('lineNumbers', true);
      _editor.setOption('indentUnit', 2);
      _editor.setOption('lineWrapping', true);
      _editor.setOption('mode', mode);
      _doc.markClean();
      return;
    };

    /** 
     * $scope.buildIframe
     *  This will build the html
     * @params
     *  isEvaluatedHtml [boolean]
     *  evaluatedHtml [html-text-string]
     */

    $scope.buildIframe = function (isEvaluatedHtml, evaluatedHtml) {
      console.log('-----[ build html ]-----');

      // Build Html Source
      var html = '';
      html = '<html>';
      html += '<head>';

      if ($scope.resources.resources.cssLibs) {
        for (var index in $scope.resources.resources.cssLibs) {
          html += '<link rel=\"stylesheet\" href=\"' + $scope.resources.resources.cssLibs[index] + '\">';
        }
      }

      html += '<style>';
      html += $scope.json.css;
      html += '</style>';
      html += '</head>';
      html += '<body>';

      if (isEvaluatedHtml) {
        html += evaluatedHtml;
      } else {
        html += $scope.json.template.content;
      }

      if ($scope.resources.resources.jsLibs) {
        for (var index in $scope.resources.resources.jsLibs) {
          html += '<script src=\"' + $scope.resources.resources.jsLibs[index] + '\"></script>';
        }
      }

      html += '<script>';
      html += $scope.json.javascript;
      html += '</script>';
      html += '</body>';
      html += '</html>';

      if (isEvaluatedHtml) {
        $scope.evaluatedHtmlSource = html;
      } else {
        $scope.htmlSource = html;
      }
      console.log('-----[ end build html ]-----')

    };

    // SAVE||NEW WIDGET|UPDATE WIDGET A WIDGET

    $scope.update = function (json) {
      $scope.showLoader(true);

      $scope.master = {
        id: $scope.getWidgetId(),
        data: convertObjectToArray(angular.copy(json))
      }

      ToroAPI.saveWidget($scope.master)
        .success(function (data, status, headers, config) {
          $scope.showLoader(false);
          $scope.setWidgetId(data.content.id);
          $scope.buildIframe(true, data.content.previewHtml);
          $scope.showPopup('Saved a Widget!');
          post_webservice(data, 'ToroAPI.saveWidget');
        }).error(function (data, status, headers, config) {
          $scope.showLoader(false);
          post_webservice(data, 'ToroAPI.saveWidget');
        });
    }

    // Refresh Iframe

    $scope.refreshIframe = function () {
      $scope.showPopup('Refreshed Preview!');
      $scope.buildIframe(false);
    }

    // PREVIEW WIDGET

    $scope.previewWidget = function () {
      var URL = "/test-widget/" + $scope.getWidgetId();
      window.open(URL, "_blank");
    }

    //  Widget Options
    //  ===============================

    $scope.variable = {
      option: []
    }

    $scope.variables = {
      variable: []
    }

    $scope.display = function (optionType, variableType) {

      var evaluate = function (optionType, allowed) {
        if ($.inArray(optionType, allowed) == -1) {
          return false;
        } else {
          return true;
        }
      }

      switch (variableType) {
        case 'text':
          var allowed = ['default', 'name', 'required', 'maxlength', 'defaultValue'];
          return evaluate(optionType, allowed);
          break;
        case 'boolean':
          var allowed = ['default', 'name', 'defaultValueRadio'];
          return evaluate(optionType, allowed);
          break;
        case 'select':
          var allowed = ['default', 'name', 'defaultValue', 'options'];
          return evaluate(optionType, allowed);
          break;
        case 'radio':
          var allowed = ['default', 'name', 'defaultValue', 'options'];
          return evaluate(optionType, allowed);
          break;
        case 'textarea':
          var allowed = ['default', 'name', 'required', 'maxlength', 'defaultValue'];
          return evaluate(optionType, allowed);
          break;
        default:
          return true;
      }

    }

    // DISPLAY AN OPTION
    $scope.displayOption = function (optionType) {
      $scope.optionType = optionType;
      if ($scope.optionType ==='select' || $scope.optionType === 'radio') {
        $scope.variable = {
          option: [{
            name: '',
            value: '',
            default: ''
          }]
        }
      }
    }

    // CREATE|SAVE A VARIABLE
    $scope.addVariable = function (variable) {
      variable.type = angular.copy($scope.optionType);
      $scope.variables.variable.push(variable);
      $scope.variable = {
        option: []
      }

      updateEverythingJson($scope);
      $scope.showPopup('Added Widget Variable!');
    }

    // DISPLAY AND EDITMODE OF VARIABLE
    $scope.editVariable = function (index, optionType) {
      $scope.optionType = optionType;
      $scope.currentWidgetIndex = index;
      $scope.editVar = angular.extend($scope.variables.variable[index]);
    }

    // REMOVE A VARIABLE
    $scope.removeVariable = function (index) {
      $scope.variables.variable.splice(index, 1);
      updateEverythingJson($scope);
      $scope.showPopup('Removed Widget Variable!');
    }

    // SAVE|UPDATE CURRENTLY EDIT
    $scope.updateVariable = function (editVar) {
      $scope.variables.variable[$scope.currentWidgetIndex] = angular.copy($scope.editVar);
      updateEverythingJson($scope);
      $scope.showPopup('Updated Widget Variable!');
    }

    // Add more option for select/radio optionType
    $scope.addMoreOption = function (isEditMode) {
      if (isEditMode) {
        $scope.editVar.option.push({
          name: '',
          value: '',
          default: ''
        });
      } else {
        $scope.variable.option.push({
          name: '',
          value: '',
          default: ''
        });
      }
    }

    // Remove an option for select/radio option type
    $scope.removeOption = function (index, isEditMode) {
      if (isEditMode) {
        $scope.editVar.option.splice(index, 1)
      } else {
        $scope.variable.option.splice(index, 1)
      }
    }

    var processToKeyValue = function (webserviceJsonData) {
      // Init Vars
      var ngModel = {},
          convertToKeyValue = [],
          object = {},
          convertedObject = {},
          key = '',
          updatedNgModel = {};

      // Init Data
      ngModel = webserviceJsonData;

      convertToKeyValue.push({ categories: ngModel.categories });
      convertToKeyValue.push({ section: ngModel.section });
      convertToKeyValue.push({ type: ngModel.type });

      // Logics
      for (var $key in convertToKeyValue) {
        convertedObject = {};
        object = convertToKeyValue[$key];
        for (var $keyObject in object) {
          var obj = object[$keyObject];
          for (var $index in obj) {
            key = obj[$index].replace(/-/g, '_');
            convertedObject[key] = obj[$index];
          }
          updatedNgModel[$keyObject] = convertedObject;
        }
      }

      angular.extend(ngModel, updatedNgModel);
      return ngModel;
    }

    var convertObjectToArray = function (jsonDataToConvert) {
      // Init Variables
      var ngModel = {},
          toConvert = [],
          convertedObject = [],
          toBeExtended = {};

      // Init Data
      ngModel = jsonDataToConvert;

      toConvert.push({ categories: ngModel.categories });
      toConvert.push({ section: ngModel.section });
      toConvert.push({ type: ngModel.type });

      for (var i in toConvert) {
        for (var a in toConvert[i]) {
          var obj = toConvert[i];
          convertedObject = [];
          for (var x in obj[a]) {
            var prop = obj[a];
            if (prop[x] !== '') {
              convertedObject.push(prop[x].replace(/_/g, '-'));
            }
          }
          toBeExtended[a] = convertedObject;
        }
      }

      angular.extend(ngModel, toBeExtended);
      return ngModel;
    }

    var updateEverythingJson = function ($scope) {
      $scope.json.variables = angular.copy($scope.variables);
    }

    // Hotkey Listener

    $scope.down = function ($event) {
      // CTRL + S
      if ($event.ctrlKey && $event.keyCode === 83) {
        $scope.update($scope.json);
      } else if ($event.ctrlKey && $event.keyCode === 82) {
        $scope.refreshIframe();
      } else if ($event.ctrlKey && $event.keyCode === 84) {
        $scope.previewWidget();
      }
    };

  }
]);

/** 
 * Directive:
 *  iframeDirective
 * Description:
 *  This will watch the scope and write the changes to the iframe element
 * Usage:
 *  <iframe iframe-directive html="obj" evaluatedHtmlSource="obj"></iframe>
 */

App.directive('iframeDirective', function ($compile) {
  return {
    restrict: 'A',
    scope: {
      htmlSource: '=',
      evaluatedHtmlSource: '='
    },
    link: function (scope, elem, attrs) {
      
      var doc = elem.context.contentDocument;

      scope.$watch('htmlSource', function () {
        if (scope.htmlSource !== undefined) {
          write(doc, angular.copy(scope.htmlSource));
        }
      });

      scope.$watch('evaluatedHtmlSource', function () {
        if (scope.evaluatedHtmlSource !== undefined) {
          write(doc, angular.copy(scope.evaluatedHtmlSource));
        }
      });

      var write = function (doc, completeHtml) {
        doc.open();
        doc.write(completeHtml);
        doc.close();
      }

    }
  }
});
