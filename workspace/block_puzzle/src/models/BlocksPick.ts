/* eslint-disable prettier/prettier */

import { AnimatedSprite, Application, Assets, Container, EventEmitter, FederatedPointerEvent, Sprite, Texture } from "pixi.js";
import { Blocks } from "../models/Blocks";
import { sound } from "@pixi/sound";
// import { GameScene } from "../scenes/GameScene";
import { WorldMap } from "../models/WorldMap";
import { InputController } from "../handle/InputController";
import { SceneManager } from "../handle/SceneManager";
import { LoseScene } from "../scenes/LoseScene";
import { GameScene } from "../scenes/GameScene";
// import gsap from "gsap";

interface Cell {
  x: number;
  y: number;
  occupied: boolean;
  sprite: Sprite;
  blockRef: Blocks | null;
  parentBlockPos?: { x: number; y: number } | null;
}


export class BlocksPick {
  private container: Container;
  private pickBlock: Blocks[] = [];
  private selectedBlock: Blocks | null = null;
  private snapPreview: Blocks | null = null;
  private offsetX = 0;
  private offsetY = 0;
  private app: Application;
  private hasPlayedClickSound = false;
  private onDragMoveEvent ?: ( event : FederatedPointerEvent) => void;
  private snappedCount = 3;
  private onResetCallBack ?: () => void;
  private containerWM: WorldMap;
  private containerGS: GameScene;
  private lastSnapRow: number | null = null;
  private lastSnapCol: number | null = null;
  private originalTextureMap = new WeakMap<Sprite, Texture>();
  private cellsToDes: Cell[] = [];
  private numRCScore: { rows: number; cols: number }[] = [];
  private remainingAnimations = 0;
  private onScoreCallBack ?: (insSCore: number, totalLines: number) => void;
  private isGameOver = false;
  private inputController : InputController;
  private eventEmitter: EventEmitter;
  private blockSize : number = 0;
  
  private animExplore !: AnimatedSprite;
  private frames: Texture[] = [];
  
  
  constructor(container: Container,app: Application, gameScene: GameScene) {
    this.container = container;
    this.app = app;
    this.containerWM = this.container as WorldMap;
    this.containerGS =  gameScene;
    this.inputController = new InputController(app.stage);
    this.eventEmitter = new EventEmitter();
    app.ticker.add(this.update, this);
  }


  public addBlock(block: Blocks): void {
    block.canPick = true; 
    block.isActive = true; 
    this.pickBlock.push(block);
    this.app.stage.eventMode = "static";
    this.app.stage.hitArea = this.app.screen;
    this.attachEvents(block);
    this.updateBlockVisib();
  }

  private attachEvents(block: Blocks): void {
    block.eventMode = "static";
    block.cursor = "pointer";
    block.on("pointerdown", (event: FederatedPointerEvent) => {
        if (!block.canPick) return;
        this.onDragStart(block, event);
        sound.play("click");
      });
      
  }


