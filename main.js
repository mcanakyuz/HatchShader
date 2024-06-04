import { Vector2, DoubleSide } from "three";
import { SketchMaterial, shaderGui } from "./SketchMaterial.js";
import * as dat from "dat.gui";
import { initScene, update } from "./Scene.js";
import { renderer, scene, camera, resize } from "./renderer.js";
import {
  LineTextureGenerator,
  LineHatchTextureGenerator,
  RandomLineTextureGenerator,
  PremadeTextureGenerator,
} from "./HatchMaster.js";

const gui = new dat.GUI();
const shaderFolder = gui.addFolder("Shader");
shaderFolder.open();

const material = new SketchMaterial({
  color: 0xffffff,
  roughness: 0.9,
  metalness: 0.05,
  side: DoubleSide,
});

shaderGui(shaderFolder, material);

const textureGenerators = {
  "Line Texture": new LineTextureGenerator(),
  "Line Hatch Texture": new LineHatchTextureGenerator(),
  "Random Line Texture": new RandomLineTextureGenerator(),
  "Premade Texture": new PremadeTextureGenerator(),
};

let currentTextureGenerator = "Line Texture";

const generatorController = gui.add(
  { generator: currentTextureGenerator },
  "generator",
  Object.keys(textureGenerators)
);
generatorController.onChange(async (newGenerator) => {
  currentTextureGenerator = newGenerator;
  textureGenerators[currentTextureGenerator].initTextures(gui);
  material.params.textures =
    textureGenerators[currentTextureGenerator].textures;
  console.log(`Switched to ${newGenerator}`);
});

const tmp = new Vector2();
function render() {
  update();
  textureGenerators[currentTextureGenerator].updatePreview("previewCanvas");
  renderer.getSize(tmp);
  tmp.multiplyScalar(window.devicePixelRatio);
  material.uniforms.resolution.value.copy(tmp);
  renderer.render(scene, camera);
  renderer.setAnimationLoop(render);
}

async function init() {
  textureGenerators[currentTextureGenerator].initTextures(gui);
  material.params.textures =
    textureGenerators[currentTextureGenerator].textures;
  await initScene(scene, material, gui);
  resize();
  render();
}

init();
