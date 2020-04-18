import Phaser from 'phaser';

// Scenes
import World from '/scenes/World';

const config = {
  type: Phaser.AUTO,
  // width: 800,
  // height: 600,
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
