/* eslint-disable prettier/prettier */
import { Application, Assets, Container, Sprite } from "pixi.js";
import { Blocks } from "./Blocks";
import { Effects } from "./Effects";

export class WorldMap extends Container{
    public gridSize: number = 8;
    public blockSize: number = 0;
    private offset: number ;
    public app: Application;
    public gridOffsetX: number;
    public gridOffsetY : number;
    public blockGrid:{x: number, y: number; occupied: boolean, sprite: Sprite, blockRef: Blocks| null,parentBlockPos?:{ x: number; y: number }|null  }[][] = [];  
    private effectsUI : Effects;
    constructor(offset: number, app: Application){
        super();
        this.offset = offset;
        this.app = app;
        // this.gridOffsetX   = Math.round(app.screen.width/2 - (this.gridSize*this.blockSize)/2);
        // this.gridOffsetY   =  Math.round(app.screen.height / 2 + offset - (this.gridSize * this.blockSize) / 2); 
        const availableWidth = app.screen.width * 0.6;
        const availableHeight = app.screen.height * 0.6;
        this.blockSize = Math.floor(Math.min(availableWidth, availableHeight) / this.gridSize);
        this.gridOffsetX = - (this.gridSize * this.blockSize) / 2;
        this.gridOffsetY = - (this.gridSize * this.blockSize) / 2;
        this.x = app.screen.width / 2;
        this.y = app.screen.height / 2; 
        this.effectsUI = new Effects(this); 
        this.init();
    }
    public init(){
      this.drawGrid();
    }
    public drawGrid() {
      const tileLayer = new Container();
      for (let row = 0; row < this.gridSize; row++) {
        for (let col = 0; col < this.gridSize; col++) {
          const tileT = Assets.get("block_7");
          const tileS = new Sprite(tileT);
          tileS.width = this.blockSize;
          tileS.height = this.blockSize;
    
          const x = col * this.blockSize +this.gridOffsetX;
          const y = row * this.blockSize +this.gridOffsetY;

    
          tileS.x = x;
          tileS.y = y;
    
          if (!this.blockGrid[row]) this.blockGrid[row] = [];
          this.blockGrid[row][col] = {
            x,
            y,
            occupied: false,
            sprite: tileS,
            blockRef: null,
            parentBlockPos: null,
          };
    
          tileLayer.addChild(tileS);
        //  tileLayer.addChild(tileS2);
    
          // const delay = (row + col) * 0.05;
          // this.effectsUI.newMapEffect(tileS, x, y, delay);
        }
      }
    
      this.addChild(tileLayer);
    }
    
    
  public canSnapBlock(block: Blocks) : boolean{
      const grid = this.blockGrid;
      const gridSize = this.gridSize;
      const shape = block.getShape();
      const shapeRow = shape.length;
      const shapeCol = shape[0].length; 
      for(let row = 0; row <= gridSize - shapeRow; row++){
        for(let col = 0; col <= gridSize - shapeCol; col++){
          let canSnap = true;
          for(let i = 0; i < shapeRow; i++){
            for(let j = 0; j< shapeCol; j++){
              if (shape[i][j] === 1) {
                const r = row + i;
                const c = col + j;
                if (
                  r < 0 || r >= gridSize ||
                  c < 0 || c >= gridSize ||
                  grid[r][c].occupied
                ) {
                  canSnap = false;
                  break;
                }
              }
            }
            if(!canSnap) break;
          }
          if (canSnap) {
            return true;
          }
        }
      }
            
      return false;
   }
   public getBlockSize(){
    return this.blockSize;
   }
  public setBlockSize(size: number) {
    this.blockSize = size;
    this.gridOffsetX = - (this.gridSize * this.blockSize) / 2;
    this.gridOffsetY = - (this.gridSize * this.blockSize) / 2;

    for (let row = 0; row < this.gridSize; row++) {
        for (let col = 0; col < this.gridSize; col++) {
            const cell = this.blockGrid[row][col];
            const x = col * this.blockSize + this.gridOffsetX;
            const y = row * this.blockSize + this.gridOffsetY;

            cell.x = x;
            cell.y = y;

            cell.sprite.x = x;
            cell.sprite.y = y;
            cell.sprite.width = this.blockSize;
            cell.sprite.height = this.blockSize;
        }
    }

    // Cập nhật vị trí block đã snap
    const resizedBlocks = new Set<Blocks>();

    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const cell = this.blockGrid[row][col];
        const block = cell.blockRef;
    //&&block.parent && block.tiles?.length > 0
        if (block && !resizedBlocks.has(block)&&block.parent && block.tiles?.length > 0) {
          block.reSize(this.blockSize);
          block.x = this.blockGrid[cell.parentBlockPos!.y][cell.parentBlockPos!.x].x;
          block.y = this.blockGrid[cell.parentBlockPos!.y][cell.parentBlockPos!.x].y;
          resizedBlocks.add(block);
        }
      }
    }
    
}

    
//    public resize(newBlockSize: number, offsetX: number, offsetY: number) {
//  //   this.removeChildren();  

//     // this.blockSize = newBlockSize;
//     // this.gridOffsetX = offsetX;
//     // this.gridOffsetY = offsetY;

//    // this.drawGrid();  
// }
}