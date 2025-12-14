import React, { useEffect, useRef, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { HandData } from '../types';

interface HandTrackerProps {
  onHandUpdate: (data: HandData) => void;
}

export const HandTracker: React.FC<HandTrackerProps> = ({ onHandUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [permissionError, setPermissionError] = useState(false);

  useEffect(() => {
    let handLandmarker: HandLandmarker | null = null;
    let animationFrameId: number;

    const setupMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        handLandmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 1
        });
        
        startWebcam();
      } catch (e) {
        console.error("MediaPipe setup failed:", e);
      }
    };

    const startWebcam = async () => {
      if (!videoRef.current) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 } 
        });
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener('loadeddata', () => {
          setLoaded(true);
          predict();
        });
      } catch (err) {
        console.error("Webcam access denied:", err);
        setPermissionError(true);
      }
    };

    const predict = () => {
      if (!handLandmarker || !videoRef.current) return;
      
      const startTimeMs = performance.now();
      if (videoRef.current.videoWidth > 0) {
        const results = handLandmarker.detectForVideo(videoRef.current, startTimeMs);
        
        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];
          // Use Index Finger Tip (8) and Thumb Tip (4) for pinch
          const thumbTip = landmarks[4];
          const indexTip = landmarks[8];
          const wrist = landmarks[0];

          // Center roughly between index and thumb for interaction point
          const centerX = (thumbTip.x + indexTip.x) / 2;
          const centerY = (thumbTip.y + indexTip.y) / 2;
          
          // Calculate pinch distance
          const dx = thumbTip.x - indexTip.x;
          const dy = thumbTip.y - indexTip.y;
          const dz = thumbTip.z - indexTip.z;
          const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
          const pinched = distance < 0.08;

          // Map coordinates to -1 to 1 range (inverse X because webcam is mirrored usually, but MP output depends)
          // MP coords: x: 0 (left) -> 1 (right), y: 0 (top) -> 1 (bottom)
          // ThreeJS screen: x: -1 (left) -> 1 (right), y: 1 (top) -> -1 (bottom)
          const mapX = (centerX - 0.5) * 2 * -1; // Mirror interaction
          const mapY = (centerY - 0.5) * -2;
          
          // Z depth from wrist to estimate "pushing" in
          // MP Z is relative to wrist usually, this is rough. 
          // We can use bounding box area as proxy for depth (closer = bigger)
          
          onHandUpdate({
            x: mapX,
            y: mapY,
            z: 0, 
            pinched,
            detected: true
          });
        } else {
          onHandUpdate({ x: 0, y: 0, z: 0, pinched: false, detected: false });
        }
      }
      animationFrameId = requestAnimationFrame(predict);
    };

    setupMediaPipe();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
      if (handLandmarker) handLandmarker.close();
      cancelAnimationFrame(animationFrameId);
    };
  }, [onHandUpdate]);

  return (
    <div className="fixed top-4 right-4 z-50 opacity-80 border-2 border-blue-500 shadow-[0_0_15px_#3b82f6] w-32 h-24 overflow-hidden bg-slate-950 pointer-events-none rounded-sm">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="w-full h-full object-cover transform -scale-x-100 opacity-60 mix-blend-screen grayscale"
      />
      {!loaded && !permissionError && <div className="absolute inset-0 flex items-center justify-center text-[10px] text-blue-500 animate-pulse">INIT_SENSOR...</div>}
      {permissionError && <div className="absolute inset-0 flex items-center justify-center text-[10px] text-red-500 font-bold bg-black">NO_SIGNAL</div>}
      
      {/* HUD Overlay */}
      <div className="absolute top-0 left-0 w-full h-full border border-blue-500/30">
        <div className="absolute bottom-0 right-0 p-1 text-[8px] text-blue-400 bg-slate-900/80">CAM_01</div>
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-blue-400"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-blue-400"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-blue-400"></div>
      </div>
    </div>
  );
};