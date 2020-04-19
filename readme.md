# LD46 

> ramp up with [phaser3-parcel-template](https://github.com/ourcade/phaser3-parcel-template) < More info there

## Getting Started

```bash
npm install
```

Start development server:

```
npm run start
```

To create a production build:

```
npm run build
```

Production files will be placed in the `dist` folder. Then upload those files to a web server. 🎉

----

## Peer

Run each of these

```
npm run start:host
```

```
npm run start:client
```

Open browser on one using console paste the id in the other under
http://localhost:80001
http://localhost:80002/?sid=[from-the-host]

### Start Peer server locally

```
npm install peer -g
peerjs --port 9000 --key peerjs --path /ld46
```

