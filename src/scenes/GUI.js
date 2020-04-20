import Phaser from 'phaser';

class GUI extends Phaser.Scene {
  constructor() {
    super({ key: 'gui', active: true });
  }

  preload() {}

  create() {
    // const gameScene = this.scene.get('Game');
    // gameScene.players.forEach(this.createPlayerUI, this);
  }

  createPlayerUI(player, index) {
    const offset = 100 * (index + 1);
    const baseY = 600;
    this.add.text(100 + offset, 75 + baseY, `player ${index}`, {
      color: 'white'
    });
    const score = this.add.text(
      100 + offset,
      100 + baseY,
      player.data.get('score') || '0'
    );
    player.data.events.on('changedata-score', (playerFromEvent, newScore) => {
      score.setText(newScore);
    });
  }
}

export default GUI;
