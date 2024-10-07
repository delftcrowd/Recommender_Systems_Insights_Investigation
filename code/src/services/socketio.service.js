import { io } from 'socket.io-client';

class SocketioService {
  socket;
  constructor() {
    this.socket.on('online users broadcast', (data) =>{
      console.log("In client, I know we have" + data + " online users");
    })
  }

  setupSocketConnection() {
    this.socket = io(process.env.VUE_APP_SOCKET_ENDPOINT);

  }


}

export default new SocketioService();