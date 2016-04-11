import {CornerShape} from './CornerShape';
import {ControlArea} from './ControlArea';
import {Calc} from './../utils/Calculator';
import {Painter} from './../utils/Painter';

export class ResizeUI extends PIXI.Container {
    constructor(canvas) {
        super();
        this.initialize(canvas);
        this.addCornerDownEvent();
    }


    initialize(canavs) {
        this.offset = -1;
        this.canvas = canvas;
        this.imageRect = new PIXI.Graphics();
        this.topControl = new ControlArea(ControlArea.ROW);
        this.bottomControl = new ControlArea(ControlArea.ROW);
        this.leftControl = new ControlArea(ControlArea.COL);
        this.rightControl = new ControlArea(ControlArea.COL);
        this.lt = new CornerShape(CornerShape.LEFT_TOP);
        this.rt = new CornerShape(CornerShape.RIGHT_TOP);
        this.rb = new CornerShape(CornerShape.RIGHT_BOTTOM);
        this.lb = new CornerShape(CornerShape.LEFT_BOTTOM);
        this.addChild(this.imageRect);
        this.addChild(this.topControl);
        this.addChild(this.bottomControl);
        this.addChild(this.leftControl);
        this.addChild(this.rightControl);
        this.addChild(this.lt);
        this.addChild(this.rt);
        this.addChild(this.rb);
        this.addChild(this.lb);

        this.gDebug = new PIXI.Graphics();
        this.addChild(this.gDebug);
    }


    resize(imageRect) {
        this.resizeCornerShape(imageRect);
        this.resizeControl();
        this.drawImageRect();
    }


    resizeCornerShape(imageRect) {
        this.lt.x = imageRect.x - this.offset;
        this.lt.y = imageRect.y - this.offset;
        this.rt.x = imageRect.x + imageRect.width + this.offset;
        this.rt.y = imageRect.y - this.offset;
        this.rb.x = this.rt.x + this.offset;
        this.rb.y = imageRect.y + imageRect.height + this.offset;
        this.lb.x = this.lt.x - this.offset;
        this.lb.y = this.rb.y + this.offset;
    }


    resizeControl() {
        this.topControl.x = this.lt.x;
        this.topControl.y = this.lt.y;
        this.topControl.width = this.rt.x - this.lt.x;
        this.bottomControl.x = this.lb.x;
        this.bottomControl.y = this.lb.y;
        this.bottomControl.width = this.topControl.width;
        this.leftControl.x = this.lt.x;
        this.leftControl.y = this.lt.y;
        this.leftControl.height = this.rb.y - this.lt.y;
        this.rightControl.x = this.rt.x;
        this.rightControl.y = this.rt.y;
        this.rightControl.height = this.leftControl.height;
    }


    drawImageRect() {
        this.imageRect.clear();
        this.imageRect.lineStyle(2, 0x9e9e9e); // 회색
        this.imageRect.moveTo(this.lt.x, this.lt.y);
        this.imageRect.lineTo(this.rt.x, this.rt.y);
        this.imageRect.lineTo(this.rb.x, this.rb.y);
        this.imageRect.lineTo(this.lb.x, this.lb.y);
        this.imageRect.lineTo(this.lt.x, this.lt.y);
        this.imageRect.endFill();
    }


    updateOtherCorner(changeCorner) {
        switch(changeCorner) {
            case this.lt:
                this.rt.y = this.lt.y;
                this.lb.x = this.lt.x;
                break;

            case this.rt:
                this.lt.y = this.rt.y;
                this.rb.x = this.rt.x;
                break;

            case this.rb:
                this.rt.x = this.rb.x;
                this.lb.y = this.rb.y;
                break;

            case this.lb:
                this.lt.x = this.lb.x;
                this.rb.y = this.lb.y;
                break;
        }
        this.drawImageRect();
    }


    setSize(rect) {
        var x = rect.x;
        var y = rect.y;
        var width = rect.width;
        var height = rect.height;

        this.lt.x = x;
        this.lt.y = y;
        this.rt.x = x + width;
        this.rt.y = y;
        this.rb.x = this.rt.x;
        this.rb.y = y + height;
        this.lb.x = x;
        this.lb.y = this.rb.y;

        this.drawImageRect();
    }


