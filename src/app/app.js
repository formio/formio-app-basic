(function() {
  'use strict';
  angular.module('formioAppBasic', [
    'ngSanitize',
    'ui.router',
    'ui.bootstrap',
    'formio'
  ])
  .filter('capitalize', [function() {
    return _.capitalize;
  }])
  .filter('truncate', [function() {
    return function(input, opts) {
      if(_.isNumber(opts)) {
        opts = {length: opts};
      }
      return _.truncate(input, opts);
    };
  }])
  .provider('Resource', [
    '$stateProvider',
    function(
      $stateProvider
    ) {
      var resources = {};
      return {
        register: function(name, url, options) {
          resources[name] = name;
          var parent = (options && options.parent) ? options.parent : null;
          var queryId = name + 'Id';
          var query = function(submission) {
            var query = {};
            query[queryId] = submission._id;
            return query;
          };
          var controller = function(ctrl) {
            return ['$scope', '$rootScope', '$state', '$stateParams', 'Formio', 'FormioUtils', '$controller', ctrl];
          };

          var templates = (options && options.templates) ? options.templates : {};
          $stateProvider
            .state(name + 'Index', {
              url: '/' + name,
              parent: parent ? parent : null,
              params: options.params && options.params.index,
              templateUrl: templates.index ? templates.index : 'views/resource/index.html',
              controller: controller(function($scope, $rootScope, $state, $stateParams, Formio, FormioUtils, $controller) {
                $scope.currentResource = {
                  name: name,
                  queryId: queryId,
                  formUrl: url
                };
                $scope.$on('submissionView', function(event, submission) {
                  $state.go(name + '.view', query(submission));
                });

                $scope.$on('submissionEdit', function(event, submission) {
                  $state.go(name + '.edit', query(submission));
                });

                $scope.$on('submissionDelete', function(event, submission) {
                  $state.go(name + '.delete', query(submission));
                });
                if (options && options.index) {
                  $controller(options.index, {$scope: $scope});
                }
              })
            })
            .state(name + 'Create', {
              url: '/create/' + name,
              parent: parent ? parent : null,
              params: options.params && options.params.create,
              templateUrl: templates.create ? templates.create : 'views/resource/create.html',
              controller: controller(function($scope, $rootScope, $state, $stateParams, Formio, FormioUtils, $controller) {
                $scope.currentResource = {
                  name: name,
                  queryId: queryId,
                  formUrl: url
                };
                $scope.submission = {data: {}};
                var handle = false;
                if (options && options.create) {
                  var ctrl = $controller(options.create, {$scope: $scope});
                  handle = (ctrl.handle || false);
                }
                if (!handle) {
                  $scope.$on('formSubmission', function(event, submission) {
                    $state.go(name + '.view', query(submission));
                  });
                }
              })
            })
            .state(name, {
              abstract: true,
              url: '/' + name + '/:' + queryId,
              parent: parent ? parent : null,
              templateUrl: 'views/resource/resource.html',
              controller: controller(function($scope, $rootScope, $state, $stateParams, Formio, FormioUtils, $controller) {
                var submissionUrl = url + '/submission/' + $stateParams[queryId];
                $scope.currentResource = $scope[name] = {
                  name: name,
                  queryId: queryId,
                  formUrl: url,
                  submissionUrl: submissionUrl,
                  formio: (new Formio(submissionUrl)),
                  resource: {},
                  form: {},
                  href: '/#/' + name + '/' + $stateParams[queryId] + '/',
                  parent: parent ? $scope[parent] : {href: '/#/', name: 'home'}
                };

                $scope.currentResource.loadFormPromise = $scope.currentResource.formio.loadForm().then(function(form) {
                  $scope.currentResource.form = $scope[name].form = form;
                });
                $scope.currentResource.loadSubmissionPromise = $scope.currentResource.formio.loadSubmission().then(function(submission) {
                  $scope.currentResource.resource = $scope[name].submission = submission;
                });

                if (options && options.abstract) {
                  $controller(options.abstract, {$scope: $scope});
                }
              })
            })
            .state(name + '.view', {
              url: '/',
              parent: name,
              params: options.params && options.params.view,
              templateUrl: templates.view ? templates.view : 'views/resource/view.html',
              controller: controller(function($scope, $rootScope, $state, $stateParams, Formio, FormioUtils, $controller) {
                if (options && options.view) {
                  $controller(options.view, {$scope: $scope});
                }
              })
            })
            .state(name + '.edit', {
              url: '/edit',
              parent: name,
              params: options.params && options.params.edit,
              templateUrl: templates.edit ? templates.edit : 'views/resource/edit.html',
              controller: controller(function($scope, $rootScope, $state, $stateParams, Formio, FormioUtils, $controller) {
                var handle = false;
                if (options && options.edit) {
                  var ctrl = $controller(options.edit, {$scope: $scope});
                  handle = (ctrl.handle || false);
                }
                if (!handle) {
                  $scope.$on('formSubmission', function(event, submission) {
                    $state.go(name + '.view', query(submission));
                  });
                }
              })
            })
            .state(name + '.delete', {
              url: '/delete',
              parent: name,
              params: options.params && options.params.delete,
              templateUrl: templates.delete ? templates.delete : 'views/resource/delete.html',
              controller: controller(function($scope, $rootScope, $state, $stateParams, Formio, FormioUtils, $controller) {
                var handle = false;
                if (options && options.delete) {
                  var ctrl = $controller(options.delete, {$scope: $scope});
                  handle = (ctrl.handle || false);
                }
                if (!handle) {
                  $scope.$on('delete', function() {
                    $state.go(name + 'Index');
                  });
                }
              })
            });
        },
        $get: function() {
          return resources;
        }
      };
    }
  ])
  .config([
    '$stateProvider',
    '$urlRouterProvider',
    'FormioProvider',
    'ResourceProvider',
    'AppConfig',
    '$injector',
    function(
      $stateProvider,
      $urlRouterProvider,
      FormioProvider,
      ResourceProvider,
      AppConfig,
      $injector
    ) {
      FormioProvider.setBaseUrl(AppConfig.apiUrl);

      $stateProvider
        .state('home', {
          url: '/',
          templateUrl: 'views/home.html'
        })
        .state('auth', {
          abstract: true,
          url: '/auth',
          templateUrl: 'views/user/auth.html'
        })
        .state('auth.login', {
          url: '/login',
          templateUrl: 'views/user/login.html',
          controller: [
            '$scope',
            '$state',
            '$rootScope',
            function(
              $scope,
              $state,
              $rootScope
            ) {
              $scope.$on('formSubmission', function(err, submission) {
                if (!submission) { return; }
                $rootScope.user = submission;
                $state.go('home');
              });
            }
          ]
        })
        .state('auth.register', {
          url: '/register',
          templateUrl: 'views/user/register.html',
          controller: [
            '$scope',
            '$state',
            '$rootScope',
            function(
              $scope,
              $state,
              $rootScope
            ) {
              $scope.$on('formSubmission', function(err, submission) {
                if (!submission) { return; }
                $rootScope.user = submission;
                $state.go('home');
              });
            }
          ]
        });

      angular.forEach(AppConfig.resources, function(resource, name) {
        ResourceProvider.register(name, resource.form, $injector.get(resource.resource + 'Provider'));
      });

      $urlRouterProvider.otherwise('/');
    }
  ])
  .factory('FormioAlerts', [
    '$rootScope',
    function (
      $rootScope
    ) {
      var alerts = [];
      return {
        addAlert: function (alert) {
          $rootScope.alerts.push(alert);
          if (alert.element) {
            angular.element('#form-group-' + alert.element).addClass('has-error');
          }
          else {
            alerts.push(alert);
          }
        },
        getAlerts: function () {
          var tempAlerts = angular.copy(alerts);
          alerts.length = 0;
          alerts = [];
          return tempAlerts;
        },
        onError: function showError(error) {
          if (error.message) {
            this.addAlert({
              type: 'danger',
              message: error.message,
              element: error.path
            });
          }
          else {
            var errors = error.hasOwnProperty('errors') ? error.errors : error.data.errors;
            angular.forEach(errors, showError.bind(this));
          }
        }
      };
    }
  ])
  .run([
    '$rootScope',
    '$state',
    '$stateParams',
    'Formio',
    'AppConfig',
    'FormioAlerts',
    function(
      $rootScope,
      $state,
      $stateParams,
      Formio,
      AppConfig,
      FormioAlerts
    ) {
      $rootScope.userForm = AppConfig.forms.user;
      $rootScope.userRegisterForm = AppConfig.forms.userRegister;
      $rootScope.userLoginForm = AppConfig.forms.userLogin;

      // Add the forms to the root scope.
      angular.forEach(AppConfig.forms, function(url, form) {
        $rootScope[form] = url;
      });

      // If no user is defined, then get the current user.
      if (!$rootScope.user) {
        Formio.currentUser().then(function(user) {
          $rootScope.user = user;
        });
      }

      var logoutError = function(message) {
        return function() {
          localStorage.removeItem('formioUser');
          localStorage.removeItem('formioToken');
          $state.go('auth.login');
          FormioAlerts.addAlert({
            type: 'danger',
            message: message
          });
        };
      };

      $rootScope.$on('formio.sessionExpired', logoutError('Your session has expired. Please log in again.'));

      // Trigger when a logout occurs.
      $rootScope.logout = function() {
        Formio.logout().then(function() {
          $state.go('auth.login');
        }).catch(logoutError('Your session has expired. Please log in again.'));
      };

      // Determine if the current state is active.
      $rootScope.isActive = function(state) {
        return $state.current.name.indexOf(state) !== -1;
      };

      // Ensure they are logged in.
      $rootScope.$on('$stateChangeStart', function(event, toState) {
        $rootScope.authenticated = !!Formio.getToken();
        if (toState.name.substr(0, 4) === 'auth') { return; }
        if (toState.name.substr(0, 11) === 'admin.login') { return; }
        if(!$rootScope.authenticated) {
          event.preventDefault();
          $state.go('auth.login');
        }
      });

      // Show alerts when we need to.
      $rootScope.$on('$stateChangeSuccess', function() {
        $rootScope.alerts = FormioAlerts.getAlerts();
      });
    }
  ]);
})();
