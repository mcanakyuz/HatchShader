import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  PCFSoftShadowMap,
} from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.querySelector("canvas");

const renderer = new WebGLRenderer({
  alpha: true,
  canvas,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(window.devicePixelRatio);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;


const scene = new Scene();
const camera = new PerspectiveCamera(90, 1, 0.1, 100);
camera.position.set(6, 6, 5);

const controls = new OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = true;

const resizeFns = [];

function onResize(fn) {
  resizeFns.push(fn);
}

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  for (const fn of resizeFns) {
    fn();
  }
}

window.addEventListener("resize", resize);

export { renderer, scene, camera, resize, onResize };