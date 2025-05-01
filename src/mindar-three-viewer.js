import React, { useEffect, useRef } from 'react';
import { MindARThree } from 'mind-ar/dist/mindar-image-three.prod.js';
import * as THREE from 'three';

const NETLIFY_URL = 'https://sunny-dolphin-85c5be.netlify.app/';
const targets = [
  { name: 'lion', target: 'lionhead.mind', video: 'lionhead.mp4' },
  { name: 'bee', target: 'bee.mind', video: 'bee.mp4' },
  { name: 'elephant', target: 'elephant.mind', video: 'elephant.mp4' },
];


const MindARViewer = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const setupTarget = async (entry) => {

      const mindarThree = new MindARThree({
        container: containerRef.current,
        imageTargetSrc: NETLIFY_URL + entry.target,
        uiLoading: false,
        uiScanning: false,
        uiError: false,
      });

      const { renderer, scene, camera } = mindarThree;

      const video = document.createElement("video");
      video.src = NETLIFY_URL + entry.video;
      video.crossOrigin = "anonymous";
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;

      video.addEventListener("loadeddata", () => {
        const texture = new THREE.VideoTexture(video);
        const videoAspect = video.videoHeight / video.videoWidth;
        const geometry = new THREE.PlaneGeometry(1, videoAspect);
        const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
        const plane = new THREE.Mesh(geometry, material);

        const anchor = mindarThree.addAnchor(0);
        anchor.group.add(plane);

        mindarThree.start();
        video.play();

        renderer.setAnimationLoop(() => {
          renderer.render(scene, camera);
        });
      });

      return () => {
        mindarThree.stop();
        renderer.setAnimationLoop(null);
        video.pause();
      };
    };

    const cleanups = targets.map(setupTarget);

    return () => {
      cleanups.forEach(cleanup => cleanup && cleanup());
    };
  }, []);

  return <div
    ref={containerRef}
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 0,
    }}
  />;
};

export default MindARViewer;
