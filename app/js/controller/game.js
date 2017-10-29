var game, bmd, sprite, lineGraphics, DemoState, colors;

const events = {
    collision: 'collision',
    connect: 'connect',
    displayCreated: 'displayCreated',
    joined: 'joined',
    left: 'left',
    playerList: 'playerList',
    startGame: 'startGame',
    stopGame: 'stopGame',
    tick: 'tick'
};

const backendPath = (
    'wriggle-backend.herokuapp.com'
    //'10.200.19.196:3000'
);

const playerSpeed = 66;
const pointLimit = 22;

const screenSize = {
    height: 768,
    width: 1280
};

angular.module('wriggle').controller(
    'GameController', function ($log
        , $controller
        , $rootScope
        , $scope
        , $state) {
        /**
         * #################################################################################################################
         * ### Inheritance                                                                                               ###
         * #################################################################################################################
         */

        $controller('BaseController', {$scope: $scope});

        /**
         * #################################################################################################################
         * ### Properties                                                                                                ###
         * #################################################################################################################
         */

        $scope.game = {
            myId: null,
            playerList: null
        };

        $scope.phaser = {
            delta: 0,
            instance: null
        };

        $scope.socket = {
            instance: null
        };

        $scope.status = {
            index: 0,
            intro: false,
            presentation: true,
            presentationTime: 3 * 60,
            numberOfSlides: $('.slide').length,
            timer: moment(this.presentationTime * 1000).format('mm:ss'),
            gameInitialized: false,
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
            if ($scope.status.presentationTime > -1) {
                $scope.presentation.timerStarted = true;
                $scope.$apply(function () {
                    $scope.status.presentationTime--;
                    $scope.status.timer = moment($scope.status.presentationTime * 1000).format('mm:ss');
                });
                setTimeout($scope.startTimer, 1000);
            }
        };

        $scope.presentation = {
            indicator: $scope.status.index.toString() + ' / ' + $scope.status.numberOfSlides.toString(),
            timerStarted: false
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
                create: $scope.phaserCreate,
                update: $scope.phaserTick
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

            $scope.socket.instance = io(backendPath, {query: 'type=display'});

            // @formatter:off
            $scope.socket.instance.on(events.collision, $scope.socketCollision);
            $scope.socket.instance.on(events.connect, $scope.socketConnected);
            $scope.socket.instance.on(events.joined, $scope.socketJoined);
            $scope.socket.instance.on(events.left, $scope.socketPlayerLeft);
            $scope.socket.instance.on(events.playerList, $scope.socketPlayerList);
            $scope.socket.instance.on(events.tick, $scope.socketTick);
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
                    const currentPlayer = $scope.game.playerList[playerListPlayerId];
                    currentPlayer.dead = false;
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

        $scope.keyDown = function keyDownTextField(event) {
            const keyCode = event.keyCode;

            $log.log('GameController: keyDown', keyCode);

            if (keyCode === 69) {
                // E
                $scope.gameStop();
            } else if (keyCode === 83) {
                // S
                setTimeout(function () {
                    $('#countdown h1').hide();
                    $scope.socket.instance.emit(events.startGame);
                }, 3000);
                $('#countdown h1').hide();
                $('#countdown #three').show();
                setTimeout(function () {
                    $('#countdown h1').hide();
                    $('#countdown #two').show();
                    setTimeout(function () {
                        $('#countdown h1').hide();
                        $('#countdown #one').show();
                    }, 1000)
                }, 1000)
            } else if (keyCode === 71) {
                // G

                $('#introSound')[0].play();
                setTimeout(function () {
                    $scope.$apply(function () {
                        $scope.status.intro = false;
                        $scope.status.presentation = false;
                    });
                }, 4000)
            } else if (keyCode === 84) {
                // T
                if (!$scope.presentation.timerStarted) {
                    $scope.startTimer();
                }

            } else if (keyCode === 80) {
                // P
                $scope.$apply(function () {
                    $scope.status.intro = false;
                    $scope.status.index = 1;
                    $scope.presentation.indicator = $scope.status.index.toString()
                        + ' / '
                        + $scope.status.numberOfSlides.toString();
                })
            } else if (keyCode === 37 || keyCode === 33) {
                // Left
                if ($scope.status.index > 1) {
                    $scope.$apply(function () {
                        $scope.status.index--
                        $scope.presentation.indicator = $scope.status.index.toString()
                            + ' / '
                            + $scope.status.numberOfSlides.toString();
                    })
                }
            } else if (keyCode === 39 || keyCode === 32 || keyCode === 34) {
                // Right
                if ($scope.status.index <= $scope.status.numberOfSlides - 1) {
                    $scope.$apply(function () {
                        $scope.status.index++
                        $scope.presentation.indicator = $scope.status.index.toString()
                            + ' / '
                            + $scope.status.numberOfSlides.toString();
                    });
                } else {
                    $scope.$apply(function () {
                        $scope.status.intro = true;
                        $scope.status.presentation = false;

                        $('#introSound')[0].play();
                        setTimeout(function () {
                            $scope.$apply(function () {
                                $scope.status.intro = false;
                                $scope.status.presentation = false;
                            });
                        }, 4000)
                    })
                }
            }
        };

        /**
         * #################################################################################################################
         * ### Phaser                                                                                                    ###
         * #################################################################################################################
         */

        $scope.phaserAddPointForPlayer = function (player, fromX, fromY, toX, toY, fake) {
            bmd.ctx.moveTo(fromX, fromY);
            bmd.ctx.lineTo(toX, toY);
            bmd.ctx.stroke();

            if (!fake) {
                bmd.circle(toX, toY, 2, player.color);
                bmd.ctx.fill();
            }
        };

        $scope.phaserCheckForInitialization = function () {
            if (!$scope.status.gameInitialized) {
                $scope.$apply(function () {
                    $scope.status.gameInitialized = true;
                });
            }
        };

        $scope.phaserCreate = function () {
            $scope.phaser.instance.stage.backgroundColor = '#003559';

            bmd = $scope.phaser.instance.add.bitmapData(screenSize.width, screenSize.height);

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
                        bmd.ctx.lineWidth = 8;
                        // @formatter:on

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
                                lastPosition.x, lastPosition.y,
                                true
                                // @formatter:on
                            );
                        }
                    }
                    bmd.ctx.closePath();
                }
            }
        };

        $scope.phaserFakeNextPosition = function () {
            for (const playerListPlayerId in $scope.game.playerList) {
                const currentPlayer = $scope.game.playerList[playerListPlayerId];

                if (currentPlayer.fakePosition) {
                    // @formatter:off
                    const fakePosition = currentPlayer.fakePosition;
                    const deltaVector = $scope.vectorFromAngle(currentPlayer.direction);
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
                            const currentDifference = data.diffs[diffPlayerId];
                            const currentPlayer = $scope.game.playerList[playerListPlayerId];
                            currentPlayer.fakePosition = currentDifference.position;
                            const pointCount = currentPlayer.points.length;
                            // @formatter:on

                            currentPlayer.direction = currentDifference.direction;

                            if (!currentPlayer.points) {
                                currentPlayer.points = [];
                            }

                            currentPlayer.points.push(currentDifference.position);

                            if (currentPlayer.points.length > pointLimit) {
                                currentPlayer.points.splice(0, 1);
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