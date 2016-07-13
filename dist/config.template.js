{% if domain %}
var APP_URL = '{{ domain }}';
var API_URL = '{{ domain }}';
{% else %}
var APP_URL = '{{ protocol }}://{{ path }}.{{ host }}';
var API_URL = '{{ protocol }}://api.{{ host }}';
{% endif %}

// Parse query string
var query = {};
location.search.substr(1).split("&").forEach(function(item) {
  query[item.split("=")[0]] = item.split("=")[1] && decodeURIComponent(item.split("=")[1]);
});

APP_URL = query.appUrl || APP_URL;
API_URL = query.apiUrl || API_URL;

angular.module('formioAppBasic').constant('AppConfig', {
  appUrl: APP_URL,
  apiUrl: API_URL,
  forms: {
    userForm: APP_URL + '/user',
    userLoginForm: APP_URL + '/user/login',
    userRegisterForm: APP_URL + '/user/register'
  },
  resources: {
    user: {
      form: APP_URL + '/user',
      resource: 'UserResource'
    }
  }
});
