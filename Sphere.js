import {
    Group,
    Mesh,
    IcosahedronGeometry,
  } from "three";
import { SceneObject } from "./ObjectFactory";

class Sphere extends SceneObject {
  constructor(){
    super();
  }
    async init() {
      if (this.mesh) {
        this.group.remove(this.mesh);
      }
        this.mesh = new Mesh(
            new IcosahedronGeometry(15, 8),
            this.material
          );
          this.mesh.castShadow = this.mesh.receiveShadow = true;
          const uvs = this.mesh.geometry.attributes.uv;
          for (let i = 0; i < uvs.count; i++) {
              uvs.setXY(i, uvs.getX(i) * 10, uvs.getY(i) * 10);
          }
          this.mesh.geometry.attributes.uv.needsUpdate = true;
          this.group.add(this.mesh);
    }

    paramGui = (gui) => {
    }

}

export { Sphere };