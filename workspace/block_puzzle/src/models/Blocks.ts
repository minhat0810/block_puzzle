/* eslint-disable prettier/prettier */
import { Assets, Container, Sprite } from "pixi.js";
import { BlockShape } from "./BlockShape";

export class Blocks extends Container{
    public shapeSize: number;
    private matrix: BlockShape;
    private texture: string;
    public originalX: number;
    public originalY: number;
    constructor(matrix: BlockShape, texture : string, blockSize: number){
        super();
        this.shapeSize = blockSize;
        this.matrix = matrix;
        this.texture = texture;
        this.originalX = 0;
        this.originalY = 0;
        // this.o
        this.renderBlocks();
    }
    private renderBlocks(){
        this.removeChildren();
        for (let row = 0; row < this.matrix.length; row++) {
            for (let col = 0; col < this.matrix[row].length; col++) {
                if(this.matrix[row][col] === 1){
                    const tile = new Sprite(Assets.get(this.texture));
                    tile.width = this.shapeSize ;
                    tile.height = this.shapeSize ;
                    tile.x = col * this.shapeSize ;
                    tile.y = row * this.shapeSize ;                  
                    this.addChild(tile);
                }
            }
        }
    this.pivot.x = this.width / 2;
    this.pivot.y = this.height / 2;
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
}