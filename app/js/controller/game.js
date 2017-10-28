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

        $scope.phaser = null;

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

            window.setTimeout(function () {
                $scope.initPhaser();

                $scope.openSocket();
            }, 2000);
        };

        $scope.initPhaser = function () {
            function WriggleGame () {
            }

            WriggleGame.prototype.preload = function () {
            }

            WriggleGame.prototype.create = function () {
                bmd = game.add.bitmapData(1280, 300);
                var color = 'white';

                bmd.ctx.beginPath();
                bmd.ctx.lineWidth = "4";
                bmd.ctx.strokeStyle = color;
                bmd.ctx.stroke();
                sprite = game.add.sprite(0, 0, bmd);
            }

            WriggleGame.prototype.drawLine = function () {
                bmd.clear();
                bmd.ctx.beginPath();
                bmd.ctx.beginPath();
                bmd.ctx.moveTo(10, 10);
                bmd.ctx.lineTo(game.input.x, game.input.y);
                bmd.ctx.lineWidth = 4;
                bmd.ctx.stroke();
                bmd.ctx.closePath();
                bmd.render();
                bmd.refreshBuffer();
            };

            WriggleGame.prototype.update = function () {
                this.drawLine();
            };

            game = new Phaser.Game(1280, 786, Phaser.AUTO, 'game-container');
            // add the game state to the state manager
            game.state.add('wriggle', WriggleGame);
            // and start the game
            game.state.start('wriggle');
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