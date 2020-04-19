import Peer from 'peerjs';

const config = {
  // Uncomment for local server
  // host: 'localhost',
  // port: 9000
};

export const createHost = () =>
  new Promise((resolve, reject) => {
    const peer = new Peer(null, config);

    let conn;

    const ready = () => {
      conn.on('data', (data) => {
        console.log(data);
      });

      conn.on('close', () => {
        console.log('Connection reset<br>Awaiting connection...');
        conn = null;
      });

      resolve(conn); // << this is the interface (ie conn.send())
    };

    peer.on('open', (id) => {
      console.log('ID: ', id);
      console.log('Awaiting connection...');
    });

    peer.on('connection', (c) => {
      console.log('Connection! ' + c);
      // Allow only a single connection
      if (conn) {
        c.on('open', () => {
          c.send('Already connected to another client');

          setTimeout(() => {
            c.close();
          }, 500);
        });

        return;
      }

      conn = c;

      console.log('Connected to: ' + conn.peer);
      ready();
    });

    peer.on('disconnected', () => {
      console.log('Connection lost. Please reconnect');
      peer.reconnect();
    });

    peer.on('close', () => {
      conn = null;
      console.log('Connection destroyed');
    });

    peer.on('error', (err) => {
      console.log(err);
      reject(err);
    });
  });

export const connectToHost = (id) =>
  new Promise((resolve, reject) => {
    if (!id) throw new Error('connectToHost: expected a peer id');

    console.log('Connecting to ' + id + ' ...');
    const peer = new Peer(id, config);

    peer.on('open', () => {
      console.log('Connected to: ' + conn.peer);

      const conn = peer.connect(id, {
        // reliable: true
      });

      // if (conn) {
      //   conn.close();
      // }

      // conn.send('hi???!');

      conn.on('data', (data) => {
        console.log('receive data: ', data);
      });

      conn.on('close', () => {
        reject();
      });

      resolve(conn);
      conn.send('hi!');
    });
  });