    setPoint(points) {
        this.lt.x = points.lt.x;
        this.lt.y = points.lt.y;
        this.rt.x = points.rt.x;
        this.rt.y = points.rt.y;
        this.rb.x = points.rb.x;
        this.rb.y = points.rb.y;
        this.lb.x = points.lb.x;
        this.lb.y = points.lb.y;

        this.drawImageRect();
    }


    /**
     * 이동하는 코너와 변화값을 보내주면 변화된 points 들을 계산해서 건내줍니다.
     * @param corner
     * @param dx
     * @param dy
     * @returns {*}
     */
    getUpdatePoints(corner, tx, ty) {
        var points = this.points;

        switch (corner) {
            case this.lt:
                points.lt.x = tx;
                points.lt.y = ty;
                points.rt.y = points.lt.y;
                points.lb.x = points.lt.x;
                break;

            case this.rt:
                points.rt.x = tx;
                points.rt.y = ty;
                points.lt.y = points.rt.y;
                points.rb.x = points.rt.x;
                break;

            case this.rb:
                points.rb.x = tx;
                points.rb.y = ty;
                points.rt.x = points.rb.x;
                points.lb.y = points.rb.y;
                break;

            case this.lb:
                points.lb.x = tx;
                points.lb.y = ty;
                points.lt.x = points.lb.x;
                points.rb.y = points.lb.y;
                break;
        }

        return points;
    }


