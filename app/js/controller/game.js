var game, bmd, sprite, lineGraphics, DemoState, colors;

const events = {
    displayCreated: 'displayCreated'
};

const backendPath = (
    //'wriggle-backend.herokuapp.com'
    '10.200.19.196:3000'
);

const screenSize = {
    height: 786,
    width:  1280
};

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

        $scope.game = {
            myId: null
        };

        $scope.phaser = {
            instance: null
        };

        $scope.socket = {
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

        $scope.init = function () {
            $log.log('GameController: init');

            $scope.initPhaser();
            $scope.initSocket();
        };

        $scope.initPhaser = function () {
            const WriggleGame = {
                preload:  $scope.phaserPreload,
                create:   $scope.phaserCreate,
                drawLine: $scope.test,
                update:   $scope.phaserTick
            };

            $scope.phaser.instance = new Phaser.Game(
                screenSize.width,
                screenSize.height,
                Phaser.AUTO,
                'game-container'
            );

            $scope.phaser.instance.state.add('wriggle', WriggleGame);
            $scope.phaser.instance.state.start('wriggle');
        };

        $scope.initSocket = function () {
            $scope.socket.instance = io(backendPath);
            var myId = null;

            $scope.socket.instance.on('connect', $scope.socketConnected);

            $scope.socket.instance.on('joined', function (data) {
                if (myId === data.id) {
                    console.log('i joined. my postion', data.position);
                    return;
                }
                console.log('someone joined', data);
            });
            $scope.socket.instance.on('left', function () {
                console.log('someone left');
            });
            $scope.socket.instance.on('tick', function () {
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
         * ### Socket                                                                                                    ###
         * #################################################################################################################
         */

        $scope.socketConnected = function () {
            $scope.game.myId = $scope.socket.instance.id;

            $log.log('GameController: socketConnected', $scope.game.myId);

            $scope.socket.instance.emit(events.displayCreated);

            $scope.$apply(function () {
                $scope.status.socketInitialized = true;
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