  private onDragStart(block: Blocks, event: FederatedPointerEvent): void {
    this.selectedBlock = block;

    if(block.parent){
      block.parent.setChildIndex(block,block.parent.children.length-1);
    }

    const pivotX = (block.width);
    const pivotY = (block.height*2);
    block.pivot.set(pivotX, pivotY);

    const global = event.global;
    this.offsetX = global.x - block.x;
    this.offsetY = global.y - block.y;

    block.saveOriginalSize(block.shapeSize);
    block.reSize(this.containerWM.blockSize);
    block.saveOriginalPosition(block.x,block.y);

    this.onDragMoveEvent = (event: FederatedPointerEvent) => this.onDragMove(block,event);
    this.app.stage.on("pointermove",this.onDragMoveEvent);
  }
  private onDragMove(block: Blocks,event: FederatedPointerEvent): void {
    if (this.selectedBlock !== block) return;
    
    const localPos = this.selectedBlock.parent.toLocal(event.global);

    this.selectedBlock.position.set(Math.round(localPos.x-this.offsetX) , Math.round(localPos.y-this.offsetY));
    
    const snapPos = this.getSnapBlockPos(Math.round(this.selectedBlock.x),Math.round( this.selectedBlock.y));
    if (snapPos) {
        if (!this.snapPreview) {
            this.snapPreview = new Blocks(block.getShape(), block['texture'], this.containerWM.blockSize);
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

    // set pivot về gốc trái rồi điều chỉnh lại vị trí
    const pivotX = this.selectedBlock.pivot.x;
    const pivotY = this.selectedBlock.pivot.y;
    this.selectedBlock.pivot.set(0, 0);
    const adjustedX = this.selectedBlock.x - pivotX;
    const adjustedY = this.selectedBlock.y - pivotY;

    const pos =  this.getSnapBlockPos(adjustedX, adjustedY);

    if(pos){      
      this.selectedBlock.position.set(Math.round(pos.x),Math.round( pos.y));
      this.selectedBlock.canPick = false;
      this.selectedBlock.isActive = false;

      this.container.addChild(this.selectedBlock);

      const shape = this.selectedBlock.getShape();
      const shapeRow = shape.length;
      const shapeCol = shape[0].length;
      this.blockSize = this.containerWM.blockSize;

      const startRow = Math.floor((pos.y - this.containerWM.gridOffsetY)/this.blockSize);
      const startCol = Math.floor((pos.x - this.containerWM.gridOffsetX) / this.blockSize); 
     
      this.snappedCount--;
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
      if(this.snappedCount <= 0 && this.onResetCallBack){
        this.snappedCount = 3;
        this.onResetCallBack();
      }
      // this.checkExploedLines();
      const exploded = this.checkExploedLines();
      // Nếu không có dòng/cột nào nổ thì updateBlockVisib
      if (exploded.rows.length === 0 && exploded.cols.length === 0) {
        this.updateBlockVisib();
      }
      this.eventEmitter.emit("blockPlaced");
      
    } else {
       this.selectedBlock.resetToOriginalSize();
       this.selectedBlock.resetToOriginalPosition(); // trả về chỗ cũ nếu sai
       this.resetHighlights();
    }
    this.selectedBlock.alpha = 1;
    this.selectedBlock = null;
  }
  private getSnapBlockPos(x: number, y: number): { x: number, y: number, row: number, col: number } | null {
    
    if (!this.selectedBlock) return null;
    
    const blockSize = this.containerWM.blockSize;

    const shape = this.selectedBlock.getShape();
    const shapeRow = shape.length;
    const shapeCol = shape[0].length;

    const localPos = this.containerWM.toLocal({ x, y });
    const locX = localPos.x - this.selectedBlock.pivot.x;
    const locY = localPos.y - this.selectedBlock.pivot.y;
    
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

    for(const row of exRows){
      for (let col = 0; col < size; col++) {
      this.cellsToDes.push(grid[row][col]);
      }
    }
    for (const col of exCols) {
      for (let row = 0; row < size; row++) {
        if (!exRows.includes(row)) {
          this.cellsToDes.push(grid[row][col]);
        }
      }
    }


    if(exCols.length || exRows.length){
    
      
      this.numRCScore.push({
        rows: exRows.length,
        cols: exCols.length
      });
      this.exploreBlock(exRows, exCols);
    }
    return{ rows: exRows, cols: exCols};
  }
  
  private exploreBlock(exRows: number[], exCols: number[]){
 //     this.eligible(exRows, exCols, this.explore.bind(this));
      const grid = this.containerWM.blockGrid;
      const gridSize = this.containerWM.gridSize;
      for(const row of exRows){
        for(let col = 0; col<gridSize; col++){
          const cell = grid[row][col];
          if(cell.occupied && cell.blockRef){
            // cell.occupied = false;
            // cell.blockRef = null;
            // cell.parentBlockPos = null;           
          }
        }
      }
     for( const col of exCols){
        for( let row = 0; row < gridSize; row++){
          const cell = grid[row][col];
          if (cell.occupied && cell.blockRef) {
            // cell.occupied = false;
            // cell.blockRef = null;
            // cell.parentBlockPos = null; 
          }
        }
     }
     if (this.cellsToDes.length > 0) {
      this.explore(); 
    }
  }
  private eligible(fullRows: number[], fullCols: number[],callback: (tile: Sprite | null, localRow: number, localCol: number) => void){
    const grid = this.containerWM.blockGrid;
    const gridSize = this.containerWM.gridSize;

    if (fullCols.length > 0 || fullRows.length > 0) {
      for(const row of fullRows){
     //   this.exploreMotion();
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
          }
        }
      }
    }
  }
  public removeBlock(block: Blocks) {
    if (block.parent) {
        block.parent.removeChild(block);
    }
    block.destroy({ children: true });
}
  private explore() {
    if (!this.selectedBlock) return;

    const colorNameMap: Record<string, string> = {
      block_1: "pink",
      block_2: "purple",
      block_3: "cyan",
      block_4: "green",
      block_5: "orange",
      block_6: "red",
    };
    const textureName = this.selectedBlock.texture;
    const colorName = colorNameMap[textureName];
    const baseFrames: Texture[] = [];

    for (let i = 1; i < 10; i++) {
      const texture = Assets.get(`jewel_${colorName}_${i}`);
      baseFrames.push(texture);
    }

    const hitSounds = ["hit1", "hit2", "hit3", "hit4", "hit5", "hit6"];
    let soundPlayed = false;

    this.remainingAnimations = this.cellsToDes.length;

    this.cellsToDes.forEach((cell, index) => {
      const one = this.cellsToDes.length <= 8;
      const delay = index * (one ? 30 : 10);

      setTimeout(() => {
        const anim = new AnimatedSprite(baseFrames);
        anim.animationSpeed = 0.6;
        anim.loop = false;
        anim.anchor.set(0.5);

        const localPos = this.containerWM.toGlobal({ x: cell.x, y: cell.y });
        // anim.width = this.containerWM.blockSize*1.2;
        // anim.height = this.containerWM.blockSize*1.5;
        anim.x = localPos.x;
        anim.y = localPos.y;
        this.app.stage.addChild(anim);
        anim.play();
        if (!soundPlayed) {
          const hit = hitSounds[Math.floor(Math.random() * hitSounds.length)];
          sound.play(hit);
          soundPlayed = true;
        }
        
        anim.onComplete = () => {
          anim.destroy();
          const block = cell.blockRef;
          const pos = cell.parentBlockPos;
          if (block && pos) {
            const indices = this.getCellIndex(cell);
            if (!indices) return;

            const { row, col } = indices;
            const localRow = row - pos.y;
            const localCol = col - pos.x;

            const tile = block.tiles?.[localRow]?.[localCol];
            if (tile) {
              tile.destroy({ children: true });
            }

            cell.occupied = false;
            cell.blockRef = null;
            cell.parentBlockPos = null;
         }

          this.remainingAnimations--;
          if (this.remainingAnimations === 0) {
            const { score, totalLines } = this.calculateScore();
            if (this.onScoreCallBack) {
              this.onScoreCallBack(score, totalLines);
            }
            this.cellsToDes.length = 0;
            this.updateBlockVisib();
          }
        };
      }, delay);
    });
  }
  private getCellIndex(cell: Cell): { row: number, col: number } | null {
    const grid = this.containerWM.blockGrid;
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c] === cell) {
          return { row: r, col: c };
        }
      }
    }
    return null;
  }


  private highlightEli(tile: Sprite | null,localRow: number,localCol: number){
    if (tile) {
      if (!this.originalTextureMap.has(tile)) {
        this.originalTextureMap.set(tile, tile.texture);
        if(this.selectedBlock){
          tile.texture = Assets.get(this.selectedBlock.texture);
        }
      }
    } else {
      console.warn(`Không tìm thấy tile tại local[${localRow}][${localCol}]`);
    }
  }
   private calculateScore(): { score: number, totalLines: number } {
    let totalScore = 0;
    let totalLines = 0;
  
    for (const entry of this.numRCScore) {
      const lines = entry.rows + entry.cols;
      totalLines += lines;
  
      if (lines > 0) {
        totalScore += lines * lines * 10;
      }
    }
  
    this.numRCScore.length = 0;
  
    return { score: totalScore, totalLines };
  }
  

  public setScore(callback: (insScore: number, totalLines: number)=> void): void{
    this.onScoreCallBack = callback;
  }


  private updateBlockVisib(): void{
    for (const block of this.pickBlock) {
      if(!block.isActive) continue;
      const canSnap = this.containerWM.canSnapBlock(block);
      block.alpha = canSnap ? 1 : 0.3;
      block.canPick = canSnap;
    }
    requestAnimationFrame(() => {
      this.checkGameLose();
    });
  }
  private checkGameLose(): void {
    const activeBlocks = this.pickBlock.filter(b => b.isActive);
    if (activeBlocks.length === 0) return;

    const allBlocked = activeBlocks.every(block => {
      return !this.containerWM.canSnapBlock(block);
    });
    //allBlocked && !
    if (allBlocked && !this.isGameOver) {
      this.isGameOver = true;
      console.log(" Game Over!");
      sound.play("lose"); 
      this.highlightRandomBlocks();
    }
  }
  private highlightRandomBlocks(): void {
    const grid = this.containerWM.blockGrid;
    const highlightTexture = Assets.get("block_highlight");

    const numHighlights = 15
    let highlighted = 0;
    let delay = 0;
    while(highlighted < numHighlights){
      const randRow = Math.floor(Math.random() * 8); 
      const randCol = Math.floor(Math.random() * 8);
      const cell = grid[randRow][randCol];
      if (cell.occupied && cell.blockRef) {
        const block = cell.blockRef;
        const pos = cell.parentBlockPos;
        if (!pos) continue;
  
        const localRow = randRow - pos.y;
        const localCol = randCol - pos.x;
        const tile = block.tiles?.[localRow]?.[localCol];
  
        if (tile) {
          setTimeout(() => {
            tile.texture = highlightTexture;
          }, delay);
          delay += 200;
          highlighted++;
        }
      }
    }
    setTimeout(() => {
      SceneManager.init(this.app);
      SceneManager.changeScene(new LoseScene(this.containerGS.currentScore,this.containerGS.bestStoreScore));
    }, delay + 200);
  }
  
  private update(): void{
    if(this.selectedBlock && this.inputController.isPointerPressed()){
        const pos = this.inputController.getPointerPosition();
        this.onDragMove(this.selectedBlock, {global: pos} as FederatedPointerEvent);
    } else if (this.selectedBlock && !this.inputController.isPointerPressed()) {
        this.onDragEnd();
      }
  }
  public clearPickBlocks() {
    this.pickBlock.length = 0;
  }
  public on(event: string, callback: ()=>void){
    this.eventEmitter.on(event, callback);
}

}
