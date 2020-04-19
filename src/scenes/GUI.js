import Phaser from 'phaser';

const baseY = 600;

class GUI extends Phaser.Scene {
  constructor() {
    super({ key: 'gui' });
  }

  preload() {}

  create() {
    const gameScene = this.scene.get('Game');
    this.createPlayer1(gameScene.players[0]);
    this.createPlayer2(gameScene.players[1]);
    this.createRemainingTime();
  }

  createRemainingTime() {
    this.add.text(300, 75 + baseY, `TIME`, {
      color: 'white',
      fontFamily: 'monospace',
      fontSize: 26
    });
  }

  createPlayer1(player) {
    this.player1 = player;
    const offsetX = 100;
    this.add.text(100 + offsetX, 75 + baseY, `Player 1`, {
      color: 'white',
      fontFamily: 'monospace'
    });
    const score = this.add.text(
      100 + offsetX,
      100 + baseY,
      player.data.get('score') || '0'
    );
    player.data.events.on('changedata-score', (playerFromEvent, newScore) => {
      score.setText(newScore);
    });
  }

  createPlayer2(player) {
    this.player2 = player;
    const offsetX = 400;
    this.add.text(100 + offsetX, 75 + baseY, `Player 2`, {
      color: 'white',
      fontFamily: 'monospace'
    });
    const score = this.add.text(
      100 + offsetX,
      100 + baseY,
      player.data.get('score') || '0'
    );
    player.data.events.on('changedata-score', (playerFromEvent, newScore) => {
      score.setText(newScore);
    });
  }
}

export default GUI;
