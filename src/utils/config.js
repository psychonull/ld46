import configs from '/configs.js';

const mappings = [
  { selector: '#cTime', propName: 'time' },
  { selector: '#cPlayerSpeed', propName: 'playerSpeed' },
  { selector: '#cMaxBullets', propName: 'maxBullets' },
  { selector: '#cBulletSpeed', propName: 'bulletSpeed' },
  { selector: '#cReloadTime', propName: 'reloadTime' }
];

const KEY = 'ld46config';

export const loadConfig = () => {
  if (!localStorage.getItem(KEY)) {
    return configs[0];
  }
  console.log(JSON.parse(localStorage.getItem(KEY)));
  return JSON.parse(localStorage.getItem(KEY));
};

export const saveConfig = (config) => {
  localStorage.setItem(
    KEY,
    JSON.stringify({
      ...config,
      name: 'custom'
    })
  );
};

export const presetsToForm = (configs) => {
  const list = document.getElementById('preset-list');
  configs.forEach((config) => {
    const li = document.createElement('li');
    const anchor = document.createElement('a');
    anchor.innerText = config.name;
    anchor.href = '#';
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      configToForm(config);
    });
    li.append(anchor);
    list.append(li);
  });
};

export const configToForm = (config) => {
  mappings.forEach((mapping) => {
    document.querySelector(mapping.selector).value = config[mapping.propName];
  });
};

export const formToConfig = () => {
  return mappings.reduce(
    (a, b) => ({
      ...a,
      [b.propName]: Number(document.querySelector(b.selector).value)
    }),
    {}
  );
};
