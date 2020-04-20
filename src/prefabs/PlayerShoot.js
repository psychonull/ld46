import Phaser from 'phaser';
import { random, counter } from '/utils/math';
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
    this.radius = 5;
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
      this.scene.playAudio('nobullets');
      return true;
    }

    this.scene.playAudio('shoot');

    const shoot = this.scene.add.circle(pos.x, pos.y, this.radius, this.color);

    shoot.id = this.newId();

    shoot.particles = this.scene.add.particles('white_square');
    shoot.emitter = shoot.particles.createEmitter({
      speed: {
        onEmit: () => shoot.body.speed
      },
      lifespan: {
        onEmit: () =>
          Phaser.Math.Percent(shoot.body.speed, 0, random(100, 300)) * 5000
      },
      alpha: {
        onEmit: () =>
          Phaser.Math.Percent(shoot.body.speed, 0, random(100, 300)) * 1000
      },
      tint: {
        onEmit: () =>
          this.selectedBullet && this.selectedBullet.id == shoot.id
            ? this.selectedColor
            : this.color
      },
      scale: { start: 0.2, end: 0 },
      blendMode: 'ADD',
      follow: shoot
    });

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
      const isSelected = !!(
        this.selectedBullet && this.selectedBullet.id === shoot.id
      );

      shoot.particles
        .createEmitter({
          speed: { min: 10, max: 70 },
          x: shoot.x,
          y: shoot.y,
          frequency: -1,
          tint: isSelected ? this.selectedColor : this.color,
          lifespan: { min: 200, max: 800 },
          alpha: { start: 0, end: 0.8 },
          scale: { start: 0, end: 0.1 },
          blendMode: 'ADD'
        })
        .explode(100, shoot.x, shoot.y);

      this.scene.matter.world.remove(shoot);
      this.group.killAndHide(shoot);
      this.group.remove(shoot);

      this.scene.time.delayedCall(700, () => {
        shoot.particles.destroy();
      });

      if (isSelected) this.selectedBullet = null;
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
