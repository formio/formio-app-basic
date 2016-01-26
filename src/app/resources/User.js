/**
 *  The following shows an example resource provider.
 *
 *  This allows you to hook into the CRUD operations for a single Form.io
 *  resource as it is being indexed, viewed, deleted, created, updated, etc. By
 *  providing your logic here, you can control how Form.io behaves within your
 *  application.
 */
angular.module('formioAppBasic')
  .provider('UserResource', function() {
    return {
      $get: function() { return null; },
      index: ['$scope', '$stateParams', function($scope, $stateParams) {
      }],
      abstract: ['$scope', '$stateParams', function($scope, $stateParams) {
      }],
      view: ['$scope', '$stateParams', function($scope, $stateParams) {
      }],
      create: ['$scope', '$state', function($scope, $state) {
        $scope.$on('formSubmission', function(err, submission) {
          // Do something here...
          console.log(submission);
        });
      }],
      edit: ['$scope', '$stateParams', function($scope, $stateParams) {
        $scope.$on('formSubmission', function(err, submission) {
          // Do something here...
          console.log(submission);
        });
      }],
      delete: ['$scope', '$stateParams', function($scope, $stateParams) {
        $scope.$on('delete', function(err) {
          // Do something here...
        });
      }]
    };
  });
