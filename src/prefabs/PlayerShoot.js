import { counter } from '/utils/math';
import PLAYER_INPUT from 'utils/PlayerInputEnum';

// GameObject Factory to manage all shoots for one player
class PlayerShoot {
  constructor({
    scene,
    input,
    playerNumber,
    color = 0xaa0000,
    selectedColor = 0xff0000
  }) {
    this.scene = scene;
    this.input = input;
    this.playerNumber = playerNumber;

    this.newId = counter(1);
    this.color = color;
    this.selectedColor = selectedColor;
    this.selectedBullet = null;
    this.selectVel = 250;
    this.selectTime = 100;
    this.thrust = 4;
    this.angularVel = 0.06;
    this.width = 15;
    this.height = 5;
    this.bulletMaxAlive = 2;

    this.group = this.scene.add.group();
  }

  select(dir) {
    if (this.scene.game.getTime() > this.selectTime) {
      let found;

      if (this.selectedBullet) {
        this.selectedBullet.setFillStyle(this.color);

        found = this.group.getChildren(true).some((item, i) => {
          if (this.selectedBullet.id == item.id) {
            const len = this.group.getLength();
            let nextIndex = dir + i;

            if (nextIndex < 0) nextIndex = len - 1;
            if (nextIndex >= len) nextIndex = 0;

            this.selectedBullet = this.group.getChildren()[nextIndex];
            return true;
          }
        });
      }

      if (!found) {
        this.selectedBullet = this.group.getFirstAlive();
      }

      if (this.selectedBullet)
        this.selectedBullet.setFillStyle(this.selectedColor);

      this.selectTime = this.scene.game.getTime() + this.selectVel;
    }
  }

  // creates a new bullet
  fire(pos, angle) {
    if (this.group.getChildren(true).length >= this.bulletMaxAlive) {
      // TODO: sound of no more bullets
      return;
    }

    const shoot = this.scene.add.rectangle(
      pos.x,
      pos.y,
      this.width,
      this.height,
      this.color
    );

    shoot.id = this.newId();

    this.scene.matter.add.gameObject(shoot, {
      label: `player-shoot-${this.playerNumber}`,
      friction: 0,
      drag: 0,
      frictionAir: 0,
      angle
    });

    shoot.setVelocity(
      this.thrust * Math.cos(shoot.rotation),
      this.thrust * Math.sin(shoot.rotation)
    );

    shoot.setOnCollide((/*{ bodyA, bodyB }*/) => {
      this.scene.matter.world.remove(shoot);
      this.group.killAndHide(shoot);
      this.group.remove(shoot);

      if (this.selectedBullet && this.selectedBullet.id === shoot.id) {
        this.selectedBullet = null;
      }
    });

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
      this.selectedBullet.setAngularVelocity(0);

      if (this.input.get(PLAYER_INPUT.projectile_left)) {
        this.selectedBullet.setAngularVelocity(this.angularVel * -1);
      } else if (this.input.get(PLAYER_INPUT.projectile_right)) {
        this.selectedBullet.setAngularVelocity(this.angularVel);
      }

      this.selectedBullet.setVelocity(
        this.thrust * Math.cos(this.selectedBullet.rotation),
        this.thrust * Math.sin(this.selectedBullet.rotation)
      );
    }
  }
}

export default PlayerShoot;
