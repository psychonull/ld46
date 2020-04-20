import Phaser from 'phaser';
import Player from '/prefabs/Player';
import CountDownToStart from '/prefabs/CountDownToStart';
import CustomPipeline from '/prefabs/CustomPipeline';

const playerLabelRegEx = /^player-(\d)$/;
const playerShootLabelRegEx = /^player-shoot-(\d)$/;
// const boundsLabelRegEx = /^Rectangle Body$/;

const ROUND_TIME = 9 * 1000;
let customPipeline;

class World extends Phaser.Scene {
  constructor() {
    super('Game');
    this.started = false;
    this.worldSize = {
      w: 1024,
      h: 768
    };
    this.zoom = 1;
  }

  preload() {
    this.load.image('white', '/images/white.png');
    this.load.image('white_square', '/images/white_square.png');
    if (!customPipeline) {
      customPipeline = this.game.renderer.addPipeline(
        'Custom',
        new CustomPipeline(this.game)
      );
      customPipeline.setFloat1('alpha', 1);
    }
  }

  create() {
    const sz = this.worldSize;

    this.cameras.main
      .setBackgroundColor('#041015')
      .setBounds(0, 0, sz.w, sz.h)
      .setZoom(this.zoom)
      .setName('main');

    this.matter.enableCollisionEventsPlugin();
    this.matter.world.setBounds(0, 0, sz.w, sz.h);
    this.cameras.main.setPipeline('Custom');

    const collisionGroups = {
      playerHalos: this.matter.world.nextCategory()
    };

    this.players = [
      new Player({
        scene: this,
        input: this.customInput.players[0],
        color: 0xf207a4,
        number: 1,
        collisionGroups
      }),
      new Player({
        scene: this,
        input: this.customInput.players[1],
        color: 0x04db0c,
        x: sz.w - 50,
        y: sz.h - 50,
        number: 2,
        collisionGroups
      })
    ];

    this.countDownToStart = new CountDownToStart({
      scene: this,
      onComplete: () => {
        this.startGame();
      }
    });
  }

  startGame() {
    this.players[0].setOpponent(this.players[1]);
    this.players[1].setOpponent(this.players[0]);

    // if matches both conditions, returns regExA matched first
    const getPair = (bodyA, bodyB, regExA, regExB) => {
      if (regExA.test(bodyA.label) && regExB.test(bodyB.label)) {
        return [bodyA, bodyB];
      }

      if (regExB.test(bodyA.label) && regExA.test(bodyB.label)) {
        return [bodyB, bodyA];
      }

      return null;
    };

    this.matter.world.on(
      'collisionstart',
      (event) => {
        // console.log(
        //   'collision',
        //   event.pairs.length,
        //   event.pairs.map((e) => `${e.bodyA.label} - ${e.bodyB.label}`)
        // );

        if (!event.pairs.length) {
          return;
        }

        for (let index = 0; index < event.pairs.length; index++) {
          const element = event.pairs[index];

          const playerHitBodies = getPair(
            element.bodyA,
            element.bodyB,
            playerShootLabelRegEx,
            playerLabelRegEx
          );

          if (playerHitBodies) {
            this.onHitPlayer(...playerHitBodies);
          }

          // const boundsHitBodies = getPair(
          //   element.bodyA,
          //   element.bodyB,
          //   playerShootLabelRegEx,
          //   boundsLabelRegEx
          // );

          // if (boundsHitBodies) {
          //   this.onHitBounds(...boundsHitBodies);
          // }
        }
      },
      this
    );
    this.data.set('endTime', this.time.now + ROUND_TIME);
    this.scene.launch('gui');
    this.started = true;
  }

  endGame() {
    this.started = false;
    this.scene.stop('gui');
    const player1 = this.players[0].data.get('score');
    const player2 = this.players[1].data.get('score');
    this.scene.start('gameover', {
      player1,
      player2,
      winnerColor:
        player1 > player2
          ? this.players[0].data.get('color')
          : player1 < player2
          ? this.players[1].data.get('color')
          : 'white'
    });
  }

  update() {
    if (this.players) {
      this.players.forEach((player) => player.update());

      // CAMERA
    }

    const endTime = this.data.get('endTime');
    if (this.started && endTime && endTime <= this.time.now) {
      // console.log(endTime, this.time.now, endTime > this.time.now);
      this.endGame();
    }
  }

  onHitPlayer(bullet, playerHit) {
    const hitPlayerNumber = parseInt(
      playerLabelRegEx.exec(playerHit.label)[1],
      10
    );

    const playerScored = hitPlayerNumber === 1 ? 2 : 1;

    const player = this.players.find((p) => p.number === playerScored);
    if (!player) console.warn('player not found for number', playerScored);
    player.data.set('score', parseInt(player.data.get('score') || 0, 10) + 1);

    // TODO: Reset Game
  }

  // onHitBounds(bullet, bound) {
  //   console.log('onHitBounds', bullet, bound);
  // }
}

export default World;
