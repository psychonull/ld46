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
    this.player2 = new Player({
      scene: this,
      input: this.customInput.players[1],
      color: 0x0000ff,
      x: 500,
      y: 600
    });
  }

  update() {
    this.player.update();
    this.player2.update();
  }
}

export default World;
