(function() {
    
    var app = angular.module('main');
    
    // use as : draggable-timeline
    app.directive('draggableTimeline', [ function() {
    	return {
       		restrict : 'EAC',
           	link: function (scope, element, attribute) {
				console.log('------------ draggable-timeline', element, attribute );

				// TODO: support more than one 
				scope.timelineWidth = element.context.offsetWidth;
				scope.timelineHeight = element.context.offsetHeight;

				scope.timelineId = attribute.id
				scope.stage = new createjs.Stage(attribute.id);

				console.log('draggableTimeline', scope.timelineWidth, scope.timelineId);

				// receive the event with the updated data after the creation of the object
				scope.$watch('story', function(story, oldStory) {
					console.log('story.questions', story.questions);
					console.log('story.questions.length', story.questions.length);

					// empty the stage 
					scope.stage.removeAllChildren();

					// background
					var background = new createjs.Shape();
		 			background.graphics.beginFill("white").drawRect(0, 0, scope.timelineWidth, scope.timelineHeight);
		 			background.x = 0;
		 			background.y = 0;
					scope.stage.addChild(background);

					background.on("pressup", function(evt) { 
						console.log("background", evt.stageX, scope.timelineWidth ); 
						scope.PickTime(evt.stageX, scope.timelineWidth);
					});

					if( story.questions.length == 0 ){
						console.log('add text instructions');
						var text = new createjs.Text("Click here to add a new question", "18px Arial", "black");

						var b = text.getBounds();
						console.log('bounds', b, scope.timelineWidth);
						text.x = (scope.timelineWidth - b.width)/2; 
						text.y = (scope.timelineHeight - b.height)/2;

						scope.stage.addChild(text);
					}


					// questions
					for (var i = 0; i < story.questions.length; i++) {
	
						var x = scope.timelineWidth * (story.questions[i].percent / 100.0);
						console.log('x', x , story.questions[i].id);

						// TODO: get the correct height
						var shape = new createjs.Shape();
		 				shape.graphics.beginFill("#337ab7").drawRect(0, 0, 6, 50);
		 				shape.name = story.questions[i].id;
		 				shape.x = x;
		 				shape.y = 0;

						scope.stage.addChild(shape);

						shape.on("pressmove", function(evt) {
							console.log('move', evt.stageX, evt.target. name );
						    evt.target.x = evt.stageX;
						    scope.stage.update();
						});

						shape.on("pressup", function(evt) { 
							console.log("up", evt.target.name ); 
							scope.UpdateTime(evt.target.name, evt.stageX, scope.timelineWidth);
						});
					}

					scope.stage.update();

				}, true);

           }
       };
   }]);

})();