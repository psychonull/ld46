import Phaser from 'phaser';
import PlayerShoot from '/prefabs/PlayerShoot';
import PLAYER_INPUT from 'utils/PlayerInputEnum';

class Player {
  constructor({
    scene,
    input,
    number,
    color = 0x00ff00,
    x = 30,
    y = 30,
    collisionGroups
  }) {
    this.scene = scene;
    this.input = input;
    this.number = number;
    this.data = new Phaser.Data.DataManager(
      this,
      new Phaser.Events.EventEmitter()
    );
    this.data.set('score', 0);

    this.bulletTime = 0;
    this.bulletFireVel = 250;
    this.moveVel = 0.03;
    this.radius = 15;
    this.haloRadius = this.radius * 10;

    this.player = this.scene.add.circle(x, y, this.radius);
    this.player.setStrokeStyle(3, color, 1);
    this.scene.matter.add.gameObject(this.player, {
      label: `player-${this.number}`,
      circleRadius: this.radius,
      frictionAir: 0.1,
      density: 0.02
    });

    this.playerHalo = this.scene.add.circle(x, y, this.haloRadius);
    this.playerHalo.setStrokeStyle(2, 0xffffff, 1);
    this.playerHalo.setAlpha(0);

    const showHalo = this.scene.tweens.add({
      targets: this.playerHalo,
      alpha: { start: 0, to: 0.3 },
      scale: { start: 0.7, to: 1.1 },
      ease: 'Bounce',
      duration: 200,
      repeat: 0,
      yoyo: true
    });

    this.scene.matter.add
      .gameObject(this.playerHalo, {
        label: `halo-${this.number}`,
        circleRadius: this.haloRadius,
        frictionAir: 0,
        friction: 0,
        density: 0.00001
      })
      .setBounce(1)
      .setCollisionCategory(collisionGroups.playerHalos)
      .setCollidesWith(collisionGroups.playerHalos)
      .setOnCollide(() => {
        showHalo.restart();
      });

    this.scene.matter.add.constraint(this.player, this.playerHalo, 0);

    this.player.setFixedRotation();

    this.bullets = new PlayerShoot({
      scene: scene,
      input,
      color,
      collisionCategory: this.shootCollisionCategory,
      playerNumber: this.number
    });
  }

  setOpponent(player) {
    this.opponent = player;
  }

  tryFire() {
    if (this.scene.game.getTime() > this.bulletTime) {
      let opponentPos = this.opponent.player.getCenter();
      let playerPos = this.player.getCenter();

      let dir = Math.atan2(
        opponentPos.y - playerPos.y,
        opponentPos.x - playerPos.x
      );

      this.bullets.fire(
        {
          x: playerPos.x + this.radius * 2 * Math.cos(dir),
          y: playerPos.y + this.radius * 2 * Math.sin(dir)
        },
        dir
      );

      this.bulletTime = this.scene.game.getTime() + this.bulletFireVel;
    }
  }

  update() {
    if (!this.scene.started) {
      return;
    }
    if (this.input.get(PLAYER_INPUT.projectile_shoot)) {
      this.tryFire();
    }

    if (this.input.get(PLAYER_INPUT.left)) {
      this.player.thrustBack(this.moveVel);
    } else if (this.input.get(PLAYER_INPUT.right)) {
      this.player.thrust(this.moveVel);
    }

    if (this.input.get(PLAYER_INPUT.up)) {
      this.player.thrustLeft(this.moveVel);
    } else if (this.input.get(PLAYER_INPUT.down)) {
      this.player.thrustRight(this.moveVel);
    }

    this.bullets.update();
  }
}

export default Player;
