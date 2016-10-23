(function() {
    
    var app = angular.module('main', [ 'ngRoute', 'youtube-embed', 'angularInlineEdit', 'duScroll', 'ui.bootstrap']);
    
    app.config(function($routeProvider) {
		$routeProvider.when('/', {
		    templateUrl : 'pages/main.html',
		    controller : 'MainController'
		}).when('/editor', {
		    templateUrl : 'pages/editor.html',
		    controller : 'EditorController'
		}).when('/sandbox', {
		    templateUrl : 'pages/sandbox.html',
		    controller : 'SandboxController'
		}).when('/play/:id', {
		    templateUrl : 'pages/play.html',
		    controller : 'PlayController'
		}).otherwise({
		    redirectTo : '/'
		});
    });

	app.filter('minutes', function($filter) {
    return function(seconds) {
        return $filter('date')(new Date(0, 0, 0).setSeconds(seconds), 'HH:mm:ss');
    };


})

})();