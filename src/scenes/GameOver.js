import Phaser from 'phaser';
import { getStringColor } from '/utils/color';

const READY_TIMEOUT = 1000;

class GameOver extends Phaser.Scene {
  constructor() {
    super({ key: 'gameover' });
  }

  preload() {}

  init(data) {
    this.msg =
      data.player1 > data.player2
        ? 'Player 1 WINS'
        : data.player1 < data.player2
        ? 'Player 2 WINS'
        : 'YOU BOTH LOSE';
    this.scoresText = `${data.player1} - ${data.player2}`;
    this.textColor = getStringColor(data.winnerColor);
    this.buttonPressSound = this.sound.add('buttonpress', { volume: 0.5 });
  }

  create() {
    this.p1Ready = false;
    this.p2Ready = false;
    this.canBeReady = false;

    this.cameras.main.setPipeline('Custom');

    this.time.addEvent({
      delay: READY_TIMEOUT,
      callback: () => {
        this.canBeReady = true;
      },
      callbackScope: this,
      loop: false
    });
    const world = this.sys.game.canvas;
    this.textScore1 = this.add
      .text(world.width / 2, world.height / 2 - 200, this.scoresText, {
        fontFamily: 'monospace',
        fontSize: 92,
        color: this.textColor
      })
      .setOrigin(0.5, 0);

    this.text1 = this.add.text(world.width / 2, world.height / 2, this.msg, {
      fontFamily: 'monospace',
      fontSize: 62,
      color: this.textColor
    });
    this.text1.setOrigin(0.5);
    this.text2 = this.add.text(
      world.width / 2,
      75 + world.height / 2,
      'press <any key> to start a new match',
      {
        fontFamily: 'monospace',
        fontSize: 28,
        color: this.textColor
      }
    );
    this.text2.setOrigin(0.5);

    this.p1ReadyText = this.add.text(
      world.width / 2 - 50,
      150 + world.height / 2,
      'P1 Not Ready',
      {
        alpha: 0.5,
        fontFamily: 'monospace',
        fontSize: 20,
        color: this.textColor
      }
    );
    this.p1ReadyText.setAlpha(0.3).setOrigin(1, 0);

    this.p2ReadyText = this.add.text(
      world.width / 2 + 50,
      150 + world.height / 2,
      'P2 Not Ready',
      {
        alpha: 0.5,
        fontFamily: 'monospace',
        fontSize: 20,
        color: this.textColor
      }
    );
    this.p2ReadyText.setAlpha(0.3);
  }

  update() {
    if (
      !this.p1Ready &&
      this.customInput.players[0].getAny() &&
      this.canBeReady
    ) {
      this.p1Ready = true;
      this.buttonPressSound.play();
      this.p1ReadyText.setAlpha(1).setText('P1 READY');
    }
    if (
      !this.p2Ready &&
      this.customInput.players[1].getAny() &&
      this.canBeReady
    ) {
      this.p2Ready = true;
      this.buttonPressSound.play();
      this.p2ReadyText.setAlpha(1).setText('P2 READY');
    }
    if (this.p1Ready && this.p2Ready) {
      this.scene.start('Game');
    }
  }
}

export default GameOver;
