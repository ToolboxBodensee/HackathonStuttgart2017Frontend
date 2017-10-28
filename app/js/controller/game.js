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
                preload: $scope.phaserPreload,
                create:  $scope.phaserCreate,
                update:  $scope.phaserTick
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
         * ### Game                                                                                                      ###
         * #################################################################################################################
         */

        $scope.gameStop = function () {
            $scope.socket.instance.emit(events.stopGame);

            for (const playerListPlayerId in $scope.game.playerList) {
                // @formatter:off
                const currentPlayer  = $scope.game.playerList[playerListPlayerId];
                currentPlayer.points = [];
                // @formatter:on
            }
        }

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
                $scope.gameStop();
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
            bmd = $scope.phaser.instance.add.bitmapData(screenSize.width, screenSize.height);
            var color = 'white';

            bmd.ctx.beginPath();
            bmd.ctx.lineWidth = "2";
            bmd.ctx.strokeStyle = color;
            bmd.ctx.stroke();
            sprite = $scope.phaser.instance.add.sprite(0, 0, bmd);
        };

        $scope.phaserDrawPlayers = function () {
            // $log.log('GameController: phaserDrawPlayers');
            bmd.clear();

            for (const playerListPlayerId in $scope.game.playerList) {
                // @formatter:off
                const currentPlayer = $scope.game.playerList[playerListPlayerId];
                var lastPosition    = null;
                // @formatter:on

                bmd.ctx.beginPath();
                {
                    // @formatter:off
                    bmd.ctx.strokeStyle = currentPlayer.color;
                    bmd.ctx.lineWidth   = 2;
                    // @formatter:on

                    for (const i in currentPlayer.points) {
                        const currentPoint = currentPlayer.points[i];

                        if (lastPosition) {
                            bmd.ctx.moveTo(currentPoint.x, currentPoint.y);
                            bmd.ctx.lineTo(lastPosition.x, lastPosition.y);
                            bmd.ctx.stroke();
                        }

                        lastPosition = currentPoint;
                    }
                }
                bmd.ctx.closePath();

            }

            bmd.render();
        };

        $scope.phaserPreload = function () {

        };

        $scope.phaserTick = function () {
            // $log.log('GameController: phaserTick', data);

            $scope.phaserCheckForInitialization();

            $scope.phaserDrawPlayers();
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
            // $log.log('GameController: socketTick', data);

            if (data.diffs) {
                for (const diffPlayerId in data.diffs) {

                    for (const playerListPlayerId in $scope.game.playerList) {
                        if (playerListPlayerId === diffPlayerId) {
                            // @formatter:off
                            const currentDifference = data.diffs[diffPlayerId];
                            const currentPlayer     = $scope.game.playerList[playerListPlayerId];
                            // @formatter:on

                            currentPlayer.points.push(currentDifference.position);
                        }
                    }
                }
            }

            // TODO: delta
        };

        /**
         * #################################################################################################################
         * ### After initialization                                                                                      ###
         * #################################################################################################################
         */

        $scope.init()
    }
);