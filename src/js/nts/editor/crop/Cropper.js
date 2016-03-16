import {Calculator} from './../utils/Calculator';
import {ResizeUI} from './../ui/ResizeUI';
import {RotateUI} from './../ui/RotateUI';


export class Cropper extends PIXI.Container {
    constructor(canvas, imageElement) {
        super();
        this.initialize(canvas, imageElement);
        this.addEvent();
    }


    initialize(canvas, imageElement) {
        this.canvas = canvas;
        this.imageElement = imageElement;

        this.paddingX = 216;
        this.paddingY = 158;
        this.originalImageWidth = imageElement.width;
        this.origianlImageHeight = imageElement.height;

        this.bounds = new PIXI.Graphics();
        this.addChild(this.bounds);

        this.rotateUI = new RotateUI(this.canvas);
        this.addChild(this.rotateUI);

        this.base = new PIXI.BaseTexture(this.imageElement);
        this.texture = new PIXI.Texture(this.base);
        this.image = new PIXI.Sprite(this.texture);
        this.image.anchor = {x:0.5, y:0.5};
        this.image.interactive = true;
        this.addChild(this.image);

        this.maxRotation = Calculator.getRadians(45);
        this.minRotation = -this.maxRotation;

        this.resizeUI = new ResizeUI(this.canvas, this.originalImageWidth, this.origianlImageHeight);
        this.addChild(this.resizeUI);
    }

    addEvent() {
        this.addImageMouseDownEvent();
        this.rotateUI.on('changeRotation', this.changeRotation.bind(this));


    }

    update() {
        //
    }

    changeRotation(e) {
        //console.log('*************', e.currentRotation, e.dr);

        this.image.rotation += e.change;

        if(this.image.rotation < this.minRotation)
            this.image.rotation = this.minRotation;

        if(this.image.rotation > this.maxRotation)
            this.image.rotation = this.maxRotation;


        // image.rotation 0 ~ 45;
        // image.scale = imageMinScale ~ imageMaxScale;
        // y = (d - c) / (b - a) * (x - a) + c;
        //var scale:Number = (imageMaxScale - imageMinScale) / 45 * Math.abs(image.rotation) + imageMinScale;

        var scale = (this.imageMaxScale - this.imageMinScale) / 45 * Math.abs(this.image.rotation) + this.imageMinScale;
        this.image.scale.x = scale;
        this.image.scale.y = scale;
        //this.image.rotation = e.currentRadian;
    }

    resize(canvasWidth, canvasHeight) {
        var boundsWidth = canvasWidth - this.paddingX;
        var boundsHeight = canvasHeight - this.paddingY;
        var boundsX = this.canvas.width / 2 - boundsWidth / 2;
        var boundsY = this.canvas.height / 2 - boundsHeight / 2;

        this.imageMinScale = Calculator.getResizeMinScaleKeepAspectRatio(boundsWidth, this.originalImageWidth, boundsHeight, this.origianlImageHeight);
        var newImageWidth = this.imageMinScale * this.originalImageWidth;
        var newImageHeight = this.imageMinScale * this.origianlImageHeight;

        this.imageDiagonal = Calculator.getDegrees(newImageWidth, newImageHeight);
        this.imageScaleHeight = this.imageDiagonal;
        this.imageScaleWidth = Calculator.getRectangleWidth(newImageWidth, newImageHeight, this.imageScaleHeight);
        this.imageScaleX = this.imageScaleWidth / newImageWidth;
        this.imageScaleY = this.imageScaleHeight / newImageHeight;
        this.imageMaxScale = this.imageScaleY;

        this.rotateUI.resize();
        this.drawBounds(boundsX, boundsY, boundsWidth, boundsHeight);
        this.resizeImage(boundsWidth, boundsHeight);
        this.resizeUI.resize({
            x:this.canvas.width / 2 - this.image.width / 2,
            y:this.canvas.height / 2 - this.image.height / 2,
            width:this.image.width,
            height:this.image.height
        });
    }


    drawBounds(boundsX, boundsY, boundsWidth, boundsHeight) {
        this.bounds.clear();
        this.bounds.lineStyle(1, 0xff3300, 0.4);
        //this.bounds.beginFill(0xFF3300, 0.2);
        this.bounds.drawRect(boundsX, boundsY, boundsWidth, boundsHeight);
        this.bounds.endFill();
    }


    resizeImage(boundsWidth, boundsHeight) {
        /*var size = Calculator.getImageSizeKeepAspectRatio(boundsWidth, this.originalImageWidth, boundsHeight, this.origianlImageHeight);
        this.image.width = size.width;
        this.image.height = size.height;*/

        var scale = Calculator.getResizeMinScaleKeepAspectRatio(boundsWidth, this.originalImageWidth, boundsHeight, this.origianlImageHeight);
        this.image.scale.x = scale;
        this.image.scale.y = scale;
        this.image.x = this.canvas.width / 2;
        this.image.y = this.canvas.height / 2;


        //this.image.x = this.canvas.width / 2 - this.image.width / 2;
        //this.image.y = this.canvas.height / 2 - this.image.height / 2;
    }


    //////////////////////////////////////////////////////////////////////////
    // MouseEvent
    //////////////////////////////////////////////////////////////////////////


    addImageMouseDownEvent() {
        console.log('Cropper.addImageMouseDownEvent()');
        this._imageMouseDownListener = this.onImageDown.bind(this);
        this.image.on('mousedown', this._imageMouseDownListener);
    }


    removeImageMouseDownEvent() {
        this.image.off('mousedown', this._imageMouseDownListener);
    }


    addImageMouseMoveEvent() {
        this._imageMouseMoveListener = this.onImageMove.bind(this);
        this._imageMouseUpListener = this.onImageUp.bind(this);

        window.document.addEventListener('mousemove', this._imageMouseMoveListener);
        window.document.addEventListener('mouseup', this._imageMouseUpListener);
    }


    removeImageMouseMoveEvent() {
        window.document.removeEventListener('mousemove', this._imageMouseMoveListener);
        window.document.removeEventListener('mouseup', this._imageMouseUpListener);
    }


    onImageDown(e) {

        e.stopPropagation();
        this.addImageMouseMoveEvent();
        this.removeImageMouseDownEvent();
    }


    onImageMove(e) {
        console.log('ImageMove');
    }


    onImageUp(e) {
        this.addImageMouseDownEvent();
        this.removeImageMouseMoveEvent();
    }

}