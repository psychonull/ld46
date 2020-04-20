import Phaser from 'phaser';
import Player from '/prefabs/Player';
import CountDownToStart from '/prefabs/CountDownToStart';

const playerLabelRegEx = /^player-(\d)$/;
const playerShootLabelRegEx = /^player-shoot-(\d)$/;
// const boundsLabelRegEx = /^Rectangle Body$/;

const ROUND_TIME = 90 * 1000;

class World extends Phaser.Scene {
  constructor() {
    super('Game');
    this.started = false;
  }

  preload() {}

  create() {
    this.matter.enableCollisionEventsPlugin();
    this.matter.world.setBounds();

    const collisionGroups = {
      playerHalos: this.matter.world.nextCategory()
    };

    const world = this.sys.game.canvas;
    this.players = [
      new Player({
        scene: this,
        input: this.customInput.players[0],
        number: 1,
        collisionGroups
      }),
      new Player({
        scene: this,
        input: this.customInput.players[1],
        color: 0x0000ff,
        x: world.width - 50,
        y: world.height - 50,
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
    // this.startGame();
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
    console.log('end');
    this.started = false;
    this.scene.stop('gui');
    this.scene.start('gameover', {
      player1: this.players[0].data.get('score'),
      player2: this.players[1].data.get('score')
    });
  }

  update() {
    if (this.players) {
      this.players.forEach((player) => player.update());
    }
    const endTime = this.data.get('endTime');
    if (this.started && endTime && endTime <= this.time.now) {
      // console.log(endTime, this.time.now, endTime > this.time.now);
      this.endGame();
    }
  }

  onHitPlayer(bullet) {
    console.log('onHitPlayer', bullet);

    const playerNumber = parseInt(
      playerShootLabelRegEx.exec(bullet.label)[1],
      10
    );

    const player = this.players.find((p) => p.number === playerNumber);
    if (!player) console.warn('player not found for number', playerNumber);
    player.data.set('score', parseInt(player.data.get('score') || 0, 10) + 1);

    // TODO: Reset Game
  }

  // onHitBounds(bullet, bound) {
  //   console.log('onHitBounds', bullet, bound);
  // }
}

export default World;
