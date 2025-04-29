import React, {useRef, useState, useEffect} from "react";
import "98.css";
import "./MusicPlayer.css";
import music from "./elevator-to-heaven-aaron-paul-low-main-version-21242-01-42.mp3";
import audioMuted from "./audio-muted.png";
import audioUnmuted from "./audio-unmuted.png";


function MusicPlayer() {

    const audioRef = useRef(null);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = 0.3;
            audioRef.current.play().catch(error => {
                console.log("error playing audio:", error);
            });
        }
    }, []);
    
    const handleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    return(
        <div className="music-player">
            <audio ref={audioRef} src={music} loop />
            <button className="music-player-button" onClick={handleMute}>
                {isMuted ? <img alt="audioMuted"src={audioMuted} className="music-player-icon"/> : <img alt="audioUnmuted" className="music-player-icon" src={audioUnmuted}/>}
            </button>
        </div>
    );
}


export default MusicPlayer;