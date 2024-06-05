import {
  Color,
  MeshStandardMaterial,
  TextureLoader,
  Texture,
  Vector2,
  RepeatWrapping,
} from "three";

function getImageData(texture) {
  const canvas = document.createElement("canvas");
  canvas.width = texture.image.width;
  canvas.height = texture.image.height;

  const context = canvas.getContext("2d");
  context.drawImage(texture.image, 0, 0);
  return context.getImageData(0, 0, canvas.width, canvas.height);
}

function packageTextures(textures){
  // Combine greyscale textures into RGB textures of 3 channels, so that we pass len(textures)/3 textures to the shader
  let packedTextures = [];
for (let i = 0; i < textures.length; i += 3) {
  const canvas = document.createElement("canvas");
  canvas.width = textures[i].image.width;
  canvas.height = textures[i].image.height;
  const context = canvas.getContext("2d");
  const redImageData = getImageData(textures[i]);
  const greenImageData = getImageData(textures[i + 1]);
  const blueImageData = getImageData(textures[i + 2]);

  const rgbImageData = context.createImageData(canvas.width, canvas.height);

  for (let j = 0; j < rgbImageData.data.length; j += 4) {
    rgbImageData.data[j] = redImageData.data[j];
    rgbImageData.data[j + 1] = greenImageData.data[j];
    rgbImageData.data[j + 2] = blueImageData.data[j];
    rgbImageData.data[j + 3] = 255;
  }


  context.putImageData(rgbImageData, 0, 0);

  const packedTexture = new Texture(canvas);
  packedTexture.wrapS = packedTexture.wrapT = RepeatWrapping;
  packedTexture.needsUpdate = true;
  packedTextures.push(packedTexture);
}

return packedTextures;
}

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
      textures: { value: packageTextures(this.params.textures) },
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
                vec4 packedTexture0 = texture2D(textures[0], vCoords);
                vec4 packedTexture1 = texture2D(textures[1], vCoords);
                texColor += vec4(packedTexture0.r) * weights[5];
                texColor +=  vec4(packedTexture0.g) * weights[4];
                texColor +=  vec4(packedTexture0.b) * weights[3];
                texColor +=  vec4(packedTexture1.r) * weights[2];
                texColor +=  vec4(packedTexture1.g) * weights[1];
                texColor +=  vec4(packedTexture1.b) * weights[0];

                texColor.rgb = max(texColor.rgb, sketchColor) ;
                texColor.rgb = min(vec3(1.0), texColor.rgb + totalSpecular.rgb); // comment out if want to remove specular from sketch
                gl_FragColor.rgb =  texColor.rgb * diffuseColor.rgb;
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
      this.uniforms.textures.value = packageTextures(this.params.textures) ;
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
