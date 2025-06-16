/* eslint-disable prettier/prettier */
import { Container } from "pixi.js";

export abstract class BaseScene extends Container{
    constructor(){
        super();
    }
    abstract init(): void;
    abstract destroyScene(): void;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public onResize(width: number, height: number): void{
    }
}