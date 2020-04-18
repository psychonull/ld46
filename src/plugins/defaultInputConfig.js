export const defaultKeyboardConfig = [
  {
    up: 'W',
    down: 'S',
    left: 'A',
    right: 'D',
    projectile_left: 'F',
    projectile_right: 'H',
    projectile_previous: 'T',
    projectile_next: 'G',
    projectile_shoot: 'J'
  },
  {
    up: 38,
    down: 40,
    left: 37,
    right: 39,
    projectile_left: 97,
    projectile_right: 99,
    projectile_previous: 101,
    projectile_next: 98,
    projectile_shoot: 102
  }
];

// [B = BUTTON | A = AXIS] + INDEX + SIGN(optional, ignores other sign values)
export const defaultGamepadConfig = {
  up: 'A1-',
  down: 'A1+',
  left: 'A0-',
  right: 'A0+',
  projectile_left: 'A2-',
  projectile_right: 'A2+',
  projectile_previous: 'B4',
  projectile_next: 'B5',
  projectile_shoot: 'B7'
};
