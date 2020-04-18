import PlayerShoot from '/prefabs/PlayerShoot';

import { random } from '/utils/math';

class Player {
  constructor({ scene, input }) {
    this.scene = scene;
    this.input = input.player;

    this.bulletTime = 0;
    this.bulletFireVel = 250;
    this.moveVel = 300;

    this.player = this.scene.add.rectangle(200, 200, 30, 30, 0x00ff00);
    this.physicsGroup = this.scene.physics.add.group();
    this.physicsGroup.add(this.player);

    this.bullets = new PlayerShoot({
      scene: scene,
      input: input.bullets
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

    if (this.input.fire.isDown) {
      this.tryFire();
    }

    if (this.input.left.isDown) {
      this.player.body.setVelocityX(this.moveVel * -1);
    } else if (this.input.right.isDown) {
      this.player.body.setVelocityX(this.moveVel);
    }

    if (this.input.up.isDown) {
      this.player.body.setVelocityY(this.moveVel * -1);
    } else if (this.input.down.isDown) {
      this.player.body.setVelocityY(this.moveVel);
    }

    this.bullets.update();
  }
}

export default Player;
