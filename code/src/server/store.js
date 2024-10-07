import { createStore } from 'vuex';
import { io } from 'socket.io-client';

export default createStore({
  state: {
    socket: null, // Socket instance
    canAccessWorkSpace: false
  },
  mutations: {
    setSocket(state, socket) {
      state.socket = socket;
    },
    allowWorkSpaceAccess(state) {
      state.canAccessWorkSpace = true;
    },
    denyWorkSpaceAccess(state) {
      state.canAccessWorkSpace = false;
    },
  },
  actions: {
    initializeSocket({ commit }) {
      return new Promise((resolve, reject) => {
        const socket = io('http://localhost:3000');
        //const socket = io('https://145.38.195.127');
        socket.on('connect', () => {
          console.log('WebSocket Connected');
          commit('setSocket', socket);
          resolve(socket);
        });


        socket.on('connect_error', (error) => {
          console.error('WebSocket Connection Error:', error);
          reject(error);
        });
      });
    },
  allowWorkSpaceAccess({ commit }) {
    commit('allowWorkSpaceAccess');
  },
  denyWorkSpaceAccess({ commit }) {
    commit('denyWorkSpaceAccess');
  },
  },
});