    /*fixCorner(corner, points, image) {
        var fix;
        var left = image.leftLine;
        var top = image.topLine;
        var right = image.rightLine;
        var bottom = image.bottomLine;

        switch (corner) {
            // lt 라면 lt와 rt가 탑라인 안넘었는지, lt가 왼쪽 라인 안넘었는지
            case this.lt:
                console.log('lt');
                if (Calc.triangleArea(image.lt, image.rt, points.lt) > 0) {
                    fix = Calc.getShortestDistancePoint(points.lt, image.lt, image.rt);
                    console.log('1');
                    points.lt.x = fix.x;
                    points.lt.y = fix.y;

                    Painter.drawLine(this.gDebug, points.lt, fix);
                }
                if (Calc.triangleArea(image.lt, image.rt, points.rt) > 0) {
                    fix = Calc.getShortestDistancePoint(points.rt, image.lt, image.rt);
                    console.log('2');
                    points.rt.x = fix.x;
                    points.rt.y = fix.y;

                    Painter.drawLine(this.gDebug, points.rt, fix);
                }
                if (Calc.triangleArea(image.lb, image.lt, points.lt) > 0) {
                    fix = Calc.getShortestDistancePoint(points.lt, image.lb, image.lt);
                    console.log('3');
                    points.lt.x = fix.x;
                    points.lt.y = fix.y;

                    Painter.drawLine(this.gDebug, points.lt, fix);
                }
                break;

            // rt 라면 rt와 lt가 탑라인 안넘었는지, rt가 오른쪽 라인 안넘었는지
            case this.rt:
                console.log('rt');
                if (Calc.triangleArea(image.lt, image.rt, points.rt) > 0) {
                    fix = Calc.getShortestDistancePoint(points.rt, image.lt, image.rt);
                    console.log('4');
                    points.rt.x = fix.x;
                    points.rt.y = fix.y;

                    Painter.drawLine(this.gDebug, points.rt, fix);
                }
                if (Calc.triangleArea(image.lt, image.rt, points.lt) > 0) {
                    fix = Calc.getShortestDistancePoint(points.lt, image.lt, image.rt);
                    console.log('5');
                    points.lt.x = fix.x;
                    points.lt.y = fix.y;

                    Painter.drawLine(this.gDebug, points.lt, fix);
                }
                if (Calc.triangleArea(image.rt, image.rb, points.rt) > 0) {
                    fix = Calc.getShortestDistancePoint(points.rt, image.rt, image.rb);
                    console.log('6');
                    points.rt.x = fix.x;
                    points.rt.y = fix.y;
                    Painter.drawLine(this.gDebug, points.rt, fix);
                }
                break;

            // rb 라면 rt와 rb가 오른쪽 라인을 안넘었는지, rb가 바닥라인을 안넘었는지
            case this.rb:
                console.log('rb');
                if (Calc.triangleArea(image.rt, image.rb, points.rb) > 0) {
                    fix = Calc.getShortestDistancePoint(points.rb, image.rt, image.rb);
                    console.log('7');
                    points.rb.x = fix.x;
                    points.rb.y = fix.y;
                    Painter.drawLine(this.gDebug, points.rb, fix);
                }
                if (Calc.triangleArea(image.rt, image.rb, points.rt) > 0) {
                    fix = Calc.getShortestDistancePoint(points.rt, image.rt, image.rb);
                    console.log('8');
                    points.rt.x = fix.x;
                    points.rt.y = fix.y;
                    Painter.drawLine(this.gDebug, points.rt, fix);
                }
                if (Calc.triangleArea(image.rb, image.lb, points.rb) > 0) {
                    fix = Calc.getShortestDistancePoint(points.rb, image.rb, image.lb);
                    console.log('9');
                    points.rb.x = fix.x;
                    points.rb.y = fix.y;
                    Painter.drawLine(this.gDebug, points.rb, fix);
                }
                break;

            // lb 라면 lb와 lt가 왼쪽 라인을 안넘었는지, lb가 바닥라인을 안넘었는지
            case this.lb:
                console.log('lb');
                if (Calc.triangleArea(image.lb, image.lt, points.lb) > 0) {
                    fix = Calc.getShortestDistancePoint(points.lb, image.lb, image.lt);
                    console.log('11');
                    points.lb.x = fix.x;
                    points.lb.y = fix.y;
                    Painter.drawLine(this.gDebug, points.lb, fix);
                }
                if (Calc.triangleArea(image.lb, image.lt, points.lt) > 0) {
                    fix = Calc.getShortestDistancePoint(points.lt, image.lb, image.lt);
                    console.log('12');
                    points.lt.x = fix.x;
                    points.lt.y = fix.y;
                    Painter.drawLine(this.gDebug, points.lt, fix);
                }
                if (Calc.triangleArea(image.rb, image.lb, points.lb) > 0) {
                    fix = Calc.getShortestDistancePoint(points.lb, image.rb, image.lb);
                    console.log('13');
                    points.lb.x = fix.x;
                    points.lb.y = fix.y;
                    Painter.drawLine(this.gDebug, points.lb, fix);
                }
                break;
        }

        return points;
    }*/


