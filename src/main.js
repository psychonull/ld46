import Phaser from 'phaser';

// Scenes
import World from '/scenes/World';

import InputManagerPlugin from '/plugins/inputManager';
const config = {
  pixelArt: true,
  type: Phaser.AUTO,
  // width: 800,
  // height: 600,
  input: {
    gamepad: true
  },
  plugins: {
    scene: [
      {
        key: 'inputManager',
        plugin: InputManagerPlugin,
        mapping: 'customInput'
      }
    ]
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: true
    }
  },
  scene: [World]
};

const game = new Phaser.Game(config);

export default game;
