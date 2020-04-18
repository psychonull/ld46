export const random = (min, max) =>
  min + Math.floor((max - min) * Math.random());

export const counter = (init = 0) => () => ++init;
