import { Group, Mesh } from "three";

import { ParametricGeometry } from "three/addons/geometries/ParametricGeometry";
import { SceneObject } from "./ObjectFactory";
const pi = Math.PI;



function rotateVector(u, v, a) {


  const cospiu = Math.cos(pi * u);
  const sinpiu = Math.sin(pi * u);

  const cos2piv = Math.cos(2 * pi * v);
  const sin2piv = Math.sin(2 * pi * v);
  const Rz = [
    [1, 0, 0],
    [0, cospiu, sinpiu],
    [0, -sinpiu, cospiu],
  ];

  const Ry = [
    [cos2piv, sin2piv, 0],
    [-sin2piv, cos2piv, 0],
    [0, 0, 1],
  ];

  let RzRy = [
    [
      Rz[0][0] * Ry[0][0] + Rz[0][1] * Ry[1][0] + Rz[0][2] * Ry[2][0],
      Rz[0][0] * Ry[0][1] + Rz[0][1] * Ry[1][1] + Rz[0][2] * Ry[2][1],
      Rz[0][0] * Ry[0][2] + Rz[0][1] * Ry[1][2] + Rz[0][2] * Ry[2][2],
    ],
    [
      Rz[1][0] * Ry[0][0] + Rz[1][1] * Ry[1][0] + Rz[1][2] * Ry[2][0],
      Rz[1][0] * Ry[0][1] + Rz[1][1] * Ry[1][1] + Rz[1][2] * Ry[2][1],
      Rz[1][0] * Ry[0][2] + Rz[1][1] * Ry[1][2] + Rz[1][2] * Ry[2][2],
    ],
    [
      Rz[2][0] * Ry[0][0] + Rz[2][1] * Ry[1][0] + Rz[2][2] * Ry[2][0],
      Rz[2][0] * Ry[0][1] + Rz[2][1] * Ry[1][1] + Rz[2][2] * Ry[2][1],
      Rz[2][0] * Ry[0][2] + Rz[2][1] * Ry[1][2] + Rz[2][2] * Ry[2][2],
    ],
  ];

  return [
    RzRy[0][0] * a[0] + RzRy[1][0] * a[1] + RzRy[2][0] * a[2],
    RzRy[0][1] * a[0] + RzRy[1][1] * a[1] + RzRy[2][1] * a[2],
    RzRy[0][2] * a[0] + RzRy[1][2] * a[1] + RzRy[2][2] * a[2],
  ];
}

let paramGeo;
const group = new Group();
let material;

const x_scale = 5.0;
const y_scale = 5.0;

class ParametricGeo extends SceneObject {
  constructor(){
    super();
    this.params = {
      func: (u, v, vec) => {
        const temp = rotateVector(u, v, [0.5, 0, 0.25+ Math.max(Math.cos(10 * pi *v + 10*pi*u),Math.cos(10 * pi *v - 10*pi*u)/20)]);
        vec.x = temp[0];
        vec.y = temp[1];
        vec.z = temp[2];
      },
      slices: 25,
      stacks: 25,
      mult_x: 5,
      mult_y: 5,
    };
  }

  async init() {
    if (this.mesh) {
      this.group.remove(this.mesh);
    }
    this.mesh = new Mesh(
      new ParametricGeometry(this.params.func, this.params.slices, this.params.stacks),
      this.material
    );
    this.mesh.castShadow = this.mesh.receiveShadow = true;
    const uvs = this.mesh.geometry.attributes.uv;
    for (let i = 0; i < uvs.count; i++) {
      uvs.setXY(i, uvs.getX(i) * this.params.mult_x, uvs.getY(i) * this.params.mult_y);
    }
    this.mesh.geometry.attributes.uv.needsUpdate = true;
    this.group.add(this.mesh);
  }


  paramGui = (gui) => {
    gui.add(this.params, "slices", 1, 50, 1).onChange(() => this.init());
    gui.add(this.params, "stacks", 1, 50, 1).onChange(() => this.init());
    gui.add(this.params, "mult_x", 1, 32, 1).onChange(() => this.init());
    gui.add(this.params, "mult_y", 1, 32, 1).onChange(() => this.init());
  }

}

export { ParametricGeo };


