var game, bmd, sprite, lineGraphics, DemoState, colors;

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

        $scope.phaser = {
            instance: null
        };

        $scope.status = {
            gameInitialized:   false,
            socketInitialized: false
        };

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

            $scope.initPhaser();

            $scope.openSocket();
        };

        $scope.initPhaser = function () {
            const WriggleGame = {
                preload:  $scope.phaserPreload,
                create:   $scope.phaserCreate,
                drawLine: $scope.test,
                update:   $scope.phaserTick
            };

            $scope.phaser.instance = new Phaser.Game(1280, 786, Phaser.AUTO, 'game-container');
            // add the game state to the state manager
            $scope.phaser.instance.state.add('wriggle', WriggleGame);
            // and start the game
            $scope.phaser.instance.state.start('wriggle');
            console.log('Gs');

            /*
             $scope.phaser = new Phaser.Game(600, 300, Phaser.AUTO, 'phaser-demo');

             console.log('gdsgsdg', $scope.phaser);

             // add the game state to the state manager
             $scope.phaser.state.add('wriggle', WriggleGame);
             // and start the game
             $scope.phaser.state.start('wriggle');*/

        };

        $scope.openSocket = function () {
            var socket = io('wriggle-backend.herokuapp.com');
            var myId = null;
            socket.on('connect', function () {
                myId = socket.id;
                console.log('my id', myId);

                $scope.$apply(function () {
                    $scope.status.socketInitialized = true;
                });
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
         * ### TODO                                                                                                    ###
         * ### TODO                                                                                                    ###
         * ### TODO                                                                                                    ###
         * ### TODO                                                                                                    ###
         * ### TODO                                                                                                    ###
         * ### TODO                                                                                                    ###
         * ### TODO                                                                                                    ###
         * ### TODO                                                                                                    ###
         * ### TODO                                                                                                    ###
         * ### TODO                                                                                                    ###
         * #################################################################################################################
         */

        $scope.test = function () {
            bmd.clear();
            bmd.ctx.beginPath();
            bmd.ctx.beginPath();
            bmd.ctx.moveTo(10, 10);
            bmd.ctx.lineTo($scope.phaser.instance.input.x, $scope.phaser.instance.input.y);
            bmd.ctx.lineWidth = 4;
            bmd.ctx.stroke();
            bmd.ctx.closePath();
            bmd.render();
            //bmd.refreshBuffer();
        };

        /**
         * #################################################################################################################
         * ### TODO                                                                                                    ###
         * ### TODO                                                                                                    ###
         * ### TODO                                                                                                    ###
         * ### TODO                                                                                                    ###
         * ### TODO                                                                                                    ###
         * ### TODO                                                                                                    ###
         * ### TODO                                                                                                    ###
         * ### TODO                                                                                                    ###
         * ### TODO                                                                                                    ###
         * ### TODO                                                                                                    ###
         * #################################################################################################################
         */

        /**
         * #################################################################################################################
         * ### Phaser                                                                                                    ###
         * #################################################################################################################
         */

        $scope.phaserCheckForInitialization = function () {
            if (!$scope.status.gameInitialized) {
                $scope.$apply(function () {
                    $scope.status.gameInitialized = true;
                });
            }
        };

        $scope.phaserCreate = function () {
            bmd = $scope.phaser.instance.add.bitmapData(1280, 300);
            var color = 'white';

            bmd.ctx.beginPath();
            bmd.ctx.lineWidth = "4";
            bmd.ctx.strokeStyle = color;
            bmd.ctx.stroke();
            sprite = $scope.phaser.instance.add.sprite(0, 0, bmd);
        };

        $scope.phaserPreload = function () {

        };

        $scope.phaserTick = function () {
            $scope.phaserCheckForInitialization();

            this.drawLine();
        };

        /**
         * #################################################################################################################
         * ### After initialization                                                                                      ###
         * #################################################################################################################
         */

        $scope.init()
    }
);