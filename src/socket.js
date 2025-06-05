import { io } from 'socket.io-client';

let socket;

export const initiateSocket = (userId) => {
    if (!socket) {
        socket = io("https://taskback-d1788b8581c9.herokuapp.com", {
            transports: ['websocket'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            if (userId) {
                console.log('Joining room for user:', userId);
                socket.emit('join', userId);
            }
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
        });

    }
    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
