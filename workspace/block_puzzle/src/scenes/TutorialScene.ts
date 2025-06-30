/* eslint-disable prettier/prettier */
import { GameScene } from "./GameScene";
import { Blocks } from "../models/Blocks";
import { SceneManager } from "../handle/SceneManager";
import { BlockShapeLibrary } from "../models/BlockShape";
import { Application, Assets, Sprite } from "pixi.js";

export class TutorialScene extends GameScene {
    private currentStep = 0;
    private blocks !: Blocks;
    private app!: Application;

    constructor() {
        super();
      //  this.blocks = new Blocks(BlockSa)
    }

    override init(): void {
        super.init();
        this.app = SceneManager.getApp();
        this.blockPickManager.on("blockPlaced", () => {
            if (this.currentStep === 0) {
                setTimeout(() => this.startStep(1), 1000);
            } else if (this.currentStep === 1) {
                setTimeout(() => this.startStep(2), 1000);
            } else if (this.currentStep === 2) {
                setTimeout(() => this.setupStep3(), 500);
            }
        });
    
        this.startStep(0);
    }
    

    private startStep(step: number) {
        this.currentStep = step;
        if (step === 0) {
            this.setupStep1();
        } 
        else if (step === 1) {
            this.setupStep2();
        }else if (step === 2) {
            this.finishTutorial();
        }
    }

    private setupStep1() {
        const shape = [
            [1, 1, 1, 0, 0, 1, 1, 1],
            [1, 1, 1, 0, 0, 1, 1, 1],
          //  [0,0,0, 0, 0, 0,0,0],
        ];
        const blockSize = this.worldMap.getBlockSize();
        const block = new Blocks(shape, "block_1", blockSize);
        block.tiles = [];

        const startRow = 3;
        const startCol = 0;
     //   const localPos = this.toLocal
        block.x = this.worldMap.blockGrid[startRow][startCol].x + this.worldMap.x;
        block.y = this.worldMap.blockGrid[startRow][startCol].y + this.worldMap.y;
        
        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 8; col++) {
                if (shape[row][col] === 1) {
                    const cell = this.worldMap.blockGrid[startRow + row][startCol + col];            
                    cell.occupied = true;
                    cell.blockRef = block;
                    cell.parentBlockPos = { x: startCol + col, y: startRow + row };

                //    block.tiles.push(cell);
                }
            }
        }
    
        this.gridBlockContainer.addChild(block);
        this.clearPickArea();
    
        const blockPick = new Blocks(BlockShapeLibrary.getShape1(), "block_2", 20);
        blockPick.x = window.innerWidth/2 ;
        blockPick.y = this.app.screen.height*0.9 - blockPick.shapeSize/2;
        this.pickBlockContainer.addChild(blockPick);
        this.blockPickManager.addBlock(blockPick);
        this.effect(this.app.screen.width/2,this.app.screen.height/2,blockPick.x,blockPick.y);
    }
    

    private setupStep2() {
        const shape = [
            [0, 0, 0, 1, 1, 0, 0, 0],
            [0, 0, 0, 1, 1, 0, 0, 0],
            [0, 0, 0, 1, 1, 0, 0, 0],
            [1, 1, 1, 0, 0, 1, 1, 1],
            [1, 1, 1, 0, 0, 1, 1, 1],
            [0, 0, 0, 1, 1, 0, 0, 0],
            [0, 0, 0, 1, 1, 0, 0, 0],
            [0, 0, 0, 1, 1, 0, 0, 0],
        ];
        const block = new Blocks(shape, "block_1", 50);
    
        const startRow = 0;
        const startCol = 0;
    
        block.x = this.worldMap.blockGrid[startRow][startCol].x + this.worldMap.x;
        block.y = this.worldMap.blockGrid[startRow][startCol].y + this.worldMap.y;
    
        for (let row = 0; row < shape.length; row++) {
            for (let col = 0; col < shape[row].length; col++) {
                if (shape[row][col] === 1) {
                    const cell = this.worldMap.blockGrid[startRow + row][startCol + col];
                    cell.occupied = true;
                    cell.blockRef = block;
                  //  cell.parentBlockPos = { x: startCol, y: startRow };
                }
            }
        }
    
        this.gridBlockContainer.addChild(block);
        this.clearPickArea();
    
        const blockPick = new Blocks(BlockShapeLibrary.getShape1(), "block_2", 20);
        blockPick.x = this.app.screen.width/2 - blockPick.shapeSize/2;
        blockPick.y = this.app.screen.height*0.9 - blockPick.shapeSize/2;
        this.pickBlockContainer.addChild(blockPick);
        this.blockPickManager.addBlock(blockPick);
        this.effect(this.app.screen.width/2,this.app.screen.height/2,blockPick.x,blockPick.y);
    }

    private setupStep3(){
        SceneManager.changeScene(new GameScene());
    }
    private clearPickArea() {
        this.pickBlockContainer.removeChildren();
        this.blockPickManager.clearPickBlocks();
    }
    private effect(targetX: number, targetY: number, x: number, y: number){
        const sprite = new Sprite(Assets.get("hand"));
        sprite.x = x + 50;
        sprite.y = y + 50;
        sprite.width = 50;
        sprite.height = 50;
        sprite.anchor.set(0.5,0.5);
       
        setTimeout(()=> this.effectsUI.hand(sprite, targetX, targetY, sprite.x, sprite.y,() => {
            this.removeChild(sprite);
            sprite.destroy();
        }), 1000);
        this.addChild(sprite)
    }
    private finishTutorial() {
        localStorage.setItem("seen_tutorial", "true"); 
        SceneManager.changeScene(new GameScene());
    }
}
