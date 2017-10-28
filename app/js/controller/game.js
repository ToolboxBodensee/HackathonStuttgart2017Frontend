var game, bmd, sprite, lineGraphics, DemoState, colors;

const events = {
    collision:      'collision',
    connect:        'connect',
    displayCreated: 'displayCreated',
    joined:         'joined',
    left:           'left',
    playerList:     'playerList',
    startGame:      'startGame',
    stopGame:       'stopGame',
    tick:           'tick'
};

const backendPath = (
    //'wriggle-backend.herokuapp.com'
    '10.200.19.196:3000'
);

const screenSize = {
    height: 768,
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
            myId:       null,
            playerList: null
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

            $scope.initKeys();
            $scope.initPhaser();
            $scope.initSocket();
        };

        $scope.initKeys = function () {
            document.addEventListener('keydown', $scope.keyDown, false);
        };

        $scope.initPhaser = function () {
            $log.log('GameController: initPhaser');

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
            $log.log('GameController: initSocket');

            $scope.socket.instance = io(backendPath, { query: 'type=display' });

            // @formatter:off
            $scope.socket.instance.on(events.collision,  $scope.socketCollision);
            $scope.socket.instance.on(events.connect,    $scope.socketConnected);
            $scope.socket.instance.on(events.joined,     $scope.socketJoined);
            $scope.socket.instance.on(events.left,       $scope.socketPlayerLeft);
            $scope.socket.instance.on(events.playerList, $scope.socketPlayerList);
            $scope.socket.instance.on(events.tick,       $scope.socketTick);
            // @formatter:on
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
         * ### Keys                                                                                                      ###
         * #################################################################################################################
         */

        $scope.keyDown = function keyDownTextField (event) {
            const keyCode = event.keyCode;

            $log.log('GameController: keyDown', keyCode);

            if (keyCode === 69) {
                // E
                $scope.socket.instance.emit(events.stopGame);
            } else if (keyCode === 83) {
                // S
                $scope.socket.instance.emit(events.startGame);
            }
        };

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

        $scope.socketCollision = function (data) {
            $log.log('GameController: socketCollision', data);

        };

        $scope.socketConnected = function () {
            $scope.game.myId = $scope.socket.instance.id;

            $log.log('GameController: socketConnected', $scope.game.myId);

            $scope.socket.instance.emit(events.displayCreated);

            $scope.$apply(function () {
                $scope.status.socketInitialized = true;
            });
        };

        $scope.socketJoined = function (data) {
            $log.log('GameController: socketJoined', data);

        };

        $scope.socketPlayerLeft = function (data) {
            $log.log('GameController: socketPlayerLeft', data);

        };

        $scope.socketPlayerList = function (data) {
            $log.log('GameController: socketPlayerList', data);

            $scope.$apply(function () {
                $scope.game.playerList = data;
            });
        };

        $scope.socketTick = function (data) {
            $log.log('GameController: socketTick', data);

        };

        /**
         * #################################################################################################################
         * ### After initialization                                                                                      ###
         * #################################################################################################################
         */

        $scope.init()
    }
);