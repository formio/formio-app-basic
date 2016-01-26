angular.module('formioAppBasic').run([
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
