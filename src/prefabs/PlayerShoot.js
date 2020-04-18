import { counter } from '/utils/math';
import PLAYER_INPUT from '../utils/PlayerInputEnum';

// GameObject Factory to manage all shoots for one player
class PlayerShoot {
  constructor({ scene, input }) {
    this.scene = scene;
    this.input = input;

    this.newId = counter(1);
    this.color = 0xff0000;
    this.selectedColor = 0xffff00;
    this.selectedBullet = null;
    this.selectVel = 250;
    this.selectTime = 100;
    this.moveVel = 200;
    this.angularVel = 100;
    this.width = 30;
    this.height = 10;

    this.group = this.scene.add.group();
    this.physicsGroup = this.scene.physics.add.group();
  }

  select(dir) {
    if (this.scene.game.getTime() > this.selectTime) {
      this.selectedBullet.setFillStyle(this.color);

      const active = true;
      const found = this.group.getChildren(active).some((item, i) => {
        if (this.selectedBullet.id == item.id) {
          const len = this.group.getLength();
          let nextIndex = dir + i;

          if (nextIndex < 0) nextIndex = len - 1;
          if (nextIndex >= len) nextIndex = 0;

          this.selectedBullet = this.group.getChildren()[nextIndex];
          return true;
        }
      });

      if (!found) {
        this.selectedBullet = this.group.getFirstAlive();
      }

      this.selectedBullet.setFillStyle(this.selectedColor);
      this.selectTime = this.scene.game.getTime() + this.selectVel;
    }
  }

  // creates a new bullet
  fire(pos, dir) {
    const shoot = this.scene.add.rectangle(
      pos.x,
      pos.y,
      this.width,
      this.height,
      this.color
    );
    shoot.id = this.newId();

    this.physicsGroup.add(shoot);

    shoot.body.setVelocity(dir.x * this.moveVel, dir.y * this.moveVel);
    shoot.body.setCollideWorldBounds(true);

    this.group.add(shoot);

    if (this.selectedBullet) this.selectedBullet.setFillStyle(this.color);

    this.selectedBullet = shoot; // auto-set latest fired
    this.selectedBullet.setFillStyle(this.selectedColor);
  }

  update() {
    if (
      this.input.get(PLAYER_INPUT.projectile_next) ||
      this.input.get(PLAYER_INPUT.projectile_previous)
    ) {
      this.select(this.input.get(PLAYER_INPUT.projectile_next) ? 1 : -1);
    }

    if (this.selectedBullet) {
      this.selectedBullet.body.angularVelocity = 0;

      if (this.input.get(PLAYER_INPUT.projectile_left)) {
        this.selectedBullet.body.angularVelocity = this.angularVel * -1;
      } else if (this.input.get(PLAYER_INPUT.projectile_right)) {
        this.selectedBullet.body.angularVelocity = this.angularVel;
      }

      this.scene.physics.velocityFromRotation(
        this.selectedBullet.rotation,
        this.moveVel,
        this.selectedBullet.body.velocity
      );
    }
  }
}

export default PlayerShoot;