    fixCorner(corner, points, image) {
        var fix;
        var left = image.leftLine;
        var top = image.topLine;
        var right = image.rightLine;
        var bottom = image.bottomLine;

        switch (corner) {
            // lt 라면 lt와 rt가 탑라인 안넘었는지, lt가 왼쪽 라인 안넘었는지
            case this.lt:
                console.log('lt');
                if (Calc.triangleArea(points.lt, image.lt, image.rt) > 0) {
                    fix = Calc.getShortestDistancePoint(points.lt, image.lt, image.rt);
                    console.log('1');
                    points.lt.x = fix.x;
                    points.lt.y = fix.y;

                    Painter.drawLine(this.gDebug, points.lt, fix);
                }
                if (Calc.triangleArea(points.rt, image.lt, image.rt) > 0) {
                    fix = Calc.getShortestDistancePoint(points.rt, image.lt, image.rt);
                    console.log('2');
                    points.rt.x = fix.x;
                    points.rt.y = fix.y;

                    Painter.drawLine(this.gDebug, points.rt, fix);
                }
                if (Calc.triangleArea(points.lt, image.lb, image.lt) > 0) {
                    fix = Calc.getShortestDistancePoint(points.lt, image.lb, image.lt);
                    console.log('3');
                    points.lt.x = fix.x;
                    points.lt.y = fix.y;

                    Painter.drawLine(this.gDebug, points.lt, fix);
                }
                break;

            // rt 라면 rt와 lt가 탑라인 안넘었는지, rt가 오른쪽 라인 안넘었는지
            case this.rt:
                console.log('rt');
                if (Calc.triangleArea(points.rt, image.lt, image.rt) > 0) {
                    fix = Calc.getShortestDistancePoint(points.rt, image.lt, image.rt);
                    console.log('4');
                    points.rt.x = fix.x;
                    points.rt.y = fix.y;

                    Painter.drawLine(this.gDebug, points.rt, fix);
                }
                if (Calc.triangleArea(points.lt, image.lt, image.rt) > 0) {
                    fix = Calc.getShortestDistancePoint(points.lt, image.lt, image.rt);
                    console.log('5');
                    points.lt.x = fix.x;
                    points.lt.y = fix.y;

                    Painter.drawLine(this.gDebug, points.lt, fix);
                }
                if (Calc.triangleArea(points.rt, image.rt, image.rb) > 0) {
                    fix = Calc.getShortestDistancePoint(points.rt, image.rt, image.rb);
                    console.log('6');
                    points.rt.x = fix.x;
                    points.rt.y = fix.y;
                    Painter.drawLine(this.gDebug, points.rt, fix);
                }
                break;

            // rb 라면 rt와 rb가 오른쪽 라인을 안넘었는지, rb가 바닥라인을 안넘었는지
            case this.rb:
                console.log('rb');
                if (Calc.triangleArea(points.rb, image.rt, image.rb) > 0) {
                    fix = Calc.getShortestDistancePoint(points.rb, image.rt, image.rb);
                    console.log('7');
                    points.rb.x = fix.x;
                    points.rb.y = fix.y;
                    Painter.drawLine(this.gDebug, points.rb, fix);
                }
                if (Calc.triangleArea(points.rt, image.rt, image.rb) > 0) {
                    fix = Calc.getShortestDistancePoint(points.rt, image.rt, image.rb);
                    console.log('8');
                    points.rt.x = fix.x;
                    points.rt.y = fix.y;
                    Painter.drawLine(this.gDebug, points.rt, fix);
                }
                if (Calc.triangleArea(points.rb, image.rb, image.lb) > 0) {
                    fix = Calc.getShortestDistancePoint(points.rb, image.rb, image.lb);
                    console.log('9');
                    points.rb.x = fix.x;
                    points.rb.y = fix.y;
                    Painter.drawLine(this.gDebug, points.rb, fix);
                }
                break;

            // lb 라면 lb와 lt가 왼쪽 라인을 안넘었는지, lb가 바닥라인을 안넘었는지
            case this.lb:
                console.log('lb');
                if (Calc.triangleArea(points.lb, image.lb, image.lt) > 0) {
                    fix = Calc.getShortestDistancePoint(points.lb, image.lb, image.lt);
                    console.log('11');
                    points.lb.x = fix.x;
                    points.lb.y = fix.y;
                    Painter.drawLine(this.gDebug, points.lb, fix);
                }
                if (Calc.triangleArea(points.lt, image.lb, image.lt) > 0) {
                    fix = Calc.getShortestDistancePoint(points.lt, image.lb, image.lt);
                    console.log('12');
                    points.lt.x = fix.x;
                    points.lt.y = fix.y;
                    Painter.drawLine(this.gDebug, points.lt, fix);
                }
                if (Calc.triangleArea(points.lb, image.rb, image.lb) > 0) {
                    fix = Calc.getShortestDistancePoint(points.lb, image.rb, image.lb);
                    console.log('13');
                    points.lb.x = fix.x;
                    points.lb.y = fix.y;
                    Painter.drawLine(this.gDebug, points.lb, fix);
                }
                break;
        }

        return points;
    }


    /**
     * 좌상단 점이 바운드안에 포함되었는지 여부
     * @param bounds
     * @returns {boolean}
     */
    isLtInsideBounds(bounds) {
        return (Calc.isInsideSquare(this.lt, bounds.lt, bounds.rt, bounds.rb, bounds.lb));
    }

    isRtInsideBounds(bounds) {
        return (Calc.isInsideSquare(this.rt, bounds.lt, bounds.rt, bounds.rb, bounds.lb));
    }

