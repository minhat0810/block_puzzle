/* eslint-disable prettier/prettier */

import { Application, Container, FederatedPointerEvent } from "pixi.js";
import { Blocks } from "../models/Blocks";
import { sound } from "@pixi/sound";
// import { GameScene } from "../scenes/GameScene";
import { WorldMap } from "../models/WorldMap";

export class BlockPickManager {
  private container: Container;
  private pickBlock: Blocks[] = [];
  private selectedBlock: Blocks | null = null;
  private snapPreview: Blocks | null = null;
  private offsetX = 0;
  private offsetY = 0;
  private isPick = false;
  private app: Application;
  private hasPlayedClickSound = false;
  private onDragMoveEvent ?: ( event : FederatedPointerEvent) => void;
  private snappedCount = 0;
  private onResetCallBack ?: () => void;
  // private isValid = true;

  constructor(container: Container,app: Application) {
    this.container = container;
    this.app = app;
  }


  public addBlock(block: Blocks): void {
    this.pickBlock.push(block);
    this.app.stage.eventMode = "static";
    this.app.stage.hitArea = this.app.screen;
    this.attachEvents(block);
  }

  private attachEvents(block: Blocks): void {
    block.eventMode = "static";
    block.cursor = "pointer";
    block.on("pointerdown", (event: FederatedPointerEvent) => {
      if (block.isSnapped) return;
      this.onDragStart(block, event);
      requestAnimationFrame(() => {
        sound.play("click");
      });
    });
  
    block.on("pointerup", () => this.onDragEnd());
    block.on("pointerupoutside", () => this.onDragEnd());
  }


  private onDragStart(block: Blocks, event: FederatedPointerEvent): void {
    this.selectedBlock = block;

    const global = event.global;
    this.offsetX = global.x - block.x;
    this.offsetY = global.y - block.y;
    block.reSize(50);
    block.saveOriginalPosition(block.x,block.y);
    this.isPick = true;
    this.onDragMoveEvent = (event: FederatedPointerEvent) => this.onDragMove(block,event);
    this.app.stage.on("pointermove",this.onDragMoveEvent);
  }
  private onDragMove(block: Blocks,event: FederatedPointerEvent): void {
    if (this.selectedBlock !== block || !this.isPick ) return;

    console.log(this.selectedBlock);
    
    const localPos = this.selectedBlock.parent.toLocal(event.global);

    this.selectedBlock.position.set(Math.round(localPos.x-this.offsetX) , Math.round(localPos.y-this.offsetY));
    
    const snapPos = this.getSnapBlockPos(Math.round(this.selectedBlock.x),Math.round( this.selectedBlock.y));
    if (snapPos) {
        if (!this.snapPreview) {
            this.snapPreview = new Blocks(block.getShape(), block['texture'], 50);
            this.snapPreview.alpha = 0.3;
            this.container.addChild(this.snapPreview);
        }
        this.snapPreview.position.set(snapPos.x, snapPos.y);
    } else {
        if (this.snapPreview && this.snapPreview.parent) {
            this.container.removeChild(this.snapPreview);
            this.snapPreview.destroy();
            this.snapPreview = null;
        }
    }
    
  }

  private onDragEnd(): void {
    if(this.onDragMoveEvent){
      this.app.stage.off("pointermove", this.onDragMoveEvent);
      this.onDragMoveEvent = undefined;
    }
    if (!this.selectedBlock) return;
    const pos =  this.getSnapBlockPos(this.selectedBlock.x, this.selectedBlock.y);
    const scene = this.container as WorldMap;

    if(pos){
      this.selectedBlock.position.set(Math.round(pos.x),Math.round( pos.y));
      this.selectedBlock.isSnapped = true;

      const shape = this.selectedBlock.getShape();
      const shapeRow = shape.length;
      const shapeCol = shape[0].length;
      const blockSize = scene.blockSize;

      const startRow = Math.floor((pos.y - scene.gridOffsetY)/blockSize);
      const startCol = Math.floor((pos.x - scene.gridOffsetX) / blockSize);
      
      this.snappedCount++;
      

      for (let i = 0; i < shapeRow; i++) {
        for (let j = 0; j < shapeCol; j++) {
          if (shape[i][j] === 1) {
            scene.blockGrid[startRow + i][startCol + j].occupied = true;
          }
        }
      }
      if (this.snapPreview) {
        this.snapPreview.destroy();
        this.snapPreview = null;
      }
      if(this.snappedCount >= 3 && this.onResetCallBack){
        this.snappedCount = 0;
        this.onResetCallBack();
      }
    } else {
       this.selectedBlock.reSize(20);
       this.selectedBlock.resetToOriginalPosition(); // trả về chỗ cũ nếu sai
    }
    this.selectedBlock.alpha = 1;
    this.selectedBlock = null;
    this.isPick = false;
  }
  private getSnapBlockPos(x: number, y: number): { x: number, y: number } | null {
    
    if (!this.selectedBlock) return null;
    
    const scene = this.container as WorldMap;
    const blockSize = scene.blockSize;

    const shape = this.selectedBlock.getShape();
    const shapeRow = shape.length;
    const shapeCol = shape[0].length;

    //Góc trên trái khối dựa trên vị trí tâm // tính vị trí của block
    const locX = x ;
    const locY = y ;
    
    for (let row = 0; row <= scene.gridSize - shapeRow; row++) {
      for (let col = 0; col <= scene.gridSize - shapeCol; col++) {
        let isValid = true;
        for (let i = 0; i < shapeRow; i++) {
          for (let j = 0; j < shapeCol; j++) {
            if (shape[i][j] === 1) {
              const gridCell = scene.blockGrid[row + i][col + j];
              if (gridCell.occupied) {
                isValid = false;
                break;
              }

              const expectedX = locX + j * blockSize;
              const expectedY = locY + i * blockSize;

              const cellLeft = gridCell.x - blockSize / 2;
              const cellRight = gridCell.x + blockSize / 2;
              const cellTop = gridCell.y - blockSize / 2;
              const cellBottom = gridCell.y + blockSize / 2;

              if (
                expectedX < cellLeft ||
                expectedX > cellRight ||
                expectedY < cellTop ||
                expectedY > cellBottom
              ) {
                isValid = false;
                break;
              }
            }
          }
          if (!isValid) break;
        }

        if (isValid) {
          return {
            x: scene.blockGrid[row][col].x,
            y: scene.blockGrid[row][col].y,
          };
        }
      }
    }
    return null;
  }
  public setResetCallBack(callback: ()=>void){
    this.onResetCallBack = callback;
  }
}
