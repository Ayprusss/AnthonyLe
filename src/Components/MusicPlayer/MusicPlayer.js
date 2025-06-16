import React, {useRef, useState, useEffect} from "react";
import "98.css";
import "./MusicPlayer.css";
import music from "./elevator-to-heaven-aaron-paul-low-main-version-21242-01-42.mp3";
import audioMuted from "./audio-muted.png";
import audioUnmuted from "./audio-unmuted.png";


function MusicPlayer() {
  const audioRef = useRef(null);
  const [isMuted, mute] = useState(true);
  const playMusic = () => {
    changeMute(!isMuted);
    audioRef.current.volume = 0.3;
    audioRef.current.play().catch(error => {
      console.log("Play failed:", error);
    });
  };

  const muteMusic = () => {
    console.log("Muting music.")
    changeMute(!isMuted);
    audioRef.current.volume =0;
  }

  const changeMute = (value) => {
    mute(value);
  }
  return (
    <div className="music-player">
      <audio ref={audioRef} src={music} loop />
      {isMuted ? <img alt="audioMuted"src={audioMuted} onClick={playMusic} className="music-player-icon"/> : <img alt="audioUnmuted" onClick={muteMusic} className="music-player-icon" src={audioUnmuted}/>}
    </div>
  );
}


export default MusicPlayer;