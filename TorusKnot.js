import {
    Group,
    Mesh,
    TorusKnotGeometry,
  } from "three";
import { SceneObject } from "./ObjectFactory";

class TorusKnot extends SceneObject {
  constructor(){
    super();
    this.params = {
      radius: 3,
      tube: 0.4,
      p: 4,
      q: 9,
      mult_x: 32,
      mult_y: 3,
      rotation_speed: 0.001,
    };
  }
    async init() {
      if (this.mesh) {
        this.group.remove(this.mesh);
      }
        this.mesh = new Mesh(
            new TorusKnotGeometry(
              this.params.radius,
              this.params.tube,
              300,
              100,
              this.params.p,
              this.params.q
            ),
            this.material
          );
          this.mesh.castShadow = this.mesh.receiveShadow = true;
          const uvs = this.mesh.geometry.attributes.uv;
          for (let i = 0; i < uvs.count; i++) {
              uvs.setXY(i, uvs.getX(i) * this.params.mult_x, uvs.getY(i) * this.params.tube * this.params.mult_y);
          }
          this.mesh.geometry.attributes.uv.needsUpdate = true;
          this.group.add(this.mesh);
    }

    paramGui =  (gui) => {
        gui.add(this.params, "radius", 1, 5).onChange(() => this.init());
        gui.add(this.params, "tube", 0.1, 1.5).onChange(() => this.init());
        gui.add(this.params, "p", 1, 15, 1).onChange(() => this.init());
        gui.add(this.params, "q", 1, 15, 1).onChange(() => this.init());
        gui.add(this.params, "mult_x", 1, 32, 1).onChange(() => this.init());
        gui.add(this.params, "mult_y", 1, 32, 1).onChange(() => this.init());
        gui.add(this.params, "rotation_speed", 0, 0.01, 0.001);
    }

    update = () => {
        this.mesh.rotation.y += this.params.rotation_speed;
    }
}

export { TorusKnot };
