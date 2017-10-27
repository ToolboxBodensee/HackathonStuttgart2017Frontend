angular.module('wriggle').config(
    function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise(
            function ($injector) {
                var $state = $injector.get('$state');
                $state.go('/');
            }
        );

        $urlRouterProvider.when('', '/');

        var map = {
            'game': {
                templateUrl: '/views/game.html'
                , url:       '/'
            }
        };

        for (var key in map) {
            var mappingObject = map[key];

            $stateProvider.state(key, mappingObject);
        }
    }
);