import {
    Vector2,
    Texture,
    DoubleSide,
    MeshToonMaterial,
    MeshBasicMaterial,
    MeshStandardMaterial,
    CanvasTexture,
    RepeatWrapping,
    TextureLoader
  } from "three";


class TextureGenerator{
    constructor() {
        this.textures = [];
        this.params = {};
    }
    createTextureCanvas(density) {
        const textureCanvas = document.createElement("canvas");
        textureCanvas.width = 256;
        textureCanvas.height = 256;
        this.drawTextureLines(textureCanvas, density);
        const texture = new Texture(textureCanvas);
        texture.wrapS = texture.wrapT = RepeatWrapping;
        texture.needsUpdate = true;
        return texture;
    }
    drawTextureLines(canvas, density) {
        const context = canvas.getContext("2d");
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.strokeStyle = "black";
        context.lineWidth = this.params.thickness;
        for (let i = 0; i < canvas.height; i += canvas.height / density) {
            context.beginPath();
            context.moveTo(0, i);
            context.lineTo(canvas.width, i);
            context.stroke();
        }
    }
    updateTextures() {
        for (let i = 0; i <= 5; i++) {
            let texture = this.createTextureCanvas(2 ** (i-1) * this.params.midDensity/4 );
            this.textures[i] = texture;
        }
    }
    initTextures(gui) {

    }
    updatePreview(previewCanvasId) {
        const previewCanvas = document.getElementById(previewCanvasId);
        if (previewCanvas) {
            const previewContext = previewCanvas.getContext("2d");
            previewContext.drawImage(this.textures[3].image, 0, 0, 256, 256);
        }
    }
    initGui(gui){

    }
}

class LineTextureGenerator extends TextureGenerator{
    constructor() {
        super();
        this.textureFolder;
        this.params = {
            thickness: 2.,
            midDensity: 24,
        };
    
    }

    
    drawTextureLines(canvas, density) {
        const context = canvas.getContext("2d");
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.strokeStyle = "black";
        context.lineWidth = this.params.thickness;
        for (let i = 0; i < canvas.height; i += canvas.height / density) {
            context.beginPath();
            context.moveTo(0, i);
            context.lineTo(canvas.width, i);
            context.stroke();
        }
    }

    updateTextures() {
        for (let i = 0; i <= 5; i++) {
            let texture = this.createTextureCanvas(2 ** (i-1) * this.params.midDensity/4 );
            this.textures[i] = texture;
        }
    }

    initTextures(gui) {
        if (this.textureFolder){
            this.textureFolder.open();
        }
        else{
        this.textureFolder = gui.addFolder("Line Texture");
        this.textureFolder.add(this.params, "midDensity", 4, 64, 1).onChange(() => {
            this.updateTextures();
        });
        this.textureFolder.add(this.params, "thickness", 0.01, 4., 0.01).onChange(() => {
            this.updateTextures();
        });
        }

        this.updateTextures();
    }

    updatePreview(previewCanvasId) {
        const previewCanvas = document.getElementById(previewCanvasId);
        if (previewCanvas) {
            const previewContext = previewCanvas.getContext("2d");
            previewContext.drawImage(this.textures[3].image, 0, 0, 256, 256);
        }
    }

    initGui(gui){

    }
}


class LineHatchTextureGenerator extends TextureGenerator{
    constructor() {
        super();
        this.textureFolder;
        this.params = {
            thickness: 2.,
            midDensity: 16,
            offset: 128
        };
    
    }

    
    drawTextureLines(canvas, density) {
        const context = canvas.getContext("2d");
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.strokeStyle = "black";
        context.lineWidth = this.params.thickness;
        for (let i = 0; i < canvas.height; i += canvas.height / density) {
            context.beginPath();
            context.moveTo(0, i);
            context.lineTo(canvas.width, i);
            context.stroke();
            context.beginPath();
            context.moveTo(i, 0);
            context.lineTo((i+ this.params.offset), canvas.height);
            context.stroke();
            context.beginPath();
            context.moveTo(0, (canvas.width - i)/( this.params.offset)*canvas.height);
            context.lineTo((i+ this.params.offset) % canvas.width, canvas.height);
            context.stroke();
        }
    }

    updateTextures() {
        for (let i = 0; i <= 5; i++) {
            let texture = this.createTextureCanvas(2 ** (i-1) * this.params.midDensity/4 );
            this.textures[i] = texture;
        }
    }

    
    initTextures(gui) {
        if (this.textureFolder){
            this.textureFolder.open();
        }
        else{
            this.textureFolder = gui.addFolder("Cross Line Texture");
            this.textureFolder.add(this.params, "midDensity", 4, 64, 1).onChange(() => {
                this.updateTextures();
            });
            this.textureFolder.add(this.params, "thickness", 1, 10, 1).onChange(() => {
                this.updateTextures();
            });
            this.textureFolder.add(this.params, "offset", 0, 256, 1).onChange(() => {
                this.updateTextures();
            });
        }
        this.updateTextures();
    }

    updatePreview(previewCanvasId) {
        const previewCanvas = document.getElementById(previewCanvasId);
        if (previewCanvas) {
            const previewContext = previewCanvas.getContext("2d");
            previewContext.drawImage(this.textures[3].image, 0, 0, 256, 256);
        }
    }
}


