(function() {
    
    var app = angular.module('main');
    
    app.controller('PlayController', [ '$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {

    	$scope.videoId = $routeParams.id;

	    $scope.init = function($scope) {
		    console.log('play controller init');
	    };
	
    }]);
})();
