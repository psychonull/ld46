import Phaser from 'phaser';
import {
  defaultKeyboardConfig,
  defaultGamepadConfig
} from './defaultInputConfig';

const processGamepadValue = (gamepad, path) => {
  // eslint-disable-next-line no-unused-vars
  const [_, type, index, sign] = /(A|B)(\d)(-|\+)?/.exec(path);
  if (type === 'B') {
    return gamepad.buttons[index].value;
  } else {
    const axisValue = gamepad.axes[index].getValue();
    if (sign) {
      const multiplier = sign === '-' ? -1 : 1;
      return Math.max(axisValue * multiplier, 0);
    }
    return axisValue;
  }
};

export default class InputManager extends Phaser.Plugins.ScenePlugin {
  constructor(scene, pluginManager) {
    super(scene, pluginManager);
    this.scene = scene;
    this.players = [];
  }

  boot() {
    var eventEmitter = this.systems.events;
    eventEmitter.on('update', this.update, this);
    this.initKeyboard();
    if (this.systems.input.gamepad) {
      this.systems.input.gamepad.once(
        'connected',
        function () {
          this.initGamepads();
        },
        this
      );
      this.gamepads = this.systems.input.gamepad.gamepads;
    }
  }

  update() {
    this.updatePlayers();
  }

  initKeyboard() {
    this.players = defaultKeyboardConfig.map((cfg, index) => {
      return {
        keys: Object.keys(cfg).reduce(
          (a, b) => ({
            ...a,
            [b]: this.systems.input.keyboard.addKey(
              Phaser.Input.Keyboard.KeyCodes[cfg[b]] || cfg[b]
            )
          }),
          {}
        ),
        index,
        get: function (alias) {
          return this.keys[alias].isDown;
        },
        getAny: function () {
          return Object.keys(cfg).some((alias) => this.get(alias));
        }
      };
    });
  }

  initGamepads() {
    if (!this.systems.input.gamepad || this.systems.input.gamepad.total === 0) {
      return;
    }
    this.players.forEach((player, index) => {
      player.gamepadConfig = defaultGamepadConfig;
      player.gamepad =
        this.systems.input.gamepad &&
        this.systems.input.gamepad.gamepads[index];
      player.get = function (alias) {
        const keyboardValue = this.keys[alias].isDown ? 1 : 0;
        let gamepadValue = null;
        if (this.gamepad) {
          gamepadValue = processGamepadValue(
            this.gamepad,
            this.gamepadConfig[alias]
          );
        }
        return keyboardValue || gamepadValue;
      };
      player.getAny = function () {
        return Object.keys(player.gamepadConfig).some((alias) =>
          player.get(alias)
        );
      };
    });
  }

  updatePlayers() {}
}
