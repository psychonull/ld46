import Phaser from 'phaser';
import Player from '/prefabs/Player';

const playerLabelRegEx = /^player-(\d)$/;
const playerShootLabelRegEx = /^player-shoot-(\d)$/;
// const boundsLabelRegEx = /^Rectangle Body$/;

class World extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  preload() {
    this.load.image('white', '/images/white.png');
    this.load.image('white_square', '/images/white_square.png');
  }

  create() {
    this.matter.enableCollisionEventsPlugin();
    this.matter.world.setBounds();

    const collisionGroups = {
      playerHalos: this.matter.world.nextCategory()
    };

    this.cameras.main.setBackgroundColor('#041015');

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
        x: 500,
        y: 600,
        number: 2,
        collisionGroups
      })
    ];

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
  }

  update() {
    this.players.forEach((player) => player.update());
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
