/* eslint-disable prettier/prettier */

import { Application, Assets, Container, FederatedPointerEvent, Sprite, Texture } from "pixi.js";
import { Blocks } from "../models/Blocks";
import { sound } from "@pixi/sound";
// import { GameScene } from "../scenes/GameScene";
import { WorldMap } from "../models/WorldMap";
// interface HighlightableTile extends Sprite {
//   _originalTexture?: Texture;
// }

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
  private containerWM: WorldMap;
  private lastSnapRow: number | null = null;
  private lastSnapCol: number | null = null;
  private originalTextureMap = new WeakMap<Sprite, Texture>();

  // private isValid = true;

  constructor(container: Container,app: Application) {
    this.container = container;
    this.app = app;
    this.containerWM = this.container as WorldMap;
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
      if (block.canPick) return;
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
    
    const localPos = this.selectedBlock.parent.toLocal(event.global);

    this.selectedBlock.position.set(Math.round(localPos.x-this.offsetX) , Math.round(localPos.y-this.offsetY));
    
    const snapPos = this.getSnapBlockPos(Math.round(this.selectedBlock.x),Math.round( this.selectedBlock.y));
    if (snapPos) {
        if (!this.snapPreview) {
            this.snapPreview = new Blocks(block.getShape(), block['texture'], 50);
            this.snapPreview.alpha = 0.3;
            this.container.addChild(this.snapPreview);
        }
        if (this.lastSnapRow !== snapPos.row || this.lastSnapCol !== snapPos.col) {
          this.highlight(snapPos.row, snapPos.col, this.selectedBlock);
          this.lastSnapRow = snapPos.row;
          this.lastSnapCol = snapPos.col;
        }
        
        this.snapPreview.position.set(snapPos.x, snapPos.y);
    } else {
        if (this.snapPreview && this.snapPreview.parent) {
            this.container.removeChild(this.snapPreview);
            this.snapPreview.destroy();
            this.snapPreview = null;
            this.lastSnapRow = null;
            this.lastSnapCol = null;
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

    if(pos){
      this.selectedBlock.position.set(Math.round(pos.x),Math.round( pos.y));
      this.selectedBlock.canPick = true;



      const shape = this.selectedBlock.getShape();
      const shapeRow = shape.length;
      const shapeCol = shape[0].length;
      const blockSize = this.containerWM.blockSize;

      const startRow = Math.floor((pos.y - this.containerWM.gridOffsetY)/blockSize);
      const startCol = Math.floor((pos.x - this.containerWM.gridOffsetX) / blockSize);
      
      this.snappedCount++;
      sound.play("put");
      

      for (let i = 0; i < shapeRow; i++) {
        for (let j = 0; j < shapeCol; j++) {
          if (shape[i][j] === 1) {
            this.containerWM.blockGrid[startRow + i][startCol + j].occupied = true;
            this.containerWM.blockGrid[startRow + i][startCol + j].blockRef = this.selectedBlock;
            this.containerWM.blockGrid[startRow + i][startCol + j].parentBlockPos = {x: startCol , y: startRow};
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
      this.checkExploedLines();
      
    } else {
       this.selectedBlock.reSize(20);
       this.selectedBlock.resetToOriginalPosition(); // trả về chỗ cũ nếu sai
    }
    this.selectedBlock.alpha = 1;
    this.selectedBlock = null;
    this.isPick = false;
  }
  private getSnapBlockPos(x: number, y: number): { x: number, y: number, row: number, col: number } | null {
    
    if (!this.selectedBlock) return null;
    
    const blockSize = this.containerWM.blockSize;

    const shape = this.selectedBlock.getShape();
    const shapeRow = shape.length;
    const shapeCol = shape[0].length;

    //Góc trên trái khối dựa trên vị trí tâm // tính vị trí của block
    const locX = x ;
    const locY = y ;
    
    for (let row = 0; row <= this.containerWM.gridSize - shapeRow; row++) {
      for (let col = 0; col <= this.containerWM.gridSize - shapeCol; col++) {
        let isValid = true;
        for (let i = 0; i < shapeRow; i++) {
          for (let j = 0; j < shapeCol; j++) {
            if (shape[i][j] === 1) {
              const gridCell = this.containerWM.blockGrid[row + i][col + j];
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
            x: this.containerWM.blockGrid[row][col].x,
            y: this.containerWM.blockGrid[row][col].y,
            row: row,
            col: col
          };
        }
      }
    }
    return null;
  }
  public setResetCallBack(callback: ()=>void){
    this.onResetCallBack = callback;
  }
  private highlight(row: number, col: number, block: Blocks): void{
    const grid = this.containerWM.blockGrid;
    const gridSize = this.containerWM.gridSize;
    const shape = block.getShape();
    this.resetHighlights();
    // tạo map tạm 
    //c1 
    const tempMap =  grid.map(row => row.map(cell=> cell.occupied))
    //c2
    // for (let r = 0; r < gridSize; r++) {
    //   tempMap[r] = [];
    //   for (let c = 0; c < gridSize; c++) {
    //     tempMap[r][c] = grid[r][c].occupied;
    //   }
    // }
        
    // giả block hiện tại
    for(let i = 0; i< shape.length; i++){
      for(let j=0; j < shape[i].length; j++){
        if(shape[i][j]==1){
          // chỗ block thì r,c ở đó = true;
          const r = row + i;
          const c = col + j;
          if (r < gridSize && c < gridSize) {
            tempMap[r][c] = true;
          }
        }
      }
    }
     const { rows: fullRows, cols: fullCols} = this.mapForHighlight(tempMap);
     this.eligible(fullRows,fullCols,this.highlightEli.bind(this));
    //  console.log(fullCols, fullRows);
     
    // console.log(fullRows,fullCols);
    
    
}

  private mapForHighlight(map: boolean[][]): { rows: number[], cols: number[] } {
    const fullRows: number[] = [];
    const fullCols: number[] = [];
    const size = map.length;
  
    for(let r=0; r<size;r++){
      const isFull = map[r].every(cell=> cell);
      if(isFull) fullRows.push(r);
    }
    
    for(let c = 0; c < size; c++){
      const isFull = map.every(cell => cell[c]);
      if(isFull) fullCols.push(c);
    }
  
    return { rows: fullRows, cols: fullCols };
  }
  private resetHighlights(): void {
    const grid = this.containerWM.blockGrid;
    const size = this.containerWM.gridSize;
  
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const cell = grid[row][col];
        const block = cell.blockRef;
        const pos = cell.parentBlockPos;
  
        if (block && pos) {
          if (block === this.selectedBlock) continue;
          const localRow = row - pos.y;
          const localCol = col - pos.x;
  
          const isInBlockShape =
            localRow >= 0 &&
            localCol >= 0 &&
            localRow < block.tiles.length &&
            localCol < block.tiles[localRow]?.length;
           // console.log(isInBlockShape);
            
  
          if (isInBlockShape) {
            const tile = block.tiles[localRow][localCol];
  
            if (tile && this.originalTextureMap.has(tile)) {
              const originalTexture = this.originalTextureMap.get(tile);
              if (originalTexture) {
                tile.texture = originalTexture;
                this.originalTextureMap.delete(tile); 
              }
            }
          }
        }
      }
    }
  }

  private checkExploedLines(): {rows: number[], cols: number[]}{
    const exCols: number[] = [];
    const exRows: number[] = [];
    const grid = this.containerWM.blockGrid;
    const size = this.containerWM.gridSize;
    
    //check row
    for(let row = 0; row< size; row++){
      // every( ktr dki của chung 1 mảng) vd: [2,4,6] every(mod 2);
      const isFull = grid[row].every(row => row.occupied);
      if(isFull) exRows.push(row);
    }
    //check col
    for (let col = 0; col < size; col++) {
      const isFull = grid.every(row => row[col].occupied);
      if(isFull) exCols.push(col);
    }

    if(exCols.length || exRows.length){
      console.log("boom");
      this.exploreBlock(exRows, exCols);
    }
    return{ rows: exRows, cols: exCols};
  }
  
  private exploreBlock(exRows: number[], exCols: number[]){
    this.eligible(exRows, exCols, this.explore.bind(this));
    
      const grid = this.containerWM.blockGrid;
      const gridSize = this.containerWM.gridSize;

      for(const row of exRows){
        for(let col = 0; col<gridSize; col++){
          const cell = grid[row][col];
          if(cell.occupied && cell.blockRef){
            cell.occupied = false;
            cell.blockRef = null;
            cell.parentBlockPos = null;
          }
        }
      }
     for( const col of exCols){
        for( let row = 0; row < gridSize; row++){
          const cell = grid[row][col];
          if (cell.occupied && cell.blockRef) {
            cell.occupied = false;
            cell.blockRef = null;
            cell.parentBlockPos = null;
          }
        }
     }
    //  bldestroy.forEach(blocks =>{
    //   blocks.destroy({children: true});
      // const colorNameMap: Record<string, string> = {
      //   block_1: "pink",
      //   block_2: "purple",
      //   block_3: "cyan",
      //   block_4: "green",
      //   block_5: "orange",
      //   block_6: "red",
      // };
      // const textureName = blocks.texture; 
      // console.log(textureName);
           
      // if(textureName){
      //   const colorName = colorNameMap[textureName];
      //   const frames = [];
      //   for (let i = 1; i < 10; i++) {
      //     if (!frames) {
      //       console.warn(" Texture jewel_green_${colorName} chưa được preload!`);
      //       return;
      //     }
      //     frames.push(Assets.get(`jewel_green_${colorName}`))
      //   }
      //   const anim = new AnimatedSprite(frames);
      //   anim.animationSpeed = 0.15;
      //   anim.play();
      //   anim.x = blocks.x;
      //   anim.y = blocks.y;
      //   this.app.stage.addChild(anim);     
      //   anim.onComplete = () => {
      //   anim.destroy();
      //   };    
      // }
    //})
    
  }
  private eligible(fullRows: number[], fullCols: number[],callback: (tile: Sprite | null, localRow: number, localCol: number) => void){
    const grid = this.containerWM.blockGrid;
    const gridSize = this.containerWM.gridSize;
    if (fullCols.length > 0 || fullRows.length > 0) {
      for(const row of fullRows){
        for(let col = 0; col < gridSize; col++){
          // cột trong hàng
          const cell = grid[row][col];
          // block tổng tại hàng đó
          const block = cell.blockRef;
          // vị trí x,y của block đó
          const pos = cell.parentBlockPos;
          
          if (block && pos) {
            const localRow = row - pos.y;
            const localCol = col - pos.x;

              // Kiểm tra nằm trong giới hạn matrix trước khi truy cập
              const isInBlockShape =
                localRow >= 0 &&
                localCol >= 0 &&
                localRow < block.tiles.length &&
                localCol < block.tiles[localRow]?.length;

              if (isInBlockShape) {
                const tile = block.tiles[localRow][localCol];
                callback(tile, localRow, localCol);

                //this.highlightEli(tile,localRow,localCol);
              }

          }
          
        }
      }
    }
    for (const col of fullCols) {
      for (let row = 0; row < gridSize; row++) {
        const cell = grid[row][col];
        const block = cell.blockRef;
        const pos = cell.parentBlockPos;
    
        if (block && pos) {
          const localRow = row - pos.y;
          const localCol = col - pos.x;
    
          const isInBlockShape =
            localRow >= 0 &&
            localCol >= 0 &&
            localRow < block.tiles.length &&
            localCol < block.tiles[localRow]?.length;
    
          if (isInBlockShape) {
            const tile = block.tiles[localRow][localCol];
            callback(tile, localRow, localCol);

            //this.highlightEli(tile,localRow,localCol);
          }
        }
      }
    }
  }
  private highlightEli(tile: Sprite | null,localRow: number,localCol: number){
    if (tile) {
      if (!this.originalTextureMap.has(tile)) {
        this.originalTextureMap.set(tile, tile.texture);
        if(this.selectedBlock){
          tile.texture = Assets.get(this.selectedBlock.texture);
        }
        // tile.destroy({children:true})
      }
    } else {
      console.warn(`Không tìm thấy tile tại local[${localRow}][${localCol}]`);
  }
  }
  private explore(tile: Sprite | null,localRow: number,localCol: number){
    if (tile) {
      if(this.selectedBlock){
        // tile.texture = Assets.get(this.selectedBlock.texture);
        console.log(this.selectedBlock.texture);
        
      }
         tile.destroy({children:true})
    } else {
      console.warn(`Không tìm thấy tile tại local[${localRow}][${localCol}]`);
    }
  //     const colorNameMap: Record<string, string> = {
  //       block_1: "pink",
  //       block_2: "purple",
  //       block_3: "cyan",
  //       block_4: "green",
  //       block_5: "orange",
  //       block_6: "red",
  //     };
  //     const textureName = blocks.texture; 
  //     console.log(textureName);
           
  //     if(textureName){
  //       const colorName = colorNameMap[textureName];
  //       const frames = [];
  //       for (let i = 1; i < 10; i++) {
  //         if (!frames) {
  //           console.warn(" Texture jewel_green_${colorName} chưa được preload!`);
  //           return;
  //         }
  //         frames.push(Assets.get(`jewel_green_${colorName}`))
  //       }
  //       const anim = new AnimatedSprite(frames);
  //       anim.animationSpeed = 0.15;
  //       anim.play();
  //       anim.x = blocks.x;
  //       anim.y = blocks.y;
  //       this.app.stage.addChild(anim);     
  //       anim.onComplete = () => {
  //       anim.destroy();
  //       };    
  //     }
   }
}
