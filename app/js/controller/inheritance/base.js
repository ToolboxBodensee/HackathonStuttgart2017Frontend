angular.module('wriggle').controller(
    'BaseController', function (
        $log
        , $rootScope
        , $scope
    ) {
        $log.log('BaseController: loaded/inherited');

        /**
         * #################################################################################################################
         * ### Properties                                                                                                ###
         * #################################################################################################################
         */

        /**
         * A list of all callbacks existing to this controller. This is used in "baseDestroy" to remove all attached
         * listeners in a clean way.
         *
         * @type {Array}
         */
        $scope.baseCallbacks = [];

        /**
         * Just an indicator to determine whether the base controller is inherited in sub controllers.
         *
         * @type {boolean}
         */
        $scope.baseInherited = true;

        /**
         * #################################################################################################################
         * ### Event listeners                                                                                           ###
         * #################################################################################################################
         */

        /**
         * This method is used to register event listeners on $rootScope. It is neccessarry to use this method since it
         * handles the proper deregistration of the events.
         *
         * @param event
         * @param callback
         */
        $scope.baseOn = function (event, callback) {
            var removeFunction = $rootScope.$on(event, callback);

            $scope.baseCallbacks.push(removeFunction);
        };

        /**
         * This method is used to register event listeners on $rootScope. It is neccessarry to use this method since it
         * handles the proper deregistration of the events.
         *
         * @param event
         * @param callback
         */
        $scope.baseWatch = function (target, variable, callback) {
            var removeFunction = target.$watch(variable, callback);

            $scope.baseCallbacks.push(removeFunction);
        };

        /**
         * The default destroy function. You have to call $scope.baseDestroy() if you overwrite this.
         */
        if ($scope.$on) {
            $scope.$on(
                '$destroy', function () {
                    $scope.baseDestroy();
                }
            );
        }

        /**
         * #################################################################################################################
         * ### Public scope methods                                                                                      ###
         * #################################################################################################################
         */

        /**
         * This method is called when angular destroy a specific controller. It deregisters all attached events.
         */
        $scope.baseDestroy = function () {
            for (var i in $scope.baseCallbacks) {
                var removeFunction = $scope.baseCallbacks[i];
                removeFunction();
            }
        };
    }
);