var game, bmd, sprite, lineGraphics, DemoState, colors, pg;

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
    'wriggle-backend.herokuapp.com'
    //'10.200.19.196:3000'
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
            index: 0,
            intro: false,
            presentation: true,
            presentationTime: 5 * 60,
            timer: moment(this.presentationTime * 1000).format('mm:ss'),
            gameInitialized:   false,
            socketInitialized: false
        };

        /**
         * #################################################################################################################
         * ### Event listeners                                                                                           ###
         * #################################################################################################################
         */

        /**
        /**
         * #################################################################################################################
         * ### Presentation                                                                                              ###
         * #################################################################################################################
         */

        $scope.startTimer = function () {
            if($scope.status.presentationTime > -1) {
                $scope.$apply(function () {
                    $scope.status.presentationTime--;
                    $scope.status.timer = moment($scope.status.presentationTime * 1000).format('mm:ss');
                })

                setTimeout($scope.startTimer, 1000);
            }
        };

        /**
         * #################################################################################################################
         * ### Public scope methods                                                                                      ###
         * #################################################################################################################
         */

        $scope.init = function () {

            $log.log('GameController: init');

            $scope.intro();
            $scope.initKeys();
            $scope.initPhaser();
            $scope.initSocket();
        };

        $scope.intro = function () {
            $scope.status.intro = true;
            $('#starSound')[0].play();
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

            $scope.$apply(function () {
                for (const playerListPlayerId in $scope.game.playerList) {
                    // @formatter:off
                    const currentPlayer  = $scope.game.playerList[playerListPlayerId];
                    currentPlayer.dead   = false;
                    currentPlayer.points = [];
                    // @formatter:on
                }
            });
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
            } else if (keyCode === 80) {
                // P

                if($scope.status.index === 0) {
                    $scope.startTimer();
                }
                if($scope.status.index < 3) {
                    $scope.$apply(function () {
                        $scope.status.intro = false;
                        $scope.status.index++;
                    });
                    return;
                }
                $scope.$apply(function() {
                    $scope.status.presentation = false;
                })
            }
        };

        /**
         * #################################################################################################################
         * ### Phaser                                                                                                    ###
         * #################################################################################################################
         */

        $scope.phaserAddPointForPlayer = function (player, fromX, fromY, toX, toY) {

            //pg.lineStyle(8, player.color);
            pg.lineStyle(2, 0xff0000);
            console.log('Gds', player.color);

            pg.moveTo(
                fromX - (
                    screenSize.width / 2
                ),
                fromY - (
                    screenSize.height / 2
                )
            );
            pg.lineTo(
                toX - (
                    screenSize.width / 2
                ),
                toY - (
                    screenSize.height / 2
                )
            );

        };

        $scope.phaserCheckForInitialization = function () {
            if (!$scope.status.gameInitialized) {
                $scope.$apply(function () {
                    $scope.status.gameInitialized = true;
                });
            }
        };

        $scope.phaserCreate = function () {
            pg = $scope.phaser.instance.add.graphics(
                $scope.phaser.instance.world.centerX,
                $scope.phaser.instance.world.centerY
            );

            pg.lineStyle(2, 0xff0000);

        };

        $scope.phaserDrawPlayers = function () {
            // $log.log('GameController: phaserDrawPlayers');

            for (const playerListPlayerId in $scope.game.playerList) {
                const currentPlayer = $scope.game.playerList[playerListPlayerId];

                if (!currentPlayer.dead) {
                    var lastPosition = null;

                    for (const i in currentPlayer.points) {
                        const currentPoint = currentPlayer.points[i];

                        if (lastPosition) {
                            $scope.phaserAddPointForPlayer(
                                // @formatter:off
                                currentPlayer,
                                currentPoint.x, currentPoint.y,
                                lastPosition.x, lastPosition.y
                                // @formatter:on
                            );
                        }

                        lastPosition = currentPoint;
                    }

                    if (currentPlayer.fakePosition && lastPosition && lastPosition.x && lastPosition.y) {
                        $scope.phaserAddPointForPlayer(
                            // @formatter:off
                            currentPlayer,
                            currentPlayer.fakePosition.x, currentPlayer.fakePosition.y,
                            lastPosition.x,               lastPosition.y
                            // @formatter:on
                        );
                    }
                }
            }
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

            $scope.$apply(function () {
                $scope.game.playerList[data.deadPlayer].dead = true;
            });
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

            $scope.$apply(function () {
                $scope.game.playerList[data.id] = data.player;
            });
        };

        $scope.socketPlayerLeft = function (data) {
            $log.log('GameController: socketPlayerLeft', data);

            if (data && data.id && $scope.game.playerList[data.id]) {
                $scope.$apply(function () {
                    delete $scope.game.playerList[data.id];
                });
            }
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
                // $log.log('GameController: socketTick: data.diffs.length', data.diffs);

                for (const diffPlayerId in data.diffs) {
                    for (const playerListPlayerId in $scope.game.playerList) {
                        if (playerListPlayerId === diffPlayerId) {
                            // @formatter:off
                            const currentDifference    = data.diffs[diffPlayerId];
                            const currentPlayer        = $scope.game.playerList[playerListPlayerId];
                            currentPlayer.fakePosition = currentDifference.position;
                            // @formatter:on

                            currentPlayer.direction = currentDifference.direction;

                            if (!currentPlayer.points) {
                                currentPlayer.points = [];
                            }

                            currentPlayer.points.push(currentDifference.position);
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