import Phaser from 'phaser';
import Player from '/prefabs/Player';
import CountDownToStart from '/prefabs/CountDownToStart';
import CustomPipeline from '/prefabs/CustomPipeline';

const playerLabelRegEx = /^player-(\d)$/;
const playerShootLabelRegEx = /^player-shoot-(\d)$/;
// const boundsLabelRegEx = /^Rectangle Body$/;

const ROUND_TIME = 90 * 1000;
let customPipeline;

class World extends Phaser.Scene {
  constructor() {
    super('Game');
    this.started = false;

    this.viewportSize = {
      w: 1024,
      h: 768
    };

    this.worldSize = {
      w: this.viewportSize.w * 2,
      h: this.viewportSize.h * 2
    };

    this.minZoom = 0.5;
    this.maxZoom = 1.5;
    this.zoom = this.minZoom;
    this.offsetPlayer = 50;

    this.minLength = 100;
    this.maxLength =
      Math.sqrt(
        this.worldSize.w * this.worldSize.w +
          this.worldSize.h * this.worldSize.h
      ) / 2;
  }

  preload() {
    this.load.image('white_square', '/images/white_square.png');
    this.load.image('grid', '/images/grid.png');

    if (!customPipeline) {
      customPipeline = this.game.renderer.addPipeline(
        'Custom',
        new CustomPipeline(this.game)
      );
      customPipeline.setFloat1('alpha', 1);
    }
  }

  create() {
    const sz = this.worldSize;
    const minimapZoom = 0.1;
    const miniSz = {
      w: sz.w * minimapZoom,
      h: sz.h * minimapZoom
    };

    const grid = this.add
      .tileSprite(0, 0, sz.w * 2, sz.h * 2, 'grid')
      .setAlpha(0.1);

    this.playersCenter = this.add.circle(sz.w / 2, sz.h / 2, 5);

    this.cameras.main
      .setBackgroundColor('#041015')
      .setBounds(0, 0, sz.w, sz.h)
      .setZoom(this.zoom)
      .setName('main')
      .startFollow(this.playersCenter);

    this.minimap = this.cameras
      .add(0, this.viewportSize.h - miniSz.h, miniSz.w, miniSz.h)
      .setZoom(minimapZoom)
      .setName('mini')
      .setBackgroundColor('#000000')
      .setScroll(
        this.viewportSize.w - this.offsetPlayer * 2,
        this.viewportSize.h - this.offsetPlayer * 2
      )
      .ignore(grid);

    this.matter.enableCollisionEventsPlugin();
    this.matter.world.setBounds(0, 0, sz.w, sz.h);
    this.cameras.main.setPipeline('Custom');

    const collisionGroups = {
      playerHalos: this.matter.world.nextCategory()
    };

    this.players = [
      new Player({
        scene: this,
        input: this.customInput.players[0],
        color: 0xf207a4,
        x: this.offsetPlayer,
        y: this.offsetPlayer,
        number: 1,
        collisionGroups
      }),
      new Player({
        scene: this,
        input: this.customInput.players[1],
        color: 0x04db0c,
        x: sz.w - this.offsetPlayer,
        y: sz.h - this.offsetPlayer,
        number: 2,
        collisionGroups
      })
    ];

    this.countDownToStart = new CountDownToStart({
      scene: this,
      onComplete: () => {
        this.startGame();
      }
    });
  }

  startGame() {
    this.players[0].setOpponent(this.players[1]);
    this.players[1].setOpponent(this.players[0]);

    // if matches both conditions, returns regExA matched first
    const getPair = (bodyA, bodyB, regExA, regExB) => {
      if (regExA.test(bodyA.label) && regExB.test(bodyB.label)) {
        return [bodyA, bodyB];
      }

      if (regExB.test(bodyA.label) && regExA.test(bodyB.label)) {
        return [bodyB, bodyA];
      }

      return null;
    };

    this.matter.world.on(
      'collisionstart',
      (event) => {
        // console.log(
        //   'collision',
        //   event.pairs.length,
        //   event.pairs.map((e) => `${e.bodyA.label} - ${e.bodyB.label}`)
        // );

        if (!event.pairs.length) {
          return;
        }

        for (let index = 0; index < event.pairs.length; index++) {
          const element = event.pairs[index];

          const playerHitBodies = getPair(
            element.bodyA,
            element.bodyB,
            playerShootLabelRegEx,
            playerLabelRegEx
          );

          if (playerHitBodies) {
            this.onHitPlayer(...playerHitBodies);
          }

          // const boundsHitBodies = getPair(
          //   element.bodyA,
          //   element.bodyB,
          //   playerShootLabelRegEx,
          //   boundsLabelRegEx
          // );

          // if (boundsHitBodies) {
          //   this.onHitBounds(...boundsHitBodies);
          // }
        }
      },
      this
    );
    this.data.set('endTime', this.time.now + ROUND_TIME);
    this.scene.launch('gui');
    this.started = true;
  }

  endGame() {
    this.started = false;
    this.scene.stop('gui');
    const player1 = this.players[0].data.get('score');
    const player2 = this.players[1].data.get('score');
    this.scene.start('gameover', {
      player1,
      player2,
      winnerColor:
        player1 > player2
          ? this.players[0].data.get('color')
          : player1 < player2
          ? this.players[1].data.get('color')
          : 'white'
    });
  }

  update() {
    if (this.players) {
      this.players.forEach((player) => player.update());

      const pos1 = new Phaser.Math.Vector2(
        this.players[0].player.x,
        this.players[0].player.y
      );

      const pos2 = new Phaser.Math.Vector2(
        this.players[1].player.x,
        this.players[1].player.y
      );

      this.playersCenter.x = (pos1.x + pos2.x) / 2;
      this.playersCenter.y = (pos1.y + pos2.y) / 2;

      this.cameras.main.setZoom(
        Phaser.Math.Linear(
          this.minZoom,
          this.maxZoom,
          1 -
            Phaser.Math.Percent(
              Phaser.Math.Distance.BetweenPoints(pos1, pos2),
              this.minLength,
              this.maxLength
            )
        )
      );
    }

    const endTime = this.data.get('endTime');
    if (this.started && endTime && endTime <= this.time.now) {
      this.endGame();
    }
  }

  onHitPlayer(bullet, playerHit) {
    const hitPlayerNumber = parseInt(
      playerLabelRegEx.exec(playerHit.label)[1],
      10
    );

    const playerPain = this.players.find((p) => p.number === hitPlayerNumber);
    playerPain.setHit();

    const playerScored = hitPlayerNumber === 1 ? 2 : 1;
    const playerScore = this.players.find((p) => p.number === playerScored);
    if (!playerScore) console.warn('player not found for number', playerScored);
    playerScore.data.set(
      'score',
      parseInt(playerScore.data.get('score') || 0, 10) + 1
    );
  }

  // onHitBounds(bullet, bound) {
  //   console.log('onHitBounds', bullet, bound);
  // }
}

export default World;
