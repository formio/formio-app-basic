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

      /**
       * The parent is name of the Resource field within your resource that points to the parent resource. This ultimately
       * is passed along as an array to the "parents" paramter below.
       */
      parent: '',
      
      /**
       * Allows you to provide multiple parents or the names of the resource fields that serve as the parent of this resource. 
       * For example, if you wish your users to be within Groups, and you have a Resource and Resource field within the User 
       * where the API key is 'group', you would provide the following. ['group']
       */
      parents: [],
      
      /**
       * This allows you to nest your resources within a UI Router path. For example, if you wish users to be within groups, and
       * you have a Group resource, you could provide the following base.  'group.'
       */
      base: '',

      /**
       * Allow you to change the template for any view of this resource. You can override any of these templates by copying the 
       * corresponding template within the bower_components/ng-formio-helper/src/templates/resource folder. You can copy any of
       * those templates, paste that to your own views folder, and then provide the new path to that template below.
       */
      templates: {
        
        /**
         * The index view for this resource where all of the resources can be seen. By default, the ngFormioHelper will set this
         * to a view of the data grid. 
         */
        index: '',
        
        /**
         * This is the create view. This typically will contain the <formio> directive to allow you to create a new Resource.
         */
        create: '',
        
        /**
         * The abstract view is the view that wraps the "view", "edit", and "delete" views and typically provides the tabs where you
         * can navigate between those views. 
         */
        abstract: '',
        
        /**
         * The view is the view page for the resource.
         */
        view: '',
        
        /**
         * This is the edit view. This will have the <formio> directive with the submission provided into the directive.
         */
        edit: '',
        
        /**
         * This is the delete view, which is really just a confirmation page asking if you would like to delete the Resource.
         */
        delete: ''
      },

      /**
       * Provide customer parameters to each of the operations for this resource. This allows you to pass in custom objects into 
       * each state. For example, lets say you wish to pass in the whole object of "customer" into an Order resource, you could provide
       * the following to the view params.
       *    
       *   params: {
       *     view: {customer: null}
       *   }
       * 
       * This would then allow you to call that state by passing in the whole object.
       * 
       *   $state.go('order.view', {customer: customer});
       */
      params: {
        index: {},
        create: {},
        abstract: {},
        view: {},
        edit: {},
        delete: {}
      },

      /**
       * Provide custom controllers for each operation on a resource.
       */
      controllers: {
        index: ['$scope', function($scope) {
          // You can register when an item in the index has been clicked by doing the following.
          $scope.$on('rowView', function(event, resource) {
            console.log(resource);
          });
        }],
        abstract: null,
        view: ['$scope', function($scope) {
          // To register when the form is loaded, you can use the following.
          $scope.currentResource.loadFormPromise.then(function(form) {
            console.log(form);
          });
          
          // To register when a resource is loaded, you can use the following.
          $scope.currentResource.loadSubmissionPromise.then(function(resource) {
            console.log(resource);
          });
        }],
        create: ['$scope', function($scope) {
          $scope.$on('formSubmission', function(err, submission) {
            // A submission has been made... Do something...
            console.log(submission);
          });
          
          // You can decide to tell the Formio Helper to allow this controller do the 
          // submission handling by passing the following back to the helper.
          // return {handle: true};
        }],
        edit: ['$scope', function($scope) {
          $scope.$on('formSubmission', function(err, submission) {
            // A submission was updated... Do something...
            console.log(submission);
          });
        }],
        delete: ['$scope', '$stateParams', function($scope, $stateParams) {
          $scope.$on('delete', function(err) {
            // A submission was deleted.
            console.log('Submission Deleted');
          });
        }]
      }
    };
  });
