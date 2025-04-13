import { Socket, Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { User } from './types/user';
import { RoomInfo } from './types/room';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

export default function initSockets(httpServer: HTTPServer) {
    const rooms: Record<string, RoomInfo> = {};

    const io = new Server(httpServer, {
        cors: {
            origin: CLIENT_URL,
            methods: ["GET", "POST"],
            credentials: true,
            allowedHeaders: ["my-custom-header"],
        },
        allowEIO3: true
    });

    const roomExist = (roomName : string) : boolean => {
        return rooms[roomName] != null;
    }

    const createAndJoinRoom = (roomName: string, socket : Socket) => {
        if(!roomExist(roomName)){
            rooms[roomName] = new RoomInfo(roomName);
        }

        if(rooms[roomName].requiresPassword){
            promptPassword();
        }

        socket.join(roomName);
    }

    const addUserToRoom = (socketId : string, roomName : string, username : string) => {
        const room = rooms[roomName];

        if(room.userExist(username)){
            promptChangeUserName();
        }

        const newUser = new User(socketId, username)
        room.addUserToRoom(newUser)
        // userList.set(socketId, username);
    }

    const promptPassword = () => {
        //TODO 
    }

    const promptChangeUserName = () => {
        //TODO 
    }

    const disconnectUserFromRoom = (roomName : string, username : string, io : Server ) => {
        rooms[roomName].removeUser(username);
        io.emit("userLeft", [...rooms[roomName].getUsers.keys()]);
    }
    
    io.on('connection', (socket) => {
    
        socket.on('joinRoom', ({roomName, username} : {roomName : string; username : string}) => {

            createAndJoinRoom(roomName, socket);
            addUserToRoom(socket.id, roomName, username);

            io.to(roomName).emit('joinRoom', roomName);
            io.to(roomName).emit('userJoined', [...rooms[roomName].getUsers.keys()]);
    
            socket.on("disconnect", () => {
                disconnectUserFromRoom(roomName, username, io);
                socket.leave(roomName);
            })
    
            socket.on("exitRoom", (roomName: string) => {
                disconnectUserFromRoom(roomName, username, io);
                socket.leave(roomName);
            })
        });
    
        socket.on("getUserNames", (roomName: string, callback: (users: string[]) => void) => {
            if (rooms[roomName]) {
                const userNames : Map<string, User> = rooms[roomName].getUsers; 
                callback([...userNames.keys()]);
            } else {
                console.log("No users in the room");
                callback([]);
            }
        })
    });
}
