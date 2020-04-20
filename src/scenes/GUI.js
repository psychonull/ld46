import Phaser from 'phaser';
import { msToTime } from '/utils/time';
import { getStringColor } from '../utils/color';

const baseY = 650;

class GUI extends Phaser.Scene {
  constructor() {
    super({ key: 'gui' });
  }

  preload() {}

  create() {
    const gameScene = this.scene.get('Game');
    this.centerX = this.sys.game.canvas.width / 2;
    this.createPlayer(gameScene.players[0], 1);
    this.createPlayer(gameScene.players[1], 2);
    this.createRemainingTime();
  }

  createRemainingTime() {
    this.add
      .text(this.centerX, 75 + baseY, `TIME`, {
        color: 'white',
        fontFamily: 'monospace'
      })
      .setOrigin(0.5, 1)
      .setAlpha(0.5);
    this.timer = this.add
      .text(this.centerX, 80 + baseY, ``, {
        color: 'white',
        fontFamily: 'monospace',
        fontSize: 26
      })
      .setOrigin(0.5, 0)
      .setAlpha(0.5);
  }

  createPlayer(player, number) {
    const offsetX = this.centerX + 100 * (number === 1 ? -1 : 1);
    const originX = number === 1 ? 1 : 0;
    const color = getStringColor(player.data.get('color'));
    const scoreTitle = this.add
      .text(offsetX, 75 + baseY, `Player ${number}`, {
        color,
        fontFamily: 'monospace'
      })
      .setOrigin(originX, 1)
      .setAlpha(0.5);
    const score = this.add
      .text(offsetX, 80 + baseY, player.data.get('score') || '0', {
        fontSize: 26,
        color,
        fontFamily: 'monospace'
      })
      .setOrigin(originX, 0)
      .setAlpha(0.5);
    player.data.events.on('changedata-score', (playerFromEvent, newScore) => {
      score.setText(newScore);
      this.tweens.add({
        targets: [scoreTitle, score],
        duration: 300,
        scale: { from: 1, to: 1.1 },
        alpha: { from: 0.5, to: 1 },
        ease: 'Bounce.easeIn',
        yoyo: true
      });
    });
  }

  update() {
    const end = this.scene.get('Game').data.get('endTime');
    const diff = end - this.time.now;
    if (diff < 0) {
      return;
    }
    this.timer.setText(msToTime(diff));
  }
}

export default GUI;
