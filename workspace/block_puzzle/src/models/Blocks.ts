/* eslint-disable prettier/prettier */
import { Assets, Container, Sprite } from "pixi.js";
import { BlockShape } from "./BlockShape";

export class Blocks extends Container{
    constructor(matrix: BlockShape, texture : string, tileSize: number){
        super();

        for (let row = 0; row < matrix.length; row++) {
            for (let col = 0; col < matrix[row].length; col++) {
                if(matrix[row][col] === 1){
                    const tile = new Sprite(Assets.get(texture));
                    tile.width = tileSize;
                    tile.height = tileSize;
                    tile.x = col * tileSize;
                    tile.y = row * tileSize;
                    this.addChild(tile);
                }
            }
        }
    this.pivot.x = this.width / 2;
    this.pivot.y = this.height / 2;
    }
}