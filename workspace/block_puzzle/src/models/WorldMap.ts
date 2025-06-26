/* eslint-disable prettier/prettier */
import { Application, Assets, Container, Sprite } from "pixi.js";
import { Blocks } from "./Blocks";
import { Effects } from "./Effects";

export class WorldMap extends Container{
    public gridSize: number = 8;
    public blockSize: number = 50;
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
        this.gridOffsetX   = Math.round(app.screen.width/2 - (this.gridSize*this.blockSize)/2);
        this.gridOffsetY   =  Math.round(app.screen.height / 2 + offset - (this.gridSize * this.blockSize) / 2); 
        this.effectsUI = new Effects(this); 
        this.init();
    }
    public init(){
      this.drawGrid();
    }
    public drawGrid(){
      const tileLayer = new Container();
      for(let row = 0 ; row<this.gridSize; row++){
          for(let col = 0 ; col<this.gridSize; col++){
              const tileT = Assets.get("block_7");
              const tileS = new Sprite(tileT);
             // tileS.alpha =
              tileS.width = 0;
              tileS.height = 0;
      
              tileS.x = Math.round(this.gridOffsetX + col * this.blockSize);
              tileS.y = Math.round(this.gridOffsetY + row * this.blockSize);
              const tileT2 = Assets.get("cell");
              const tileS2 = new Sprite(tileT2);
              
              tileS2.width = 0;
              tileS2.height = 0;
      
              tileS.x = Math.round(this.gridOffsetX + col * this.blockSize);
              tileS.y = Math.round(this.gridOffsetY + row * this.blockSize);

              tileS2.x = Math.round(this.gridOffsetX + col * this.blockSize);
              tileS2.y = Math.round(this.gridOffsetY + row * this.blockSize);
      
              if(!this.blockGrid[row]) this.blockGrid[row] = [];
              this.blockGrid[row][col] = {x: tileS.x , y: tileS.y, occupied: false, sprite: tileS,blockRef: null,parentBlockPos: null};

            
              tileLayer.addChild(tileS);
              tileLayer.addChild(tileS2);

              const delay = (row + col) * 0.05;
              this.effectsUI.newMapEffect(tileS,tileS2,tileS.x,tileS.y,delay);

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
    
   public resize(newBlockSize: number, offsetX: number, offsetY: number) {
    this.removeChildren();  

    this.blockSize = newBlockSize;
    this.gridOffsetX = offsetX;
    this.gridOffsetY = offsetY;

    this.drawGrid();  
}
}