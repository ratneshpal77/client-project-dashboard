import { io, type Socket } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "http://localhost:5000";

let socket: Socket | null = null;



export const connectSocket = (
  accessToken: string,
): Socket => {
  // Already connected with current socket
  if (socket) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token: accessToken,
    },

    withCredentials: true,

    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log(
      "Socket connected:",
      socket?.id,
    );
  });

  socket.on("connect_error", (error) => {
    console.error(
      "Socket connection error:",
      error.message,
    );
  });

  socket.on("disconnect", (reason) => {
    console.log(
      "Socket disconnected:",
      reason,
    );
  });

  return socket;
};



export const getSocket = (): Socket | null => {
  return socket;
};


export const disconnectSocket =
  (): void => {
    if (!socket) {
      return;
    }

    socket.disconnect();
    socket = null;
  };