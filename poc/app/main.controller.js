(function() {
    
    var app = angular.module('main');
    
    app.controller('MainController',[ '$scope', function($scope) {

    	$scope.user = {
    		name: "Hamilton",
    		email: "hamilton.lima@gmail.com"
    	};

    }]);

})();
