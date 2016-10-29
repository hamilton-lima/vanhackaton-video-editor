(function() {
    
    var app = angular.module('main');
    
    app.controller('EditorController', [ '$scope', '$http', '$timeout','$document', '$rootScope', '$routeParams', 
    	function($scope, $http, $timeout, $document, $rootScope, $routeParams) {

	    // scroll definitions
		$scope.scroll = { offset: 200, duration: 1000 };
		$scope.email = $rootScope.email;
		$scope.storyId = $routeParams.id;

    	$scope.scrollToQuestion = function($event,questionId) {
    		$event.stopPropagation();
    		console.log('scrollToQuestion', questionId);
			var target = angular.element(document.getElementById(questionId));
    		$document.scrollToElementAnimated(target, $scope.scroll.offset, $scope.scroll.duration);
    	}

		$scope.saveStory = function() {
		    console.log("save story clicked");
		    
			var parameter = {
				'email': $scope.email,
				'data': $scope.story 
			};

		    $http.post("/api/story/save", parameter )
		    .then(function(result){
			    console.log("story saved: ", result, result.data, result.data.id );
			    $scope.story.id = result.data.id;
		    },
		    function(result){
			    console.log("error saving story: ", result);
		    });
		}

	    $scope.story = { 
	    	'title': 'Untitled story', 
	    	'videoId': null, 
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

	    $scope.updateOptionUrl = function(questionId, optionId, newValue){
	    	console.log('updateOptionUrl', questionId, optionId, newValue);
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
					    	console.log('option FOUND, id=', optionId);
							$scope.story.questions[i].options.splice(n, 1);
							return;
			    		}
			    	}
				}
			}
		}

		$scope.loadVideo = function() {
		    $http.get("/api/story/" + $scope.storyId )
		    .then(function(result){
			    console.log("story loaded from the server: ", result, result.data );

			    $scope.story = JSON.parse(result.data[0].data);
			    $scope.story.email = result.data[0].email;
			    $scope.story.id = result.data[0].id;
			    console.log("story loaded from server (2): ", $scope.story );
		    },
		    function(result){
			    console.log("error reading story: ", result);
		    });
		}

		// the video player updates this object when its ready
        $scope.storyPlayer = null;
        $scope.playerCurrentTimeInspectorInterval = 500;

	    $scope.init = function() {
		    console.log('edit controller init', $scope.email);
		   	$scope.loadVideo();
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
								if( formatted != $scope.lastTimeFoundQuestion ){
					    			console.log('question found AT', formatted);
					    			console.log('$scope.currentQuestion', $scope.currentQuestion );
					    			$scope.lastTimeFoundQuestion = formatted;
								}

			            	    $scope.storyPlayer.pauseVideo();
								$scope.currentQuestion = $scope.story.questions[i];

								if( formatted != $scope.lastTimeFoundQuestion ){
					    			console.log('$scope.currentQuestion', $scope.currentQuestion );
								}

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
    		player.playVideo();

    		// pause after 1 second
		    $timeout(function(){ player.pauseVideo(); }, 1000);
  		});

  		$scope.defaultNumberOptions = 6;

  		$scope.idSeed = 1;
	    $scope.newId = function(){
	    	var d = new Date();
	    	$scope.idSeed ++;
			return d.getTime() + $scope.idSeed;
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
					'text'  : 'Option ' + pos,
					'url'  : null
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

  		$scope.PickTime = function(x, width){
    		console.log('PickTime', x, width );	
    		var percent = x / width;
    		$scope.addNewQuestion(percent);
  		}

		$scope.UpdateTime = function(id, x , width){
    		console.log('UpdateTime', x, width, id );	
    		var percent = x / width;
			var seconds = $scope.storyPlayer.getDuration() * percent;

			for(var i = 0; i < $scope.story.questions.length; i++) {
				if( $scope.story.questions[i].id == id ){
			    	console.log('updateTime FOUND');
					$scope.story.questions[i].seconds = seconds;
					$scope.story.questions[i].percent = percent * 100;
					$scope.story.questions[i].secondsInt = Math.floor(seconds);
					break;
				}
			}
		}

		$scope.validateSeekTo = function(newValue){
			console.log('validate', newValue);
			var seekTo = numeral().unformat(newValue);
			if( seekTo >= 0 ){
				return true;
			} 

			return false;
		}

		$scope.updateSeekTo = function(questionId, optionId, seekToFormatted){
			var seekTo = numeral().unformat(seekToFormatted);
			console.log('updateSeekto', seekToFormatted, seekTo )

			for(var i = 0; i < $scope.story.questions.length; i++) {
				if( $scope.story.questions[i].id == questionId ){
			    	console.log('question updateSeekTo FOUND');
			    	for(var n = 0; n < $scope.story.questions[i].options.length; n++) {
			    		if( $scope.story.questions[i].options[n].id == optionId ){
					    	console.log('option updateSeekTo FOUND');
							$scope.story.questions[i].options[n].seekTo = seekTo;
							$scope.story.questions[i].options[n].seekToFormatted = seekToFormatted;
							return;
			    		}
			    	}
				}
			}
		}
			
		$scope.seekTo = function(questionId, optionId){

			var seekTo = -1;

			for(var i = 0; i < $scope.story.questions.length; i++) {
				if( $scope.story.questions[i].id == questionId ){
			    	console.log('question SeekTo FOUND');
			    	for(var n = 0; n < $scope.story.questions[i].options.length; n++) {
			    		if( $scope.story.questions[i].options[n].id == optionId ){
							seekTo = $scope.story.questions[i].options[n].seekTo;
					    	console.log('option SeekTo FOUND', seekTo);
							break;
			    		}
			    	}
				}

				if( seekTo >= 0 ){
					break;
				}
			}

			if( seekTo >=0 ){
	            $scope.storyPlayer.seekTo(seekTo);
    	        $scope.storyPlayer.playVideo();
			}
		}

    }]);
})();
