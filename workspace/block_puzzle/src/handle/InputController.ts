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

  private onPointerDown(event: FederatedPointerEvent) {
    this.isDown = true;
    this.pointerPos.copyFrom(event.global);
  }

  private onPointerUp(event: FederatedPointerEvent) {
    this.isDown = false;
    this.pointerPos.copyFrom(event.global);
  }

  private onPointerMove(event: FederatedPointerEvent) {
    this.pointerPos.copyFrom(event.global);
  }

  public isPointerPressed(): boolean {
    return this.isDown;
  }

  public getPointerPosition(): Point {
    return this.pointerPos.clone();
  }
}
