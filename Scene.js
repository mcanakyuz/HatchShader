import { TorusKnot as TorusObject} from "./TorusKnot.js";
import { Sphere as SphereObject } from "./Sphere.js";
import { ParametricGeo as ParamGeoObject } from "./ParametricGeo.js";
import { DirectionalLight, AmbientLight, PointLight } from "three";

function initLights(scene, gui) {
  const lightFolder = gui.addFolder("Lights");
  lightFolder.open();
  const dirLights = [];
  const pointLights = [];
  const ambientLights = [];

  function addDirLight() {
    const light = new DirectionalLight(0xffffff, 2.5);
    light.position.set(0, 1, 1);
    scene.add(light);
    dirLights.push(light);

    const lightIndex = dirLights.length - 1;
    const dirlightFolder = lightFolder.addFolder(
      `Directional Light ${lightIndex + 1}`
    );
    dirlightFolder.add(light, "intensity", 0, 10).name("Intensity");
    dirlightFolder.add(light.position, "x", -10, 10).name("Position X");
    dirlightFolder.add(light.position, "y", -10, 10).name("Position Y");
    dirlightFolder.add(light.position, "z", -10, 10).name("Position Z");
    dirlightFolder.open();
  }

  addDirLight();
  lightFolder.add({ addDirLight }, "addDirLight").name("Add Directional Light");

  function addAmbientLight() {
    const light = new AmbientLight(0x1a1a1a);
    scene.add(light);
    ambientLights.push(light);

    const lightIndex = ambientLights.length - 1;
    const alightFolder = lightFolder.addFolder(
      `Ambient Light ${lightIndex + 1}`
    );
    alightFolder.add(light, "intensity", 0, 1).name("Intensity");
    alightFolder
      .addColor({ color: light.color.getHex() }, "color")
      .name("Color")
      .onChange((v) => {
        light.color.set(v);
      });
    alightFolder.open();
  }

  addAmbientLight();

  lightFolder
    .add({ addAmbientLight }, "addAmbientLight")
    .name("Add Ambient Light");

  function addPointLight() {
    const light = new PointLight(0xffffff, 1);
    light.distance = 10;
    light.decay = 5;
    light.power = 70;
    scene.add(light);
    pointLights.push(light);

    const lightIndex = pointLights.length - 1;
    const plightFolder = lightFolder.addFolder(`Point Light ${lightIndex + 1}`);
    plightFolder.add(light, "intensity", 0, 50).name("Intensity");
    plightFolder.add(light.position, "x", -10, 10).name("Position X");
    plightFolder.add(light.position, "y", -10, 10).name("Position Y");
    plightFolder.add(light.position, "z", -10, 10).name("Position Z");
    plightFolder.add(light, "distance", 2, 16).name("Distance");
    plightFolder.add(light, "decay", 0, 10).name("Decay");
    plightFolder.add(light, "power", 10, 100).name("Power");
    plightFolder
      .addColor({ color: light.color.getHex() }, "color")
      .name("Color")
      .onChange((v) => {
        light.color.set(v);
      });
    plightFolder.open();
  }

  lightFolder.add({ addPointLight }, "addPointLight").name("Add Point Light");
}

const objects = {
  sphere: { obj: new SphereObject(), init: false },
  torus: { obj: new TorusObject(), init: false },
  paramGeo: { obj: new ParamGeoObject(), init: false },
};
const controllers = {};
function initObjects(scene, material, gui) {
  const params = {};
  const folder = gui.addFolder("Scene");
  folder.open();

  for (const key of Object.keys(objects)) {
    params[key] = false;
    const controller = folder.add(params, key).onChange(async (visible) => {
      if (!objects[key].init) {
        objects[key].obj.setMaterial(material);
        await objects[key].obj.init();
        objects[key].obj.addToScene(scene);
        objects[key].init = true;
      }
      objects[key].obj.group.visible = visible;
    });
    controllers[key] = controller;
    objects[key].obj.paramGui(folder);
  }
  controllers["torus"].setValue(true);

}

async function initScene(scene, material, gui) {
  initLights(scene, gui); 
  initObjects(scene, material, gui);
}

function update() {
  for (const key of Object.keys(objects)) {
    if (objects[key].obj) {
      objects[key].obj.update();
    }
  }
}
export { initScene, update };
