/* eslint-disable prettier/prettier */

import { Application, Container, FederatedPointerEvent } from "pixi.js";
import { Blocks } from "../models/Blocks";
import { sound } from "@pixi/sound";

export class BlockPickManager {
  private container: Container;
  private pickBlock: Blocks[] = [];
  private selectedBlock: Blocks | null = null;
  private offsetX = 0;
  private offsetY = 0;
  private isPick = false;
  private app: Application;
  private hasPlayedClickSound = false;

  constructor(container: Container,app: Application) {
    this.container = container;
    this.app = app;
  }


  public addBlock(block: Blocks): void {
    this.pickBlock.push(block);
    this.app.stage.eventMode = "static";
    this.app.stage.hitArea = this.app.screen;
    // this.app.stage.on('pointerup', this.onDragEnd);
    // this.app.stage.on('pointerupoutside', this.onDragEnd);
    this.attachEvents(block);
  }

  private attachEvents(block: Blocks): void {
    block.eventMode = "static";
    block.cursor = "pointer";

    block.on("pointerdown", (event: FederatedPointerEvent) => {
      this.onDragStart(block, event);
      requestAnimationFrame(() => {
        sound.play("click");
      });
    });
  
    // block.on("pointermove", (event: FederatedPointerEvent) => this.onPickMove(block, event));
    block.on("pointerup", () => this.onDragEnd());
    block.on("pointerupoutside", () => this.onDragEnd());
    // block.on("pointercancel", () => this.onPickEnd());
  }


  private onDragStart(block: Blocks, event: FederatedPointerEvent): void {
    this.selectedBlock = block;
    console.log(this.selectedBlock.shapeSize);
    
    const global = event.global;
    this.offsetX = global.x - block.x;
    this.offsetY = global.y - block.y;
    block.reSize(50);
    block.saveOriginalPosition(block.x,block.y);
    this.isPick = true;
    this.app.stage.on("pointermove",() => this.onDragMove(block,event));
    // block.width = 50;
    // block.height = 50;
    // // Tính offset từ vị trí chuột đến tâm block

    // this.container.addChild(block);
  }
//, 
  private onDragMove(block: Blocks,event: FederatedPointerEvent): void {
    if (this.selectedBlock !== block || !this.isPick) return;
    this.selectedBlock.parent.toLocal(event.global,undefined,this.selectedBlock.position);
    // const global = event.global;
    // this.selectedBlock.position.set(global.x - this.offsetX, global.y - this.offsetY);
      
    //this.selectedBlock.position.copyFrom(event.global)
    
  }

  private onDragEnd(): void {
    if(this.selectedBlock){
      const placed = false;
      if(!placed){
        this.selectedBlock.reSize(20);
        this.selectedBlock.resetToOriginalPosition();
      }
      this.selectedBlock.alpha = 1;
    }
    this.selectedBlock = null;
    this.isPick = false;
  }
}
