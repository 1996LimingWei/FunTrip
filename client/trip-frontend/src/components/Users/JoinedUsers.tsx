import React, { useEffect, useState } from "react";
import { Socket } from 'socket.io-client';
import { User } from '../../types/index';
import { getCookie, removeCookie } from "../../tools/Cookies";

interface JoinedUsersProps {
    roomName: string;
    socket: Socket;
    setUserJoined: React.Dispatch<React.SetStateAction<boolean>>;
    currentUser: User;
}

const JoinedUsers: React.FC<JoinedUsersProps> = ({ roomName, socket, setUserJoined, currentUser }) => {
    const [joinedUser, setJoinedUsers] = useState<User[]>([]);

    /** 
     * Why cookies are used? 
    Retain user session saved in cookies
    So if user refreshes/redirect back to our main application, they are still in the same room
    
    We also have to rejoin the room, because everytime the web refreshes, it will generate a new socket
    */
    useEffect(() => {
        const savedUserName = getCookie("username");
        const savedRoomName = getCookie("roomName");

        socket.emit("joinRoom", { roomName: savedRoomName, username: savedUserName });
    }, []);

    // listen and update for userJoined and userLeft events
    useEffect(() => {
        if (socket) {
            socket.on("userJoined", (updatedUserNames: string[]) => {
                setJoinedUsers(updatedUserNames.map(username => ({ id: username, username })));
            });
            socket.on("userLeft", (updatedUserNames: string[]) => {
                setJoinedUsers(updatedUserNames.map(username => ({ id: username, username })));
            });
        }

        // Cleanup listeners on unmount or if userJoined/socket changes
        return () => {
            if (socket) {
                socket.off("userJoined");
                socket.off("userLeft");
            }
        };
    }, [socket]);

    const handleUserLeave = () => {
        // cleaning up auth code in the URL
        window.history.pushState({}, "", "/");

        setUserJoined(false);

        removeCookie("username");
        removeCookie("roomName");
        
        socket.emit("exitRoom", roomName);
        socket.emit("getUserNames", roomName, (userNames: string[]) => {
            setJoinedUsers(userNames.map(username => ({ id: username, username })));
        });
    };

    return (
        <aside className="w-64 h-screen bg-gray-50 p-4 overflow-y-auto border-r">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <span className="font-semibold text-2xl text-gray-700">
                        <a href="#" className="font-semibold text-2xl text-gray-700 no-underline hover:text-gray-900">
                            Karaoke King
                        </a>
                    </span>
                </div>
                <div>
                    <i
                        className="fas fa-sign-out-alt text-gray-600"
                        title="Leave Room"
                        onClick={handleUserLeave}
                    ></i>
                </div>
            </div>
            <h3>Welcome to room {roomName}</h3>
            <nav>
                <ul>
                    {joinedUser.map((user, idx) => (
                        <li 
                            key={idx} 
                            className={`py-2 px-4 text-sm hover:bg-gray-200 rounded ${
                                user.username === currentUser.username ? "bg-orange-100 text-orange-600 font-medium" : "text-gray-700"
                            }`}
                        >
                            {user.username}
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default JoinedUsers;