(function() {
    
    var app = angular.module('main');
    
    app.controller('PlayController', [ '$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {

    	$scope.storyId = $routeParams.id;

	    $scope.init = function($scope) {
		    console.log('play controller init', $scope);
		    $scope.loadVideo(); 
	    }

   		$scope.loadVideo = function() {
		    $http.get("/api/story/" + $scope.storyId )
		    .then(function(result){
			    console.log("story loaded: ", result, result.data );

			    $scope.story = JSON.parse(result.data[0].data);
			    $scope.story.email = result.data[0].email;
			    $scope.story.id = result.data[0].id;
			    console.log("story loaded from server: ", $scope.story );
		    },
		    function(result){
			    console.log("error reading story: ", result);
		    });
		}

		$scope.currentQuestion = null;
		$scope.lastQuestion = null;

	    $scope.monitorVideoPosition = function(){

			var playerCurrentTimeInspector = function() {
				if( $scope.playerReady ){
					var currentTime = Math.floor($scope.storyPlayer.getCurrentTime());
					var formatted = numeral(currentTime).format('00:00:00');
					$scope.currentTime = formatted;

					// look for the question for the current second
					var found = false;
					for(var i = 0; i < $scope.story.questions.length; i++) {

						if( $scope.story.questions[i].secondsInt == currentTime ){

							var sameQuestion = false;
							if( $scope.lastQuestion ){
								if( $scope.lastQuestion.id == $scope.story.questions[i].id ){
									sameQuestion = true;
								}
							}

							// skip the last question as we can be checking the same second
							if( !sameQuestion ){
				    			console.log('question found AT', formatted);

			            	    $scope.storyPlayer.pauseVideo();
								$scope.currentQuestion = $scope.story.questions[i];
				    			console.log('$scope.currentQuestion', $scope.currentQuestion );
								found = true;
								break;
							}
						}
					}

					// TODO: is this needed ?
					if( ! found ){
						$scope.currentQuestion = null;
					}
				}

				// schedule the next call
		        $timeout(playerCurrentTimeInspector, 
		        	$scope.playerCurrentTimeInspectorInterval);
		    }

		    // the first call
		    $timeout(playerCurrentTimeInspector, 
		    	$scope.playerCurrentTimeInspectorInterval);
	    }


	    $scope.answer = function(question_id, answer_id){
            console.log('START answer', question_id, answer_id);
			$scope.saveAnswer(question_id, answer_id);

            $scope.lastQuestion = $scope.currentQuestion;
            $scope.currentQuestion = null;
            $scope.storyPlayer.playVideo();
        }


		$scope.saveAnswer = function(question_id, option_id) {
			var parameter = {
				'story_id': $scope.storyId,
				'question_id': question_id,
				'option_id': option_id 
			};

		    $http.post("/api/story/save", parameter )
		    .then(function(result){
			    console.log("answer saved: ", result.data );
		    },
		    function(result){
			    console.log("error saving answer: ", result);
		    });
		}

		$scope.playerReady = false;
	    $scope.$on('youtube.player.ready', function ($event, player) {
    		console.log('player is ready');	
    		$scope.playerReady = true;
    		player.playVideo();

    		// pause after 1 second
		    $timeout(function(){ player.pauseVideo(); }, 1000);
  		});

    }]);
})();
