var APP_URL = 'https://todoapp.form.io';
var API_URL = 'https://api.form.io';

// Parse query string
var query = {};
location.search.substr(1).split("&").forEach(function(item) {
  query[item.split("=")[0]] = item.split("=")[1] && decodeURIComponent(item.split("=")[1]);
});

angular.module('formioAppBasic').constant('AppConfig', {
  appUrl: query.appUrl || APP_URL,
  apiUrl: query.apiUrl || API_URL,
  forms: {
    userLoginForm: APP_URL + '/user/login',
    userRegisterForm: APP_URL + '/user/register'
  }
});
