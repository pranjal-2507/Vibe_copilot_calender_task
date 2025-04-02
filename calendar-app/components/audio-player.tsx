// "use client";

// import created_audio from "./created-audio.wav";
// import { useRef, useEffect } from "react";

// export function useAudioPlayer() {
//   const audioRef = useRef<HTMLAudioElement | null>(null);

//   useEffect(() => {
//     // Ensure Audio object is only created on the client-side
//     if (typeof window !== "undefined") {
//       audioRef.current = new Audio(created_audio);
//     }
//   }, []);

//   const playSound = () => {
//     if (audioRef.current) {
//       audioRef.current.pause();
//       audioRef.current.currentTime = 0;
//       audioRef.current
//         .play()
//         .catch((error) => console.warn(`Sound playback failed: ${error.message}`));
//     }
//   };

//   return { playSound };
// }

// export default function AudioPlayer() {
//   const { playSound } = useAudioPlayer();

//   return (
//     <div>
//       <button onClick={playSound}>Play Sound</button>
//     </div>
//   );
// }