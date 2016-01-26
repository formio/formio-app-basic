angular.module('formioAppBasic').provider('Resource', [
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

        var controllers = (options && options.controllers) ? options.controllers : {};
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
              if (controllers.index) {
                $controller(controllers.index, {$scope: $scope});
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
              if (controllers.create) {
                var ctrl = $controller(controllers.create, {$scope: $scope});
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

              if (controllers.abstract) {
                $controller(controllers.abstract, {$scope: $scope});
              }
            })
          })
          .state(name + '.view', {
            url: '/',
            parent: name,
            params: options.params && options.params.view,
            templateUrl: templates.view ? templates.view : 'views/resource/view.html',
            controller: controller(function($scope, $rootScope, $state, $stateParams, Formio, FormioUtils, $controller) {
              if (controllers.view) {
                $controller(controllers.view, {$scope: $scope});
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
              if (controllers.edit) {
                var ctrl = $controller(controllers.edit, {$scope: $scope});
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
              if (controllers.delete) {
                var ctrl = $controller(controllers.delete, {$scope: $scope});
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
]);
