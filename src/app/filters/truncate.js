angular.module('formioAppBasic').filter('truncate', [function() {
  return function(input, opts) {
    if(_.isNumber(opts)) {
      opts = {length: opts};
    }
    return _.truncate(input, opts);
  };
}]);
