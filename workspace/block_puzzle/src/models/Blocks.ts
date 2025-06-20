/* eslint-disable prettier/prettier */
import { Assets, Container, Sprite } from "pixi.js";
import { BlockShape } from "./BlockShape";

interface TileSprite extends Sprite {
    textureName?: string;
  }
  
export class Blocks extends Container{
    public shapeSize: number;
    private matrix: BlockShape;
    public texture: string;
    public originalX: number;
    public originalY: number;
    public canPick: boolean = false;
    public tiles: Sprite[][] = [];
    constructor(matrix: BlockShape, texture : string, shapeSize: number){
        super();
        this.shapeSize = shapeSize;
        this.matrix = matrix;
        this.texture = texture;
        this.originalX = 0;
        this.originalY = 0;
        // this.o
        this.renderBlocks();
    }
    private renderBlocks(){
        this.removeChildren();
        this.tiles = [];
        for (let row = 0; row < this.matrix.length; row++) {
            const tileRow: Sprite[] = [];
            for (let col = 0; col < this.matrix[row].length; col++) {
                if(this.matrix[row][col] === 1){
                    const tile = new Sprite(Assets.get(this.texture)) as TileSprite;
                    tile.width = this.shapeSize ;
                    tile.height = this.shapeSize ;
                    tile.x = col * this.shapeSize ;
                    tile.y = row * this.shapeSize ; 
                    tile.textureName = this.texture;
                    this.addChild(tile);
                    tileRow.push(tile);
                }else {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    tileRow.push(null as unknown as Sprite); 
                }
            }
            this.tiles.push(tileRow);
        }
        // this.pivot.x = (this.matrix[0].length * this.shapeSize);
        // this.pivot.y = this.matrix.length * this.shapeSize;
    }
    public reSize(newSize: number){
        this.shapeSize = newSize;
        this.renderBlocks();
    }
    public saveOriginalPosition(x: number, y:number) {   
        this.originalX = x;
        this.originalY = y;        
    }
    public resetToOriginalPosition(): void {
        this.x = this.originalX;
        this.y = this.originalY;
    }    
    public getShape(): BlockShape {
        return this.matrix;
      }

}