import Phaser from 'phaser';
import Player from '/prefabs/Player';

class World extends Phaser.Scene {
  constructor() {
    super('Game');
  }

  preload() {}

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
        input: this.customInput.players[0]
      }),
      new Player({
        scene: this,
        input: this.customInput.players[1],
        color: 0x0000ff,
        x: 500,
        y: 600
      })
    ];
  }

  update() {
    this.players.forEach((player) => player.update());
  }
}

export default World;
