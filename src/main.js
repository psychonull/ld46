import Phaser from 'phaser';

import World from '/scenes/World';
import GUI from '/scenes/GUI';
import GameOver from '/scenes/GameOver';

import InputManagerPlugin from '/plugins/inputManager';

const config = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
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
      // debug: {
      //   showBody: true,
      //   showStaticBody: true
      // }
    }
  },
  scene: [World, GUI, GameOver]
};

const game = new Phaser.Game(config);

const helpPopup = document.getElementById('help-popup');

window.document.getElementById('help-button').addEventListener('click', (e) => {
  e.preventDefault();
  helpPopup.classList.remove('hidden');
});

window.document
  .getElementById('help-close-button')
  .addEventListener('click', (e) => {
    e.preventDefault();
    helpPopup.classList.add('hidden');
  });

export default game;
