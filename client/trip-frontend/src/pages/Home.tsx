import {useNavigate} from 'react-router-dom';
import {useSearchParams} from 'react-router-dom';
import {useSocket} from '../hooks/useSocket';
import {useState, useEffect} from "react";
import Modal from "../components/Popups/Modal.tsx";
import WelcomePage from "./WelcomePage.tsx";
import Footer from "../components/Footer.tsx";
import {getCookie, setCookie} from "../tools/Cookies.ts";
import { Room } from './Room.tsx';

export const Home = () => {
    const navigate = useNavigate();
    const {socket} = useSocket();
    const [searchParams] = useSearchParams();
    const code = searchParams.get('code');

    const [userName, setUserName] = useState('');
    const [roomName, setRoomName] = useState('');
    const [userJoined, setUserJoined] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleJoinRoom = () => {

        setCookie("username", userName, {expires: 7, path: "/"});
        setCookie("roomName", roomName, {expires: 7, path: "/"});

        if (!userName.trim() || !roomName.trim()) {
            alert("Please enter a valid username and room name!");
            return;
        }
        if (socket) {
            socket.emit("joinRoom", {roomName, username: userName});
        }
        setUserJoined(true);
    };

    // TODO use cookie to get and set user info, so when they come back, they are in the same session/room
    useEffect(() => {
        const savedUsername = getCookie("username");
        const savedRoomName = getCookie("roomName");

        if (savedUsername && savedRoomName) {
            setUserName(savedUsername);
            setRoomName(savedRoomName);
            setUserJoined(true);
        }
    }, []);

    const triggerError = (message: string) => {
        setError(message);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setError(null);
    };

    // event listener for modal event from PlayLists
    useEffect(() => {
        const handleModalError = (event: Event) => {
            const customEvent = event as CustomEvent;
            triggerError(customEvent.detail.message);
        };

        window.addEventListener('modalError', handleModalError);

        return () => {
            window.removeEventListener('modalError', handleModalError);
        };
    }, []);

    // useEffect(() => {
    //     if (userJoined && socket) {
    //         socket.on("userJoined", (updatedUsers: User[]) => {
    //             setJoinedUsers(updatedUsers);
    //         });
    //         socket.on("userLeft", (updatedUsers: User[]) => {
    //             setJoinedUsers(updatedUsers);
    //         });
    //     }

    //     // Cleanup listeners on unmount or if userJoined/socket changes
    //     return () => {
    //         if (socket) {
    //             socket.off("userJoined");
    //             socket.off("userLeft");
    //         }
    //     };
    // }, [userJoined, socket]);

    return (
        <div className="w-screen h-screen">
            {!userJoined ? (
                    <WelcomePage
                        username={userName}
                        setUsername={setUserName}
                        roomName={roomName}
                        setRoomName={setRoomName}
                        handleJoinRoom={handleJoinRoom}
                    />) :
                    <Room 
                        socket={socket} 
                        roomName={roomName} 
                        setUserJoined={setUserJoined}
                        currentUser={{ id: userName, username: userName }}
                    />
            }
            {/* TODO Update Modal for more Error Messages */
            }
            <Modal isOpen={isModalOpen} onClose={closeModal} message={error || "An unknown error occurred."}/>
            <Footer/>
        </div>
    )
        ;
};