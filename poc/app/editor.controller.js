(function() {
    
    var app = angular.module('main');
    
    app.controller('EditorController', [ '$scope', '$http', '$timeout','$document', function($scope, $http, $timeout, $document) {

	    // scroll definitions
		$scope.scroll = { offset: 200, duration: 1000 };

    	$scope.scrollToQuestion = function($event,questionId) {
    		$event.stopPropagation();
    		console.log('scrollToQuestion', questionId);
			var target = angular.element(document.getElementById(questionId));
    		$document.scrollToElementAnimated(target, $scope.scroll.offset, $scope.scroll.duration);
    	}


	    // TODO: remove this default videoid
	    $scope.story = { 
	    	'title': 'Untitled story', 
	    	'videoId': '7TXEZ4tP06c', 
	   		'questions': []
	   	};

	   	// update callbacks 
	    $scope.updateStoryTitle = function(newValue){
	    	console.log('updateStoryTitle', newValue);
	    }

	    // youtubeEmbedUtils not available ... :0
	    // $scope.story.videoId = youtubeEmbedUtils.getIdFromURL(newValue);
	    $scope.updateVideoId = function(newValue){
	    	console.log('updateVideoId', newValue );
	    }

	    $scope.updateQuestionTitle = function(id, newValue){
	    	console.log('updateQuestionTitle', id, newValue);
	    }

	    $scope.updateOptionText = function(questionId, optionId, newValue){
	    	console.log('updateOptionText', questionId, optionId, newValue);
	    }

	    // remove elements 
		$scope.removeQuestion = function(id){
	    	console.log('removeQuestion', id );

			for(var i = 0; i < $scope.story.questions.length; i++) {
				if( $scope.story.questions[i].id == id ){
			    	console.log('removeQuestion FOUND');
					$scope.story.questions.splice(i, 1);
					break;
				}
			}
		}

		$scope.removeOption = function(questionId, optionId){
	    	console.log('removeOption', questionId, optionId );

			for(var i = 0; i < $scope.story.questions.length; i++) {
				if( $scope.story.questions[i].id == questionId ){
			    	console.log('question FOUND');
			    	for(var n = 0; n < $scope.story.questions[i].options.length; n++) {
			    		if( $scope.story.questions[i].options[n].id == optionId ){
					    	console.log('option FOUND');
							$scope.story.questions[i].options.splice(n, 1);
							return;
			    		}
			    	}
				}
			}

		}

		// the video player updates this object when its ready
        $scope.storyPlayer = null;
        $scope.playerCurrentTimeInspectorInterval = 500;

	    $scope.init = function() {
		    console.log('edit controller init', $scope.user);
		  	$scope.monitorVideoPosition();
	    };


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


	    $scope.answer = function(answerPosition){
            console.log('START answer', answerPosition );

        	// zerobased index
        	var number = answerPosition +1;
            $scope.currentOption = "Option " + number + " was chosen";
            console.log('END answer', $scope.currentOption );
            $scope.lastQuestion = $scope.currentQuestion;
            $scope.currentQuestion = null;
            $scope.storyPlayer.playVideo();
        }

		$scope.playerReady = false;
	    $scope.$on('youtube.player.ready', function ($event, player) {
    		console.log('player is ready');	
    		$scope.playerReady = true;
  		});

  		$scope.defaultNumberOptions = 6;

	    $scope.lastID = 1;
	    $scope.newId = function(){
	    	return $scope.lastID ++;
	    }

	    // builders
	    // TODO: check if can remove seconds without loosing precision
		$scope.buildEmptyQuestion = function(seconds, percent){
			return { 'id': $scope.newId(), 
				'seconds': seconds,
				'percent': percent,
				'secondsInt': Math.floor(seconds),
				'title'  : 'Untitled question',
				'options': $scope.buildEmptyOptions()
			};
		}

		$scope.buildEmptyOptions = function(percent){
			var result = [];
			for (var i = 0; i < $scope.defaultNumberOptions; i++) {
				var pos = i+1;
				result.push({ 
					'id': $scope.newId(), 
					'text'  : 'Option ' + pos
				});
			}
			return result;
		}

   		$scope.addNewQuestion = function(percent){
   			if( $scope.playerReady ){

				var seconds = $scope.storyPlayer.getDuration() * percent;

				console.log('addNewQuestion', seconds );
				var question = $scope.buildEmptyQuestion(seconds, percent * 100);
				console.log('addNewQuestion', question );
				$scope.story.questions.push( question );
   			}
   		}

   		// timeline functions 
		$scope.barStyle = function(percent){
  			return {'left': percent + '%' };
		}

  		$scope.PickTime = function($event){
    		console.log('PickTime', $event.offsetX, $event.target.clientWidth );	
    		var percent = $event.offsetX / $event.target.clientWidth;
    		$scope.addNewQuestion(percent);
  		}

    }]);
})();
