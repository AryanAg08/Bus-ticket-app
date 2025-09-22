import { io } from "socket.io-client";


const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "https://bus-booking-app-latest.onrender.com/";
export const socket = io(SOCKET_URL, {
autoConnect: true,
});