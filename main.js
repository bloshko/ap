import * as THREE from "three";
import "./style.css";

import gamWav from "./assets/gam.wav?url";
import eatingFbx from "./assets/eating.fbx?url";
import eatingMap from "./assets/eating_map.jpg";

import { getObjectScaleVector } from "./utils";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";

const MOUSE_X_SAFE_ZONE_THRESHOLD = 50;

const OBJ = eatingFbx;
const TEXTURE_MAP = eatingMap;
const SOUND = gamWav;

let container;

let camera, scene, renderer, sound, listener, mixer, action;

let mouseX = 0,
  mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

let object;

const clock = new THREE.Clock();

const onClearClick = (event) => {
  event.stopPropagation();
  for (const child of object.children) {
    child.clear();
  }
};

document
  .getElementById("clear-objects")
  .addEventListener("click", onClearClick);

const onSoundClick = (event) => {
  event.stopPropagation();
  if (sound) {
    return sound.isPlaying ? sound.stop() : sound.play();
  }

  listener = new THREE.AudioListener();
  camera.add(listener);

  // create a global audio source
  sound = new THREE.Audio(listener);

  // load a sound and set it as the Audio object's buffer
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load(SOUND, (buffer) => {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.3);
    sound.setPlaybackRate(0.5);
    sound.play();
  });
};

document.getElementById("sound").addEventListener("click", onSoundClick);

const onWindowClick = (event) => {
  const clonedObject = object.clone();

  clonedObject.position.z = THREE.MathUtils.randFloat(-500, 500);
  clonedObject.position.y = THREE.MathUtils.randFloat(-50, 50);
  clonedObject.position.x = THREE.MathUtils.randFloat(-50, 50);

  clonedObject.scale.copy(getObjectScaleVector());
  object.add(clonedObject);
};

const onWindowResize = () => {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
};

const init = () => {
  container = document.getElementById("app");

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    1,
    2000
  );
  camera.position.z = 100;

  // scene

  scene = new THREE.Scene();

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 0.8);
  camera.add(pointLight);

  scene.add(camera);

  // manager

  const loadModel = () => {
    object.traverse((child) => {
      if (child.isMesh) child.material.map = texture;
    });

    object.position.y = 0;
    object.rotateY(1.5);
    scene.add(object);
  };

  const manager = new THREE.LoadingManager(loadModel);

  // texture
  const textureLoader = new THREE.TextureLoader(manager);
  const texture = textureLoader.load(TEXTURE_MAP);

  // model

  const onProgress = (xhr) => {
    if (xhr.lengthComputable) {
      const percentComplete = (xhr.loaded / xhr.total) * 100;
      console.log("model " + Math.round(percentComplete, 2) + "% downloaded");
    }
  };

  const onError = () => {};

  const loader = new FBXLoader(manager);
  loader.load(
    OBJ,
    (obj) => {
      mixer = new THREE.AnimationMixer(obj);
      mixer.timeScale = 2;

      action = mixer.clipAction(obj.animations[0]);
      action.setLoop(THREE.LoopPingPong);
      action.play();

      object = obj;
      window.OOO = obj;
    },
    onProgress,
    onError
  );

  //

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  document.addEventListener("mousemove", onDocumentMouseMove);

  window.addEventListener("resize", onWindowResize);
  window.addEventListener("click", onWindowClick);
};

const onDocumentMouseMove = (event) => {
  mouseX = (event.clientX - windowHalfX) / 2;
  mouseY = (event.clientY - windowHalfY) / 2;
};

const animate = () => {
  requestAnimationFrame(animate);
  render();
};

const render = () => {
  const absMouseX = Math.abs(mouseX);

  if (object) {
    object.rotateY((absMouseX * 0.05 + 0.2) * 0.03);
  }

  if (sound) {
    sound.setPlaybackRate(absMouseX * 0.01 + 0.5);
  }

  if (mixer) {
    const delta = clock.getDelta();
    mixer.update(delta * absMouseX * 0.005 + 0.005);
  }

  camera.lookAt(scene.position);

  renderer.render(scene, camera);
};

init();
animate();
