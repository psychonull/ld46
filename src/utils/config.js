import configs from '/configs.js';

const mappings = [
  { selector: '#cTime', propName: 'time' },
  { selector: '#cPlayerSpeed', propName: 'playerSpeed' },
  { selector: '#cMaxBullets', propName: 'maxBullets' },
  { selector: '#cBulletSpeed', propName: 'bulletSpeed' },
  { selector: '#cBulletSpeed', propName: 'bulletSpeed' },
  { selector: '#cReloadTime', propName: 'reloadTime' },
  { selector: '#cBulletTimeMultiplier', propName: 'bulletTimeMultiplier' },
  { selector: '#cCanShootWhenBlocked', propName: 'canShootWhenBlocked' }
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

  setTimeout(() => window.location.reload(), 1000);
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
    const ele = document.querySelector(mapping.selector);
    const value = config[mapping.propName];

    switch (ele.type) {
      case 'checkbox':
        ele.checked = value;
        break;
      default:
        ele.value = value;
        break;
    }
  });
};

export const formToConfig = () => {
  return mappings.reduce((a, b) => {
    const ele = document.querySelector(b.selector);
    let value;

    switch (ele.type) {
      case 'number':
        value = Number(ele.value);
        break;
      case 'checkbox':
        value = ele.checked;
        break;
      default:
        value = ele.value;
        break;
    }

    return {
      ...a,
      [b.propName]: value
    };
  }, {});
};
