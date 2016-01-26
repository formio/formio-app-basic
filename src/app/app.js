(function() {
  'use strict';
  angular.module('formioAppBasic', [
    'ngSanitize',
    'ui.router',
    'ui.bootstrap',
    'formio'
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

      // Register all of the resources.
      angular.forEach(AppConfig.resources, function(resource, name) {
        ResourceProvider.register(name, resource.form, $injector.get(resource.resource + 'Provider'));
      });

      $urlRouterProvider.otherwise('/');
    }
  ]);
})();
