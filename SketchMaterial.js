import {
  Color,
  MeshStandardMaterial,
  TextureLoader,
  Vector2,
} from "three";

class SketchMaterial extends MeshStandardMaterial {
  constructor(options) {
    super(options);

    const loader = new TextureLoader();
    let textures = [];
    
    this.params = {
      roughness: 0.9,
      metalness: 0.05,
      color: 0xffffff,
      sketchColor: 0x111100,
      textures: textures,
    };

    this.uniforms = {
      resolution: { value: new Vector2(1, 1) },
      textures: { value: this.params.textures },
      numTextures: { value: 7 },
      sketchColor: { value: new Color(this.params.sketchColor) },
    };

    this.onBeforeCompile = (shader, renderer) => {
      shader.uniforms = { ...shader.uniforms, ...this.uniforms };
      console.log(shader.uniforms);
      shader.vertexShader = shader.vertexShader.replace(
        `#include <common>`,
        `#include <common>
                out vec2 vCoords;
                out vec4 vWorldPosition;
                `
      );

      shader.vertexShader = shader.vertexShader.replace(
        `#include <uv_vertex>`,
        `#include <uv_vertex>
                vCoords = uv;
                vWorldPosition = modelMatrix * vec4(position, 1.);
                `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        `#include <common>`,
        `#include <common>
                uniform sampler2D textures[10];
                uniform int numTextures;
                uniform vec3 sketchColor;

                in vec2 vCoords;
                in vec4 vWorldPosition;
                #define TAU 6.28318530718
                `
      );
      console.log(shader.fragmentShader);
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <dithering_fragment>",
        `#include <dithering_fragment>
                
                float intensity = dot(gl_FragColor.rgb, vec3(0.2326, 0.7152, 0.7722));
                intensity = 6.0*intensity/1.72; // 1.72 is the sum of the weights
                float overbright = max(0., intensity - 6.0);

                // since we cant use non constant indices for texture selection, we will use an arithmetic trick with weights ( faster than branches )

                float weights[7];
  
                for (int i = 0; i < 7; i++) {
                    weights[i] = saturate(intensity + 1. - float(i));
                }           
                for (int i = 0; i < 6; i++) {
                    weights[i] = weights[i] - weights[i+1];
                }
                vec4 texColor = vec4(1.0)* weights[6];
                texColor += texture2D(textures[0], vCoords)* weights[5];
                texColor +=  texture2D(textures[1], vCoords)* weights[4];
                texColor +=  texture2D(textures[2], vCoords)* weights[3];
                texColor +=  texture2D(textures[3], vCoords)* weights[2];
                texColor +=  texture2D(textures[4], vCoords)* weights[1];
                texColor +=  texture2D(textures[5], vCoords)* weights[0];

                texColor.rgb = max(texColor.rgb, sketchColor) ;
                texColor.rgb = min(vec3(1.0), texColor.rgb + totalSpecular.rgb);
                // gl_FragColor.rgb =  outgoingLight.rgb;
                // gl_FragColor.rgb =  vec3(intensity);
                gl_FragColor.rgb =  texColor.rgb * diffuseColor.rgb;
                // gl_FragColor.rgb = totalSpecular.rgb;
                // gl_FragColor.rgb = vec3(weights[0], weights[5], weights[6]);
                `
      );
      console.log(shader.fragmentShader);
    };
    this.onBeforeRender = (
      renderer,
      scene,
      camera,
      geometry,
      material,
      group
    ) => {
      this.uniforms.sketchColor.value = new Color(this.params.sketchColor);
      this.uniforms.textures.value = this.params.textures;
    };
  }
}

function shaderGui(gui, material) {
  const params = material.params;
  gui.add(params, "roughness", 0, 1).onChange((v) => (material.roughness = v));
  gui.add(params, "metalness", 0, 1).onChange((v) => (material.metalness = v));
  gui
    .addColor(params, "color")
    .onChange((v) => (material.color = new Color(v)));
  gui
    .addColor(params, "sketchColor")
    .onChange((v) => (material.sketchColor = new Color(v)));
}
export { SketchMaterial, shaderGui };
