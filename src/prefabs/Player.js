import Phaser from 'phaser';
import PlayerShoot from '/prefabs/PlayerShoot';
import PLAYER_INPUT from 'utils/PlayerInputEnum';

import { random } from 'utils/math';

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
    this.x = x;
    this.y = y;
    this.color = color;
    this.hitColor = 0xff0000;

    this.scene = scene;
    this.input = input;
    this.number = number;

    const gameConfig = this.scene.data.get('gameConfig');

    this.data = new Phaser.Data.DataManager(
      this,
      new Phaser.Events.EventEmitter()
    );
    this.data.set('score', 0);
    this.data.set('color', color);

    this.aimTo = new Phaser.Math.Vector2(0, 0);

    this.bulletTimeMultiplier = gameConfig.bulletTimeMultiplier;
    this.canShootWhenBlocked = gameConfig.canShootWhenBlocked;
    this.bulletTime = 0;
    this.bulletFireVel = gameConfig.reloadTime;
    this.shootBackForce = 0.5;
    this.moveVel = gameConfig.playerSpeed / 100; // 0.03;
    this.radius = 15;
    this.haloRadius = this.radius * 10;
    this.collisionGroups = collisionGroups;

    this.createGameObjects();
    this.addPhysics();
    this.createFx();

    var darkerColor = Phaser.Display.Color.IntegerToColor(color).darken(30);
    var lighterColor = Phaser.Display.Color.IntegerToColor(color).lighten(50);

    this.bullets = new PlayerShoot({
      scene: scene,
      input: input,
      color: darkerColor.color32,
      selectedColor: lighterColor.color32,
      playerNumber: this.number,
      bulletMaxAlive: gameConfig.maxBullets,
      thrust: gameConfig.bulletSpeed
    });
  }

  createGameObjects() {
    this.player = this.scene.add.circle(this.x, this.y, this.radius);
    this.player.setStrokeStyle(3, this.color, 1);

    this.playerAim = this.scene.add
      .triangle(
        this.x,
        this.y,
        0,
        this.radius,
        this.radius / 2,
        0,
        this.radius,
        this.radius,
        this.color,
        0.1
      )
      .setAlpha(0)
      .setScale(1.4, 2);

    this.playerFX = this.scene.add.circle(this.x, this.y, this.radius);
    this.playerFX.setStrokeStyle(3, this.color, 1);

    this.playerHalo = this.scene.add.circle(this.x, this.y, this.haloRadius);
    this.playerHalo.setStrokeStyle(2, 0xffffff, 1);
    this.playerHalo.setAlpha(0);

    this.playerMiniMap = this.scene.add.circle(
      this.x,
      this.y,
      this.radius * 2,
      this.color
    );
    this.scene.cameras.main.ignore(this.playerMiniMap);

    this.blockTimer = this.scene.add
      .text(this.x, this.y, '', {
        color: '#ff0000',
        fontFamily: 'monospace',
        fontSize: 40
      })
      .setOrigin(0.5, 1.5)
      .setAlpha(0);
  }

  addPhysics() {
    this.scene.matter.add
      .gameObject(this.player, {
        label: `player-${this.number}`,
        circleRadius: this.radius,
        frictionAir: 0.1,
        density: 0.02
      })
      .setFixedRotation();

    this.scene.matter.add
      .gameObject(this.playerHalo, {
        label: `halo-${this.number}`,
        circleRadius: this.haloRadius,
        frictionAir: 0,
        friction: 0,
        density: 0.00001
      })
      .setBounce(1)
      .setCollisionCategory(this.collisionGroups.playerHalos)
      .setCollidesWith(this.collisionGroups.playerHalos)
      .setOnCollide(() => {
        this.haloTween.restart();
        this.scene.playAudio('magnet');
      });

    this.scene.matter.add.constraint(this.player, this.playerHalo, 0);
  }

  createFx() {
    this.haloTween = this.scene.tweens.add({
      targets: this.playerHalo,
      alpha: { start: 0, to: 0.3 },
      scale: { start: 0.7, to: 1.1 },
      ease: 'Bounce',
      duration: 200,
      repeat: 0,
      yoyo: true
    });

    this.scene.tweens.add({
      targets: this.playerFX,
      props: {
        alpha: { start: 0.1, to: 0.8 },
        scale: { start: 0.5, to: 1.1 }
      },
      ease: 'Bounce',
      duration: 50,
      repeat: Infinity
    });

    this.scene.tweens.add({
      targets: this.player,
      props: {
        alpha: { start: 0, to: 1 }
      },
      ease: 'Cubic',
      duration: 100,
      repeat: Infinity
    });

    this.fireTween = this.scene.tweens
      .add({
        targets: this.player,
        tweenStep: 10,
        onUpdate: (tween, targets) => {
          targets
            .setFillStyle(
              this.color,
              Phaser.Math.Interpolation.Bezier(
                [0.8, 1.0, 0.8, 0.6, 0.4, 0.2, 0],
                tween.progress
              )
            )
            .setAlpha(1)
            .setScale(
              Phaser.Math.Interpolation.Bezier(
                [1.3, 1.6, 1.5, 1.4, 1.3, 1.2, 1],
                tween.progress
              )
            );
        },
        ease: 'Cubic',
        duration: 300,
        repeat: 0,
        yoyo: true
      })
      .stop();

    this.hitTween = this.scene.tweens
      .add({
        targets: this.player,
        tweenStep: 10,
        onUpdate: (tween, targets) => {
          targets
            .setStrokeStyle(3, this.hitColor, 1)
            .setFillStyle(
              this.hitColor,
              Phaser.Math.Interpolation.Bezier(
                [0.8, 1.0, 0.8, 0.6, 0.4, 0.2, 0],
                tween.progress
              )
            )
            .setAlpha(1);
        },
        ease: 'Cubic',
        duration: 300,
        repeat: 0,
        yoyo: true
      })
      .stop();
  }

  setOpponent(player) {
    this.opponent = player;
  }

  setHit(delay) {
    if (!this.bulletTimeMultiplier) {
      return;
    }

    if (this.blocked) {
      this.unblockAt += delay * this.bulletTimeMultiplier; // MS
    } else {
      this.hitTween.restart();

      if (!this.canShootWhenBlocked) this.playerAim.setVisible(false);
      this.playerFX.setVisible(false);
      this.playerHalo.setVisible(false);

      this.blockStartAt = this.scene.game.getTime();
      this.blocked = true;
      this.unblockAt = this.blockStartAt + delay * this.bulletTimeMultiplier;
    }
  }

  tryFire() {
    if (this.scene.game.getTime() > this.bulletTime) {
      const didFire = !this.bullets.fire(
        {
          x: this.player.getCenter().x + this.radius * 2 * Math.cos(this.aimTo),
          y: this.player.getCenter().y + this.radius * 2 * Math.sin(this.aimTo)
        },
        this.aimTo
      );

      if (didFire) {
        this.scene.cameras.main.shake(100, 0.01);
        this.fireTween.restart();

        this.player.applyForce(
          new Phaser.Math.Vector2(
            this.shootBackForce * Math.cos(this.aimTo),
            this.shootBackForce * Math.sin(this.aimTo)
          ).scale(-1)
        );
      }

      this.bulletTime = this.scene.game.getTime() + this.bulletFireVel;
    }
  }

  setAimTo() {
    const opponentPos = this.opponent.player.getCenter();
    const playerPos = this.player.getCenter();

    this.aimTo = Math.atan2(
      opponentPos.y - playerPos.y,
      opponentPos.x - playerPos.x
    );
  }

  updateRamble() {
    const r = 1;
    this.player.x += random(-r, r) / 10;
    this.player.y += random(-r, r) / 10;

    const r2 = 3;
    this.playerFX.x = this.player.x + random(-r2, r2);
    this.playerFX.y = this.player.y + random(-r2, r2);
  }

  updateAiming() {
    const pos = new Phaser.Math.Vector2(
      this.player.x + this.radius * 2.3 * Math.cos(this.aimTo),
      this.player.y + this.radius * 2.3 * Math.sin(this.aimTo)
    );

    this.playerAim.setAlpha(1);
    this.playerAim.setPosition(pos.x, pos.y);
    this.playerAim.setRotation(this.aimTo + Math.PI / 2);
  }

  update() {
    if (!this.scene.started) {
      return;
    }

    if (this.blocked) {
      this.blockTimer.setAlpha(1);
      this.blockTimer.setText(
        `${parseInt((this.unblockAt - this.scene.game.getTime()) / 1000, 10)}`
      );

      if (this.scene.game.getTime() >= this.unblockAt) {
        this.player.setStrokeStyle(3, this.color, 1);

        if (!this.canShootWhenBlocked) this.playerAim.setVisible(true);
        this.playerFX.setVisible(true);
        this.playerHalo.setVisible(true);
        this.blockTimer.setAlpha(0);

        this.blocked = false;
        this.blockStartAt = 0;
        this.unblockAt = 0;
      }
    } else {
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

      this.updateRamble();
    }

    if (!this.blocked || this.canShootWhenBlocked) {
      this.setAimTo();

      if (this.input.get(PLAYER_INPUT.projectile_shoot)) {
        this.tryFire();
      }

      this.updateAiming();
    }

    this.playerMiniMap.setPosition(this.player.x, this.player.y);
    this.blockTimer.setPosition(this.player.x, this.player.y);
    this.bullets.update();
  }
}

export default Player;
