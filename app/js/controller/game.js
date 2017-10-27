angular.module('wriggle').controller(
    'GameController', function (
        $log
        , $controller
        , $rootScope
        , $scope
        , $state
    ) {
        /**
         * #################################################################################################################
         * ### Inheritance                                                                                               ###
         * #################################################################################################################
         */

        $controller('BaseController', { $scope: $scope });

        /**
         * #################################################################################################################
         * ### Properties                                                                                                ###
         * #################################################################################################################
         */

        /**
         * #################################################################################################################
         * ### Event listeners                                                                                           ###
         * #################################################################################################################
         */

        /**
         * #################################################################################################################
         * ### Public scope methods                                                                                      ###
         * #################################################################################################################
         */

        /**
         * The controller is initialized.
         */
        $scope.init = function () {
            $log.log('GameController: init');

            $scope.openSocket();
        };

        $scope.openSocket = function () {
            var socket = io('wriggle-backend.herokuapp.com');
            var myId = null;
            socket.on('connect', function () {
                myId = socket.id;
                console.log('my id', myId);
            });
            socket.on('joined', function (data) {
                if (myId === data.id) {
                    console.log('i joined. my postion', data.position);
                    return;
                }
                console.log('someone joined', data);
            });
            socket.on('left', function () {
                console.log('someone left');
            });
            socket.on('tick', function () {
                console.log('tick occured');
            });

        };

        /**
         * #################################################################################################################
         * ### After initialization                                                                                      ###
         * #################################################################################################################
         */

        $scope.init()
    }
);