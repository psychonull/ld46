import Phaser from 'phaser';

// Scenes
import World from '/scenes/World';

// const canvas = document.getElementById('game');

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 }
    }
  },
  scene: [World]
};

const game = new Phaser.Game(config);

export default game;
