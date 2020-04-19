import Phaser from 'phaser';
import Player from '/prefabs/Player';

class World extends Phaser.Scene {
  constructor() {
    super('LD#46');
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

    this.player = new Player({
      scene: this,
      input: this.customInput.players[0]
    });
  }

  update() {
    this.player.update();
  }
}

export default World;
