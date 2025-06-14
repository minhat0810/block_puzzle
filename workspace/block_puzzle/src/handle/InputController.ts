/* eslint-disable prettier/prettier */
import { FederatedPointerEvent, Container, Point } from "pixi.js";

export class InputController {
  private isDown = false;
  private pointerPos: Point = new Point(0, 0);

  constructor(target: Container) {
    target.eventMode = "static"; // đảm bảo container nhận event
    target.on("pointerdown", this.onPointerDown.bind(this));
    target.on("pointerup", this.onPointerUp.bind(this));
    target.on("pointerupoutside", this.onPointerUp.bind(this));
    target.on("pointermove", this.onPointerMove.bind(this));
  }

  private onPointerDown(e: FederatedPointerEvent) {
    this.isDown = true;
    this.pointerPos.copyFrom(e.global);
  }

  private onPointerUp(e: FederatedPointerEvent) {
    this.isDown = false;
    this.pointerPos.copyFrom(e.global);
  }

  private onPointerMove(e: FederatedPointerEvent) {
    this.pointerPos.copyFrom(e.global);
  }

  public isPointerPressed(): boolean {
    return this.isDown;
  }

  public getPointerPosition(): Point {
    return this.pointerPos.clone();
  }
}
