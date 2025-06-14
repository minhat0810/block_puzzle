/* eslint-disable prettier/prettier */

import { Container, FederatedPointerEvent } from "pixi.js";
import { Blocks } from "../models/Blocks";

export class BlockPickManager {
  private container: Container;
  private pickBlock: Blocks[] = [];
  private selectedBlock: Blocks | null = null;
  private offsetX = 0;
  private offsetY = 0;

  constructor(container: Container) {
    this.container = container;
  }

  // Đăng ký block vào hệ thống kéo thả
  public addBlock(block: Blocks): void {
    this.pickBlock.push(block);
    this.attachEvents(block);
  }

  // Gắn các sự kiện pointer cho block
  private attachEvents(block: Blocks): void {
    block.eventMode = "static";
    block.cursor = "pointer";

    block.on("pointerdown", (event: FederatedPointerEvent) => this.onPickStart(block, event));
    block.on("pointermove", (event: FederatedPointerEvent) => this.onPickMove(block, event));
    block.on("pointerup", () => this.onPickEnd());
    block.on("pointerupoutside", () => this.onPickEnd());
    block.on("pointercancel", () => this.onPickEnd());
  }

  private onPickStart(block: Blocks, event: FederatedPointerEvent): void {
    this.selectedBlock = block;
    block.width = 50;
    block.height = 50;
    // Tính offset từ vị trí chuột đến tâm block
    const local = block.toLocal(event.global);
    this.offsetX = local.x;
    this.offsetY = local.y;

    this.container.addChild(block);
  }

  private onPickMove(block: Blocks, event: FederatedPointerEvent): void {
    if (this.selectedBlock !== block) return;

    const global = event.global;
    this.selectedBlock.position.set(global.x - this.offsetX, global.y - this.offsetY);
  }

  private onPickEnd(): void {
    this.selectedBlock = null;
  }
}
