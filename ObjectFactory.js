import {
    Group,
} from "three";


class SceneObject {
    constructor(material) {
        this.group = new Group();
        this.material = null;
        this.mesh = null;
        this.params = {};
        this.object;
        this.material;
    }

    async init() {}
    setMaterial = (material) => {
        this.material = material;
    }
    paramGui = (gui) => {}
    update = () => {}
    addToScene = (scene) => {
        scene.add(this.group);
    }
}


export { SceneObject };