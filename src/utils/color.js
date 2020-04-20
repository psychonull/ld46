import Phaser from 'phaser';

export const getStringColor = (dataColor) =>
  typeof dataColor === 'number'
    ? Phaser.Display.Color.IntegerToColor(dataColor).rgba
    : dataColor;
