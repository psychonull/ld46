export default [
  {
    name: 'Normal',
    time: 60,
    maxBullets: 3,
    bulletSpeed: 4,
    playerSpeed: 3,
    reloadTime: 350,
    bulletTimeMultiplier: 1.5,
    canShootWhenBlocked: true
  },
  {
    name: 'Action',
    time: 60,
    maxBullets: 50,
    bulletSpeed: 10,
    playerSpeed: 8,
    reloadTime: 100,
    bulletTimeMultiplier: 0,
    canShootWhenBlocked: false
  },
  {
    name: 'Strategy',
    time: 60,
    maxBullets: 2,
    bulletSpeed: 4,
    playerSpeed: 5,
    reloadTime: 500,
    bulletTimeMultiplier: 2,
    canShootWhenBlocked: false
  }
];
