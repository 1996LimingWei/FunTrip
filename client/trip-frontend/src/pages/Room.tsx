import AudioPlayer from "../components/AudioPlayer"
import CurrentSongQueue from "../components/CurrentSongQueue"
import PlayLists from "../components/PlayLists"
import TextInput from "../components/TextInput"
import JoinedUsers from "../components/Users/JoinedUsers"
import { Socket } from 'socket.io-client';
import { User } from '../types/index.ts';
import { useState, useEffect } from "react"
import { useSpotifyAuth } from "../spotify/SpotifyAuthCode.ts"; 

interface RoomProps {
    socket: Socket;
    roomId: string;
    setUserJoined: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Room: React.FC<RoomProps> = ({ socket, roomId, setUserJoined }) => {
    const [currentQueue, setCurrentQueue] = useState<SpotifyApi.PlaylistTrackObject[]>([]);
    const code = new URLSearchParams(window.location.search).get("code") || "";
    const accessToken = useSpotifyAuth(code);

    const handleAddToQueue = (selectedTracks: SpotifyApi.PlaylistTrackObject[]) => {
        setCurrentQueue((prev) => [...prev, ...selectedTracks]);
    };

    return (
        <div className="w-screen flex h-screen">
            <JoinedUsers socket={socket} roomName={roomId} setUserJoined={setUserJoined} />
            <div className="flex-1 flex flex-col justify-between">
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-2">Room name</h1>
                    <AudioPlayer songs={currentQueue} accessToken={accessToken} />
                    <CurrentSongQueue songs={currentQueue} />
                </div>
                <div className="flex justify-center pb-4 px-4">
                    <div className="w-full">
                        <TextInput />
                    </div>
                </div>
            </div>
            <PlayLists handleAddToQueue={handleAddToQueue} accessToken={accessToken} />
        </div>
    );
};