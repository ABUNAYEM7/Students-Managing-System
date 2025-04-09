import { io } from "socket.io-client";

const socket = io("http://localhost:3000"); // use your actual backend URL in prod
export default socket;