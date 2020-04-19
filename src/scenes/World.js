import Phaser from 'phaser';
import Player from '/prefabs/Player';
import { createHost, connectToHost } from 'service/peer';

const playerLabelRegEx = /^player-(\d)$/;
const playerShootLabelRegEx = /^player-shoot-(\d)$/;
const boundsLabelRegEx = /^Rectangle Body$/;

class World extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  preload() {
    const urlParams = new URLSearchParams(window.location.search);
    const clientId = urlParams.get('sid');

    if (clientId) {
      console.log('--- CLIENT MODE ---');
      connectToHost(clientId).then((conn) => {
        console.log('CLIENT CONNECTED!', conn);
      });
      return;
    }

    console.log('--- HOST MODE ---');
    createHost().then((conn) => {
      console.log('HOST STARTED!', conn);
    });
  }

  create() {
    // https://photonstorm.github.io/phaser3-docs/Phaser.Physics.Matter.World.html#setBounds__anchor
    this.matter.world.setBounds(
      0,
      0,
      this.game.scale.width,
      this.game.scale.height,
      32,
      true,
      true,
      true,
      true
    );

    this.players = [
      new Player({
        scene: this,
        input: this.customInput.players[0],
        number: 1
      }),
      new Player({
        scene: this,
        input: this.customInput.players[1],
        color: 0x0000ff,
        x: 500,
        y: 600,
        number: 2
      })
    ];

    this.players[0].setOpponent(this.players[1]);
    this.players[1].setOpponent(this.players[0]);

    this.players[0].matterPlayer.setCollidesWith([
      this.players[1].shootCollisionCategory
    ]);
    this.players[1].matterPlayer.setCollidesWith([
      this.players[0].shootCollisionCategory
    ]);

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
      function (event) {
        console.log(
          'collision',
          event.pairs.length,
          event.pairs.map((e) => `${e.bodyA.label} - ${e.bodyB.label}`)
        );
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
          const boundsHitBodies = getPair(
            element.bodyA,
            element.bodyB,
            playerShootLabelRegEx,
            boundsLabelRegEx
          );
          if (boundsHitBodies) {
            this.onHitBounds(...boundsHitBodies);
          }
        }
      },
      this
    );
  }

  update() {
    this.players.forEach((player) => player.update());
  }

  onHitPlayer(bullet) {
    console.log('onHitPlayer', bullet, player);
    const playerNumber = parseInt(
      playerShootLabelRegEx.exec(bullet.label)[1],
      10
    );
    const player = this.players.find((p) => p.number === playerNumber);
    if (!player) {
      return console.warn('player not found for number', playerNumber);
    }
    player.data.set('score', parseInt(player.data.get('score') || 0, 10) + 1);
  }

  onHitBounds(bullet, bound) {
    console.log('onHitBounds', bullet, bound);
  }
}

export default World;
