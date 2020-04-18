import PlayerShoot from '/prefabs/PlayerShoot';

import { random } from '/utils/math';
import PLAYER_INPUT from '../utils/PlayerInputEnum';

class Player {
  constructor({ scene, input }) {
    this.scene = scene;
    this.input = input;

    this.bulletTime = 0;
    this.bulletFireVel = 250;
    this.moveVel = 300;

    this.player = this.scene.add.rectangle(200, 200, 30, 30, 0x00ff00);
    this.physicsGroup = this.scene.physics.add.group();
    this.physicsGroup.add(this.player);

    this.bullets = new PlayerShoot({
      scene: scene,
      input
    });
  }

  tryFire() {
    if (this.scene.game.getTime() > this.bulletTime) {
      const dir = {
        x: random(-100, 100) / 100,
        y: random(-100, 100) / 100
      };

      this.bullets.fire(this.player.body.center, dir);
      this.bulletTime = this.scene.game.getTime() + this.bulletFireVel;
    }
  }

  update() {
    this.player.body.setVelocity(0);

    if (this.input.get(PLAYER_INPUT.projectile_shoot)) {
      this.tryFire();
    }

    if (this.input.get(PLAYER_INPUT.left)) {
      this.player.body.setVelocityX(this.moveVel * -1);
    } else if (this.input.get(PLAYER_INPUT.right)) {
      this.player.body.setVelocityX(this.moveVel);
    }

    if (this.input.get(PLAYER_INPUT.up)) {
      this.player.body.setVelocityY(this.moveVel * -1);
    } else if (this.input.get(PLAYER_INPUT.down)) {
      this.player.body.setVelocityY(this.moveVel);
    }

    this.bullets.update();
  }
}

export default Player;