    isRbInsideBounds(bounds) {
        return (Calc.isInsideSquare(this.rb, bounds.lt, bounds.rt, bounds.rb, bounds.lb));
    }

    isLbInsideBounds(bounds) {
        return (Calc.isInsideSquare(this.lb, bounds.lt, bounds.rt, bounds.rb, bounds.lb));
    }

    //////////////////////////////////////////////////////////////////////
    // Event Handler
    //////////////////////////////////////////////////////////////////////


    onCornerDown(e) {
        e.stopPropagation();

        this.selectedTarget = e.target;
        this.dragStartX = this.prevDragX = e.data.global.x;
        this.dragStartY = this.prevDragY = e.data.global.y;

        this.addCornerMoveEvent();
        this.removeCornerDownEvent();

        this.emit('cornerResizeStart', {
            target: this.selectedTarget,
            dragStartX: this.dragStartX,
            dragStartY: this.dragStartY
        });
        //console.log('onCornerDown!', Calc.digit(this.dragStartX), Calc.digit(this.dragStartY));
    }

    onCornerMove(e) {
        this.currentDragX = e.clientX;
        this.currentDragY = e.clientY;

        this.dx = this.currentDragX - this.prevDragX;
        this.dy = this.currentDragY - this.prevDragY;

        this.emit('cornerResizeChange', {
            dx: this.dx,
            dy: this.dy,
            prevX: this.prevDragX,
            prevY: this.prevDragY,
            target: this.selectedTarget
        });

        this.prevDragX = this.currentDragX;
        this.prevDragY = this.currentDragY;
        //console.log('dx:' + Calc.digit(this.dx) + ',' + Calc.digit(this.dy));
    }

    onCornerUp(e) {
        this.addCornerDownEvent();
        this.removeCornerMoveEvent();

        this.emit('cornerResizeEnd', {
            target: this.selectedTarget
        });

        this.selectedTarget = null;
    }


    //////////////////////////////////////////////////////////////////////
    // Add & Remove MouseEvent
    //////////////////////////////////////////////////////////////////////


    addCornerDownEvent() {
        this._cornerDownListener = this.onCornerDown.bind(this);
        this.lt.on('mousedown', this._cornerDownListener);
        this.rt.on('mousedown', this._cornerDownListener);
        this.rb.on('mousedown', this._cornerDownListener);
        this.lb.on('mousedown', this._cornerDownListener);
    }

    removeCornerDownEvent() {
        this.lt.off('mousedown', this._cornerDownListener);
        this.rt.off('mousedown', this._cornerDownListener);
        this.rb.off('mousedown', this._cornerDownListener);
        this.lb.off('mousedown', this._cornerDownListener);
    }

    addCornerMoveEvent() {
        this._cornerUpListener = this.onCornerUp.bind(this);
        this._cornerMoveListener = this.onCornerMove.bind(this);

        window.document.addEventListener('mouseup', this._cornerUpListener);
        window.document.addEventListener('mousemove', this._cornerMoveListener);
    }

    removeCornerMoveEvent() {
        window.document.removeEventListener('mouseup', this._cornerUpListener);
        window.document.removeEventListener('mousemove', this._cornerMoveListener);
    }


    //////////////////////////////////////////////////////////////////////
    // Getter & Setter
    //////////////////////////////////////////////////////////////////////


    get bounds() {
        return {
            x:this.lt.x,
            y:this.lt.y,
            width:this.rt.x - this.lt.x,
            height:this.rb.y - this.rt.y
        }
    }

    get points() {
        return {
            lt: {x:this.lt.x, y:this.lt.y},
            rt: {x:this.rt.x, y:this.rt.y},
            rb: {x:this.rb.x, y:this.rb.y},
            lb: {x:this.lb.x, y:this.lb.y}
        }
    }

    get isMinWidth() {
        var bounds = this.bounds;
        var min = this.size * 2 + this.half;
        return (bounds.width < min);
    }

    get isMinHeight() {
        var bounds = this.bounds;
        var min = this.size * 2 + this.half;
        return (bounds.height < min);
    }

}
