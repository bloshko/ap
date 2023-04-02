import * as THREE from "three";
import "./style.css";

import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import apObj from "./assets/ap.obj?url";
import apMap from "./assets/ap_map.jpg";
import { getObjectScaleVector } from "./utils";

let container;

let camera, scene, renderer;

let mouseX = 0,
  mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

let object;

const onWindowClick = (event) => {
  const clonedObject = object.clone();
  clonedObject.position.z = THREE.MathUtils.randFloat(-6, -2);
  clonedObject.position.y = THREE.MathUtils.randFloat(-2, 2);
  clonedObject.position.x = THREE.MathUtils.randFloat(-2, 2);

  console.log(getObjectScaleVector());
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
  camera.position.z = 1.3;

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
  const texture = textureLoader.load(apMap);

  // model

  const onProgress = (xhr) => {
    if (xhr.lengthComputable) {
      const percentComplete = (xhr.loaded / xhr.total) * 100;
      console.log("model " + Math.round(percentComplete, 2) + "% downloaded");
    }
  };

  const onError = () => {};

  const loader = new OBJLoader(manager);
  loader.load(
    apObj,
    (obj) => {
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
  object.rotateY(mouseX * 0.001 + 0.005);
  object.rotateZ(0.005);

  camera.lookAt(scene.position);

  renderer.render(scene, camera);
};

init();
animate();
