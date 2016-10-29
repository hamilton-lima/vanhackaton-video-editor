(function() {

    var app = angular.module('main');

    app.controller('PlayController', ['$scope', '$http', '$routeParams', '$timeout', '$window',
        function($scope, $http, $routeParams, $timeout, $window) {

            $scope.storyId = $routeParams.id;

            $scope.init = function() {
                console.log('play controller init', $scope);
                $scope.loadVideo();
                $scope.monitorVideoPosition();
            }

            $scope.loadVideo = function() {
                $http.get("/api/story/" + $scope.storyId)
                    .then(function(result) {
                            console.log("story loaded: ", result, result.data);

                            $scope.story = JSON.parse(result.data[0].data);
                            $scope.story.email = result.data[0].email;
                            $scope.story.id = result.data[0].id;
                            console.log("story loaded from server: ", $scope.story);
                        },
                        function(result) {
                            console.log("error reading story: ", result);
                        });
            }

            // here
            $scope.currentQuestion = null;
            $scope.lastSecondChecked = -1;

            $scope.monitorVideoPosition = function() {

                var playerCurrentTimeInspector = function() {

                    if ($scope.playerReady) {
                        var currentTime = Math.floor($scope.storyPlayer.getCurrentTime());
                        var formatted = numeral(currentTime).format('00:00:00');
                        console.log('monitor video position', formatted, $scope.lastSecondChecked);

                        if (formatted != $scope.lastSecondChecked) {
                            console.log('monitor video position SEARCH');

                            $scope.currentTime = formatted;
                            $scope.lastSecondChecked = formatted;

                            // look for the question for the current second
                            $scope.currentQuestion = null;
                            for (var i = 0; i < $scope.story.questions.length; i++) {

                                if ($scope.story.questions[i].secondsInt == currentTime) {
                                    $scope.currentQuestion = $scope.story.questions[i];
                                    $scope.storyPlayer.pauseVideo();
                                    $scope.currentQuestion = $scope.story.questions[i];

                                    console.log('question found AT', formatted);
                                    console.log('$scope.currentQuestion', $scope.currentQuestion);
                                    break;
                                }
                            } // for

                        } // not the same second
                    } // player ready

                    // schedule the next call
                    $timeout(playerCurrentTimeInspector,
                        $scope.playerCurrentTimeInspectorInterval);
                }

                // the first call
                $timeout(playerCurrentTimeInspector,
                    $scope.playerCurrentTimeInspectorInterval);
            }

            $scope.answer = function(question_id, answer_id, url, seekTo) {
                console.log('START answer', question_id, answer_id);
                $scope.saveAnswer(question_id, answer_id);

                if (url) {
                    $window.location.href = url;
                }

                if (seekTo >= 0) {
                    $scope.storyPlayer.seekTo(seekTo);
                }

                $scope.currentQuestion = null;
                $scope.storyPlayer.playVideo();
            }


            $scope.saveAnswer = function(question_id, option_id) {
                var parameter = {
                    'story_id': $scope.storyId,
                    'question_id': question_id,
                    'option_id': option_id
                };

                $http.post("/api/answer/create", parameter)
                    .then(function(result) {
                            console.log("answer saved: ", result.data);
                        },
                        function(result) {
                            console.log("error saving answer: ", result);
                        });
            }

            $scope.playerReady = false;
            $scope.$on('youtube.player.ready', function($event, player) {
                console.log('player is ready');
                $scope.playerReady = true;
                player.playVideo();
            });

        }
    ]);
})();
