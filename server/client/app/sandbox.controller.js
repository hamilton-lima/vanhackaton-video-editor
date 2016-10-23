(function() {
    
    var app = angular.module('main');
    
    app.controller('SandboxController', [ '$scope', '$http', '$timeout', function($scope, $http, $timeout) {

	    $scope.init = function($scope) {
		    console.log('editor controller init');
	    };

        $scope.questionTitle = "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur"; 

        $scope.questions = ["Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur", 
        "voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur",
        "Nemo enim ipsam sed quia consequuntur",
        "Nemo aut odit aut fugit, sed quia consequuntur",
        "Nemo enim ipsam voluptatem quia voluptas sit aspernatur ",
        "Odit aut fugit, sed quia consequuntur"];

        $scope.showQuestions = false;
        $scope.videoId = '7TXEZ4tP06c';
        $scope.currentOption = 'No response';
		$scope.currentTime = 'Player is not ready';

		// the player updates this object when its ready
        $scope.storyPlayer = null;
        $scope.playerCurrentTimeInspectorInterval = 1000;

	    $scope.init = function() {
		    console.log('main controller init', $scope.user);


		  	var playerCurrentTimeInspector = function() {

	            if( $scope.storyPlayer ){
					var currentTime = Math.floor($scope.storyPlayer.getCurrentTime())
					var formatted = numeral(currentTime).format('00:00:00');
					$scope.currentTime = formatted;
				} 

		        $timeout(playerCurrentTimeInspector, 
		        	$scope.playerCurrentTimeInspectorInterval);
		    }

		    $timeout(playerCurrentTimeInspector, 
		    	$scope.playerCurrentTimeInspectorInterval);

	    };

	    $scope.$on('youtube.player.ready', function ($event, player) {
    		console.log('player is ready');	
  		});

  		$scope.formatBarStyle = function(percent){
  			return {'width': percent + '%' };
  		}

		$scope.barStyle = $scope.formatBarStyle(0);
		$scope.barWidth = 0;

  		$scope.updateBarWidth = function(current, width){
    		console.log('updateBarWidth', current, width );	
    		var percent = (current / width) * 100;
			$scope.barWidth = percent;
			$scope.barStyle = $scope.formatBarStyle($scope.barWidth);
    		console.log('updateBarWidth', $scope.barStyle );	
  		}

  		$scope.PickATime = function($event){
    		console.log('PickATime', $event.offsetX, $event.target.clientWidth );	
    		$scope.updateBarWidth( $event.offsetX, $event.target.clientWidth );
  		}

  		$scope.PickATimeBar = function($event){
  			$event.stopPropagation();
    		console.log('PickATimeBar', $event.offsetX, $event.target.parentElement.clientWidth );	
    		$scope.updateBarWidth( $event.offsetX, $event.target.parentElement.clientWidth );
  		}

        // toogle questions show/hide
        $scope.toogleVideo = function(){
            console.log('toogle video', $scope.storyPlayer);

            // TODO: add animation
            $scope.showQuestions = !$scope.showQuestions; 

            if( $scope.showQuestions ){
            	if( $scope.storyPlayer ){
            	    $scope.storyPlayer.pauseVideo();
            	}
            } else {
	           	if( $scope.storyPlayer ){
    	            $scope.storyPlayer.playVideo();
    	        }
            }
            console.log('toogleVideo');
        }

        $scope.jump120 = function(){
            console.log('jump to 120 secs', $scope.storyPlayer);

            if( $scope.storyPlayer ){
                $scope.storyPlayer.seekTo(120);
                $scope.storyPlayer.playVideo();
            }
        };

        $scope.forward120 = function(){
            console.log('forward to 120 secs', $scope.storyPlayer);

            if( $scope.storyPlayer ){
            	var current = $scope.storyPlayer;
                $scope.storyPlayer.seekTo(current+120);
                $scope.storyPlayer.playVideo();
            }
        };

	    $scope.answer = function(answerPosition){
            console.log('START answer', answerPosition );

        	// zerobased index
        	var number = answerPosition +1;
            $scope.currentOption = "Option " + number + " was chosen";
            console.log('END answer', $scope.currentOption );
        }

    }]);
})();
