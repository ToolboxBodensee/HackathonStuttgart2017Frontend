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

const playerSpeed = 40;

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
            delta:    0,
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
        };

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
                const currentPlayer = $scope.game.playerList[playerListPlayerId];

                if (!currentPlayer.dead) {
                    var lastPosition = null;

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

                        if (currentPlayer.fakePosition) {
                            bmd.ctx.moveTo(currentPlayer.fakePosition.x, currentPlayer.fakePosition.y);
                            bmd.ctx.lineTo(lastPosition.x, lastPosition.y);
                            bmd.ctx.stroke();
                        }
                    }
                    bmd.ctx.closePath();
                }
            }

            bmd.render();
        };

        $scope.phaserFakeNextPosition = function () {
            for (const playerListPlayerId in $scope.game.playerList) {
                const currentPlayer = $scope.game.playerList[playerListPlayerId];

                if (currentPlayer.fakePosition) {
                    // @formatter:off
                    const fakePosition   = currentPlayer.fakePosition;
                    const deltaVector    = $scope.vectorFromAngle(currentPlayer.direction);
                          fakePosition.x = fakePosition.x + (playerSpeed * deltaVector.x * $scope.phaser.delta);
                          fakePosition.y = fakePosition.y + (playerSpeed * deltaVector.y * $scope.phaser.delta);
                    // @formatter:on
                }
            }
        };

        $scope.phaserPreload = function () {

        };

        $scope.phaserTick = function () {
            // $log.log('GameController: phaserTick', $scope.phaser.instance.time.elapsed);

            $scope.phaser.delta = $scope.phaser.instance.time.elapsed / 1000;

            $scope.phaserCheckForInitialization();
            $scope.phaserFakeNextPosition();
            $scope.phaserDrawPlayers();
        };

        $scope.vectorFromAngle = function (rad) {
            return {
                x: Math.cos(rad),
                y: Math.sin(rad)
            }
        };

        /**
         * #################################################################################################################
         * ### Socket                                                                                                    ###
         * #################################################################################################################
         */

        $scope.socketCollision = function (data) {
            $log.log('GameController: socketCollision', data);

            // TODO
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

            // TODO
        };

        $scope.socketPlayerLeft = function (data) {
            $log.log('GameController: socketPlayerLeft', data);

            // TODO
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
                            const currentDifference    = data.diffs[diffPlayerId];
                            const currentPlayer        = $scope.game.playerList[playerListPlayerId];
                            currentPlayer.fakePosition = currentDifference.position;
                            const pointCount           = currentPlayer.points.length;
                            // @formatter:on

                            if (currentPlayer.direction !== currentDifference.direction || pointCount < 2) {
                                currentPlayer.direction = currentDifference.direction;

                                currentPlayer.points.push(currentDifference.position);
                            } else {
                                currentPlayer.points[pointCount - 1] = currentDifference.position;
                            }
                        }
                    }
                }
            }
        };

        /**
         * #################################################################################################################
         * ### After initialization                                                                                      ###
         * #################################################################################################################
         */

        $scope.init()
    }
);