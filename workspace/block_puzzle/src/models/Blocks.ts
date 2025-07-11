/* eslint-disable prettier/prettier */
import { Assets, Container, Rectangle, Sprite } from "pixi.js";
import { BlockShape } from "./BlockShape";
import { Effects } from "./Effects";

interface TileSprite extends Sprite {
    textureName?: string;
  }
  
export class Blocks extends Container{
    public shapeSize: number;
    private matrix: BlockShape;
    public texture: string;
    public originalX: number;
    public originalY: number;
    public canPick: boolean = true;
    public tiles: Sprite[][] = [];
    public isActive: boolean = true;
    private effectsUI : Effects;
    private originalSize: number = 20;

    constructor(matrix: BlockShape, texture : string, shapeSize: number){
        super();
        this.shapeSize = shapeSize;
        this.matrix = matrix;
        this.texture = texture;
        this.originalX = 0;
        this.originalY = 0;
        this.effectsUI = new Effects(this);
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
                    this.interactive = true;
                    this.hitArea = new Rectangle(
                    -this.shapeSize * 0.5,
                    -this.shapeSize * 0.5,
                    this.width + this.shapeSize,
                    this.height + this.shapeSize
                    );

                }else {
                    tileRow.push(null as unknown as Sprite); 
                }
            }
            this.tiles.push(tileRow);
        }
        this.interactive = true;
        const padding = 10;
        const width = this.shapeSize * this.matrix[0].length;
        const height = this.shapeSize * this.matrix.length;

        this.hitArea = new Rectangle(
            -padding,
            -padding,
            width + padding * 2,
            height + padding * 2
        );
    }
    public reSize(newSize: number){
        this.effectsUI.zoomBlock(this, newSize);
     //   this.shapeSize = newSize;
   //     this.renderBlocks();
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

    public saveOriginalSize(size: number): void {
        this.originalSize = size;
      }
      
    public resetToOriginalSize(): void {
        this.reSize(this.originalSize);
    }
    
}