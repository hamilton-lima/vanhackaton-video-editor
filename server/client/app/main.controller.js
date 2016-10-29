(function() {
    
    var app = angular.module('main');
    
    app.controller('MainController',[ '$scope', '$rootScope', '$location', '$http', function($scope, $rootScope, $location, $http) {

		$scope.email = $rootScope.email;
		$scope.stories = [];

		$scope.$watch('email', function() {
			$rootScope.email = $scope.email;
			$scope.getStories();
    	});

    	$scope.getStories = function(){
		    $http.get("/api/stories/" + $scope.email )
		    .then(function(result){
			    console.log("stories updated: ", result.data );
				
				$scope.stories = [];
			    for (var i = 0; i < result.data.length; i++) {
			    	var one = JSON.parse(result.data[i].data);
			    	one.email = result.data[i].email;
			    	one.id = result.data[i].id;
			    	$scope.stories.push(one); 
			    }

			    console.log("stories updated (2): ", $scope.stories );

		    },
		    function(result){
			    console.log("error reading story: ", result);
		    });
    	}

    	$scope.newStory = function(){
			var story = {
				'email': $scope.email,
				'data': { 
	    			'title': 'Untitled story', 
	    			'videoId': null, 
	   				'questions': []
	   			}
			};

		    $http.post("/api/story/save", story )
		    .then(function(result){
			    console.log("story saved: ", result.data );
			    $scope.getStories();
		    },
		    function(result){
			    console.log("error saving story: ", result);
		    });
    	}

    	$scope.removeStory = function(id){
			var story = {
				'id': id
			};

		    $http.post('/api/story/remove', story )
		    .then(function(result){
			    console.log("story removed: ", result.data );
			    $scope.getStories();
		    },
		    function(result){
			    console.log("error removing story: ", result);
		    });
    	}

    }]);

})();
