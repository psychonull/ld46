import Phaser from 'phaser';
import PlayerShoot from '/prefabs/PlayerShoot';

import { random } from '/utils/math';
import PLAYER_INPUT from '../utils/PlayerInputEnum';

class Player {
  constructor({ scene, input, color = 0x00ff00, x = 30, y = 30 }) {
    this.scene = scene;
    this.input = input;
    this.data = new Phaser.Data.DataManager(
      this,
      new Phaser.Events.EventEmitter()
    );

    this.bulletTime = 0;
    this.bulletFireVel = 250;
    this.moveVel = 2;

    this.player = this.scene.add.rectangle(x, y, 30, 30, color);
    this.scene.matter.add.gameObject(this.player, { label: 'player' });

    this.bullets = new PlayerShoot({
      scene: scene,
      input,
      color
    });
  }

  tryFire() {
    if (this.scene.game.getTime() > this.bulletTime) {
      const dir = {
        x: random(-100, 100) / 100,
        y: random(-100, 100) / 100
      };

      this.bullets.fire(this.player.getCenter(), dir);
      this.bulletTime = this.scene.game.getTime() + this.bulletFireVel;
      this.data.set('score', Number(this.data.get('score') || 0) + 1); // TODO: Remove this
    }
  }

  update() {
    this.player.setVelocity(0, 0);

    if (this.input.get(PLAYER_INPUT.projectile_shoot)) {
      this.tryFire();
    }

    if (this.input.get(PLAYER_INPUT.left)) {
      this.player.setVelocityX(this.moveVel * -1);
    } else if (this.input.get(PLAYER_INPUT.right)) {
      this.player.setVelocityX(this.moveVel);
    }

    if (this.input.get(PLAYER_INPUT.up)) {
      this.player.setVelocityY(this.moveVel * -1);
    } else if (this.input.get(PLAYER_INPUT.down)) {
      this.player.setVelocityY(this.moveVel);
    }

    this.bullets.update();
  }
}

export default Player;
