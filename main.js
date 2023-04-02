import * as THREE from "three";
import "./style.css";

import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import apObj from "./assets/ap.obj?url";
import apMap from "./assets/ap_map.jpg";

let container;

let camera, scene, renderer;

let mouseX = 0,
  mouseY = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

let object;

init();
animate();

function init() {
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

  function loadModel() {
    object.traverse(function (child) {
      if (child.isMesh) child.material.map = texture;
    });

    object.position.y = 0;
    object.scale.set(90, 90, 90);
    object.rotateY(1.5);
    scene.add(object);
  }

  const manager = new THREE.LoadingManager(loadModel);

  // texture
  const textureLoader = new THREE.TextureLoader(manager);
  const texture = textureLoader.load(apMap);

  // model

  function onProgress(xhr) {
    if (xhr.lengthComputable) {
      const percentComplete = (xhr.loaded / xhr.total) * 100;
      console.log("model " + Math.round(percentComplete, 2) + "% downloaded");
    }
  }

  function onError() {}

  const loader = new OBJLoader(manager);
  loader.load(
    apObj,
    function (obj) {
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
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
  mouseX = (event.clientX - windowHalfX) / 2;
  mouseY = (event.clientY - windowHalfY) / 2;
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  // camera.position.x += (mouseX - camera.position.x) * 1;
  // camera.position.y += (-mouseY - camera.position.y) * 1;

  object.rotateY(mouseX * 0.01 + 0.005);
  object.rotateZ(0.005);
  // object.rotateX(mouseX * 0.1 - 0.005);

  camera.lookAt(scene.position);

  renderer.render(scene, camera);
}
