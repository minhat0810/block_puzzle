/* eslint-disable prettier/prettier */

import { Application, Container, FederatedPointerEvent } from "pixi.js";
import { Blocks } from "../models/Blocks";
import { sound } from "@pixi/sound";
import { GameScene } from "../scenes/GameScene";

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
  // private isValid = true;

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
    // console.log(this.selectedBlock.shapeSize);
    
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
    const snapPos = this.getSnapBlockPos(this.selectedBlock.x, this.selectedBlock.y);
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
    // if(this.selectedBlock){
    //   const placed = false;
    //   if(!placed){
    //     this.selectedBlock.reSize(20);
    //     this.selectedBlock.resetToOriginalPosition();
    //   }
    //   this.selectedBlock.alpha = 1;
    // }
    // this.selectedBlock = null;
    // this.isPick = false;
    if (!this.selectedBlock) return;
    const pos =  this.getSnapBlockPos(this.selectedBlock.x, this.selectedBlock.y);
    if(pos){
      this.selectedBlock.position.set(Math.round(pos.x),Math.round( pos.y));
      console.log(this.selectedBlock.x, this.selectedBlock.y);
    } else {
       this.selectedBlock.reSize(20);
       this.selectedBlock.resetToOriginalPosition(); // trả về chỗ cũ nếu sai
       
      
    }
    this.selectedBlock.alpha = 1;
    this.selectedBlock = null;
    this.isPick = false;
  }
    private getSnapBlockPos(x: number, y: number): { x: number, y: number } | null {
    const scene = this.container as GameScene;
    const blockSize = scene.blockSize;

    if (!this.selectedBlock) return null;

    const shape = this.selectedBlock.getShape();
    const shapeRow = shape.length;
    const shapeCol = shape[0].length;

    // Ước lượng góc trên bên trái của khối dựa trên vị trí tâm
    const topLeftX = x - shapeCol * blockSize / 2;
    const topLeftY = y - shapeRow * blockSize / 2;

    for (let row = 0; row <= scene.gridSize - shapeRow; row++) {
      for (let col = 0; col <= scene.gridSize - shapeCol; col++) {
        let isValid = true;

        for (let i = 0; i < shapeRow; i++) {
          for (let j = 0; j < shapeCol; j++) {
            if (shape[i][j] === 1) {
              const gridCell = scene.blockGrid[row + i][col + j];

              const expectedX = topLeftX + j * blockSize + blockSize / 2;
              const expectedY = topLeftY + i * blockSize + blockSize / 2;

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

  
  
}
