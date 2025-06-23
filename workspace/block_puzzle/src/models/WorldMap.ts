/* eslint-disable prettier/prettier */
import { Application, Assets, Container, Sprite } from "pixi.js";
import { Blocks } from "./Blocks";

export class WorldMap extends Container{
    public gridSize: number = 8;
    public blockSize: number = 50;
    private offset: number ;
    public app: Application;
    public gridOffsetX: number;
    public gridOffsetY : number;
    public blockGrid:{x: number, y: number; occupied: boolean, sprite: Sprite, blockRef: Blocks| null,parentBlockPos?:{ x: number; y: number }|null  }[][] = [];  
    constructor(offset: number, app: Application){
        super();
        this.offset = offset;
        this.app = app;
        this.gridOffsetX   = Math.round(app.screen.width/2 - (this.gridSize*this.blockSize)/2);
        this.gridOffsetY   =  Math.round(app.screen.height / 2 + offset - (this.gridSize * this.blockSize) / 2);  
        this.init();
    }
    public init(){
        const tileLayer = new Container();
        for(let row = 0 ; row<this.gridSize; row++){
            for(let col = 0 ; col<this.gridSize; col++){
                const tileT = Assets.get("block_7");
                const tileS = new Sprite(tileT);
        
                tileS.width = this.blockSize;
                tileS.height = this.blockSize;
        
                tileS.x = Math.round(this.gridOffsetX + col * this.blockSize);
                tileS.y = Math.round(this.gridOffsetY + row * this.blockSize);
        
                if(!this.blockGrid[row]) this.blockGrid[row] = [];
                this.blockGrid[row][col] = {x: tileS.x , y: tileS.y, occupied: false, sprite: tileS,blockRef: null,parentBlockPos: null};

        
                tileLayer.addChild(tileS);
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
    
}