import Phaser from 'phaser';

import World from '/scenes/World';
import GUI from '/scenes/GUI';

import InputManagerPlugin from '/plugins/inputManager';

const config = {
  // pixelArt: true,
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
    default: 'matter',
    matter: {
      gravity: { y: 0 }
      // https://photonstorm.github.io/phaser3-docs/Phaser.Types.Physics.Matter.html#.MatterDebugConfig__anchor
      // debug: {
      //   showBody: true,
      //   showStaticBody: true
      // }
    }
  },
  scene: [World, GUI]
};

const game = new Phaser.Game(config);

export default game;
