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
    'AppConfig',
    function(
      $stateProvider,
      $urlRouterProvider,
      FormioProvider,
      AppConfig
    ) {
      FormioProvider.setBaseUrl(AppConfig.apiUrl);

      $stateProvider
        .state('home', {
          url: '/',
          templateUrl: 'views/main.html'
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

      $urlRouterProvider.otherwise('/');
    }
  ])
  .factory('FormioAlerts', function () {
    var alerts = [];
    return {
      addAlert: function (alert) {
        alerts.push(alert);
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
  })
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
      $rootScope.userForm = AppConfig.forms.userForm;
      $rootScope.userRegisterForm = AppConfig.forms.userRegisterForm;
      $rootScope.userLoginForm = AppConfig.forms.userLoginForm;

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

      var logoutError = function() {
        $state.go('auth.login');
        FormioAlerts.addAlert({
          type: 'danger',
          message: 'Your session has expired. Please log in again.'
        });
      };

      $rootScope.$on('formio.sessionExpired', logoutError);
      $rootScope.$on('formio.unauthorized', function() {
        $state.go('home');
      });

      // Trigger when a logout occurs.
      $rootScope.logout = function() {
        Formio.logout().then(function() {
          $state.go('auth.login');
        }).catch(logoutError);
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
    }
  ]);
})();
