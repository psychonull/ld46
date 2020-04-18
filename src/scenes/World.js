import Phaser from 'phaser';
import Player from '/prefabs/Player';

class World extends Phaser.Scene {
  constructor() {
    super('LD#46');
  }

  preload() {}

  create() {
    const input = this.input.keyboard;
    const key = Phaser.Input.Keyboard.KeyCodes;

    this.player = new Player({
      scene: this,
      input: {
        player: {
          fire: input.addKey(key.SPACE),
          left: input.addKey(key.LEFT),
          right: input.addKey(key.RIGHT),
          down: input.addKey(key.DOWN),
          up: input.addKey(key.UP)
        },
        bullets: {
          left: input.addKey(key.A),
          right: input.addKey(key.D),
          next: input.addKey(key.W),
          prev: input.addKey(key.S)
        }
      }
    });
  }

  update() {
    this.player.update();
  }
}

export default World;