class RandomLineTextureGenerator extends TextureGenerator{
    constructor() {
        super();
        this.textureFolder;
        this.densityMapX = new Array(100).fill(0);
        this.densityMapY = new Array(100).fill(0);
        this.totalPlacementsX = 0;
        this.totalPlacementsY = 0;
        this.params = {
            thickness: 2.,
            midDensity: 16,
            minLineLength: 75,
            maxLineLength: 125,
        };
    
    }
    getRandomX(canvas) {
        let sum = 0;
        const inverseDensity = this.densityMapX.map(density => 1 / (1 + density));
        const totalInverseDensity = inverseDensity.reduce((acc, val) => acc + val, 0);
        
        let threshold = Math.random() * totalInverseDensity;
        for (let i = 0; i < inverseDensity.length; i++) {
            sum += inverseDensity[i];
            if (sum >= threshold) {
                this.densityMapX[i]++;
                this.totalPlacementsX++;
                return (i / this.densityMapX.length) * canvas.width/2;
            }
        }
        return 0; 
    }
    getRandomY(canvas) {
        let sum = 0;
        const inverseDensity = this.densityMapY.map(density => 1 / (1 + density));
        const totalInverseDensity = inverseDensity.reduce((acc, val) => acc + val, 0);
        
        let threshold = Math.random() * totalInverseDensity;
        for (let i = 0; i < inverseDensity.length; i++) {
            sum += inverseDensity[i];
            if (sum >= threshold) {
                this.densityMapY[i]++;
                this.totalPlacementsY++;
                return (i / this.densityMapY.length) * canvas.height;
            }
        }
        return 0; 
    }
    copyCanvasContent(sourceCanvas, targetCanvas) {
        const targetContext = targetCanvas.getContext('2d');
        targetContext.drawImage(sourceCanvas, 0, 0);
    }

    createTextureCanvas(density, sourceCanvas = null) {
        let textureCanvas;
        textureCanvas = document.createElement('canvas');
        if (sourceCanvas) {
            this.copyCanvasContent(sourceCanvas, textureCanvas);
        } 
        textureCanvas.width = 256;
        textureCanvas.height = 256;
    
        this.drawTextureLines(textureCanvas, density);
        const texture = new Texture(textureCanvas);
        texture.wrapS = texture.wrapT = RepeatWrapping;
        texture.needsUpdate = true;
        return texture;
    }

    drawTextureLines(canvas, density) {
        const context = canvas.getContext("2d");
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.strokeStyle = "black";
        context.lineWidth = this.params.thickness;
        for (let i = 0; i < density; i += 1) {
            let x = this.getRandomX(canvas);
            let y = this.getRandomY(canvas);
            let lineLength = Math.random() * (this.params.maxLineLength - this.params.minLineLength) + this.params.minLineLength;
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x + lineLength, y);
            context.stroke();
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo((x+2*lineLength) - canvas.width/2, y);
            context.stroke();
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x, y + lineLength);
            context.stroke();
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, y+2*lineLength - canvas.height/2);
            context.stroke();
        }
        const imageData = context.getImageData(0, 0, canvas.width / 2, canvas.height);
        context.scale(-1, 1);
        context.drawImage(canvas, -canvas.width/2, 0);
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.putImageData(imageData, canvas.width / 2, 0);
        
    }

    updateTextures() {
        let prevCanvas = null;
        for (let i = 0; i <= 5; i++) {
            let texture = this.createTextureCanvas(2 ** (i) * this.params.midDensity/4 , prevCanvas);
            this.textures[i] = texture;
            console.log(i,texture.image.width);
            prevCanvas = texture.image;
        }
    }

    initTextures(gui) {
        if (this.textureFolder){
            this.textureFolder.open();
        }
        else{
            this.textureFolder = gui.addFolder("Random Line Texture");
            this.textureFolder.open();
            this.textureFolder.add(this.params, "midDensity", 4, 64, 1).onChange(() => {
                this.updateTextures();
            });
            this.textureFolder.add(this.params, "thickness", 1, 10, 1).onChange(() => {
                this.updateTextures();
            });
            this.textureFolder.add(this.params, "minLineLength", 50, 100, 1).onChange(() => {
                this.updateTextures();
            });
            this.textureFolder.add(this.params, "maxLineLength", 100, 150, 1).onChange(() => {
                this.updateTextures();
            });
        }
        this.updateTextures();
    }
    

    updatePreview(previewCanvasId) {
        const previewCanvas = document.getElementById(previewCanvasId);
        if (previewCanvas) {
            const previewContext = previewCanvas.getContext("2d");
            previewContext.drawImage(this.textures[3].image, 0, 0, 256, 256);
        }
    }
}

class PremadeTextureGenerator extends TextureGenerator{
    constructor() {
        super();
    }

    initTextures(gui){
        const loader = new TextureLoader();
        for (let i = 0; i <= 5; i++) {
            loader.load(
                `assets/hatch_${i}.jpg`,
                (texture) => { // Using arrow function to correctly handle `this`
                    texture.wrapS = texture.wrapT = RepeatWrapping;
                    this.textures[i] = texture;
                    console.log(`Texture hatch_${i} loaded.`);
                },
                undefined,
                (err) => {
                    console.error(`Error loading hatch_${i}:`, err);
                }
            );
        } 
    }

    updatePreview(previewCanvasId) {
        const previewCanvas = document.getElementById(previewCanvasId);
        if (previewCanvas && this.textures[3]) {
            const previewContext = previewCanvas.getContext("2d");
            previewContext.drawImage(this.textures[3].image, 0, 0, 256, 256);
        }
    }
}

export { LineTextureGenerator, LineHatchTextureGenerator, RandomLineTextureGenerator, PremadeTextureGenerator };