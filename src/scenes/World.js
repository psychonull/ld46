import Phaser from 'phaser';
import Player from '/prefabs/Player';

class World extends Phaser.Scene {
  constructor() {
    super('LD#46');
  }

  preload() {}

  create() {
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
