import { reactive } from "vue";
import { io } from "socket.io-client";

export const state = reactive({
  connected: false,
  connectedUsers: 0,
  fooEvents: [],
  barEvents: []
});

const socket = io("http://localhost:3000");

// "undefined" means the URL will be computed from the `window.location` object
export default socket;

socket.on("connect", () => {
  state.connected = true;

});

socket.on("disconnect", () => {
  state.connected = false;
});



