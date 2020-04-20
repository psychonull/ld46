import Phaser from 'phaser';

import World from '/scenes/World';
import GUI from '/scenes/GUI';
import GameOver from '/scenes/GameOver';

import InputManagerPlugin from '/plugins/inputManager';
import configs from '/configs';
import {
  loadConfig,
  saveConfig,
  presetsToForm,
  configToForm,
  formToConfig
} from '/utils/config';

window.gameConfig = loadConfig();

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
const configPopup = document.getElementById('config-popup');

window.document.getElementById('help-button').addEventListener('click', (e) => {
  e.preventDefault();
  helpPopup.classList.remove('hidden');
});

window.document
  .getElementById('config-button')
  .addEventListener('click', (e) => {
    e.preventDefault();
    configPopup.classList.remove('hidden');
  });

window.document
  .getElementById('help-close-button')
  .addEventListener('click', (e) => {
    e.preventDefault();
    helpPopup.classList.add('hidden');
  });

window.document
  .getElementById('config-cancel-button')
  .addEventListener('click', (e) => {
    e.preventDefault();
    configPopup.classList.add('hidden');
  });

window.document
  .getElementById('config-save-button')
  .addEventListener('click', (e) => {
    e.preventDefault();
    const newConfig = formToConfig();
    saveConfig(newConfig);
    window.gameConfig = newConfig;
    configPopup.classList.add('hidden');
  });

presetsToForm(configs);
configToForm(window.gameConfig);

export default game;
