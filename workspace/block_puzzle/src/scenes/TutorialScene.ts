/* eslint-disable prettier/prettier */
import { GameScene } from "./GameScene";
import { Blocks } from "../models/Blocks";
import { SceneManager } from "../handle/SceneManager";
import { BlockShapeLibrary } from "../models/BlockShape";
import { Application, Assets, Sprite } from "pixi.js";

export class TutorialScene extends GameScene {
    private currentStep = 0;
    private blockPick !: Blocks;
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
            }else if (this.currentStep === 3) {
                setTimeout(() => this.finishTutorial(), 500);
            }
        });
        requestAnimationFrame(()=> this.startStep(0))
    }
    

    private startStep(step: number) {
        this.currentStep = step;
        if (step === 0) {
            this.setupStep1();
        } 
        else if (step === 1) {
            this.setupStep2();
        }else if (step === 2) {
            this.setupStep3();
        }else if (step === 3) {
            this.finishTutorial();
        }
    }

    private setupStep1() {
        const shape = [
            [0, 0, 1, 1, 1, 0, 0, 0],
            [0, 0, 1, 1, 1, 0, 0, 0],
            [0, 0, 1, 1, 1, 0, 0, 0],
            [0, 0, 1, 1, 1, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 0, 0, 0],
            [0, 0, 1, 1, 1, 0, 0, 0],
            [0, 0, 1, 1, 1, 0, 0, 0],
        ];
        const block = new Blocks(shape, "block_1", this.worldMap.getBlockSize());
    
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
                    cell.parentBlockPos = { x: startCol, y: startRow };
                }
            }
        }
    
        this.gridBlockContainer.addChild(block);
        this.clearPickArea();
        this.createPickBlock(2);
    }
    

    private setupStep2() {
        const shape = [
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [1, 1, 1, 0, 1, 1, 1, 1],
            [1, 1, 1, 0, 1, 1, 1, 1],
            [1, 1, 1, 0, 1, 1, 1, 1],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
        ];
        const block = new Blocks(shape, "block_1", this.worldMap.getBlockSize());
    
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
                    cell.parentBlockPos = { x: startCol, y: startRow };
                }
            }
        }
    
        this.gridBlockContainer.addChild(block);
        this.clearPickArea();
        this.createPickBlock(5);
    }
    private setupStep3() {
        this.currentStep = 3;
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
        const block = new Blocks(shape, "block_1", this.worldMap.getBlockSize());
    
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
                    cell.parentBlockPos = { x: startCol, y: startRow };
                }
            }
        }
    
        this.gridBlockContainer.addChild(block);
        this.clearPickArea();
        this.createPickBlock(27);
    }

    private setupStep4(){
        SceneManager.changeScene(new GameScene());
    }
    private createPickBlock(inxdex: number) {
        this.blockPick = new Blocks(BlockShapeLibrary.getShape(inxdex), "block_2", this.shapeSize);
        this.blockPick.x = this.app.screen.width / 2 - this.blockPick.shapeSize / 2;
        this.blockPick.y = this.app.screen.height * 0.9 - this.blockPick.shapeSize / 2;
        this.pickBlockContainer.addChild(this.blockPick);
        this.blockPickManager.addBlock(this.blockPick);
        this.effect(
            this.app.screen.width / 2,
            this.app.screen.height / 2,
            this.blockPick.x,
            this.blockPick.y
        );
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
    override onResize(width: number, height: number): void {
        this.appWidth = width;
        this.appHeight = height;

        this.background.width = width;
        this.background.height = height;
    
        const offsetYTop = -height * 0.4;
        this.layoutHeader(width, height, offsetYTop);
        this.layoutBody(width, height);
        this.layoutFooter(width, height);
    
        const availableWidth = width * (width > 720 ? 0.6 : 0.8);
        const availableHeight = height * 0.6;
        const newBlockSize = Math.floor(Math.min(availableWidth, availableHeight) / this.gridSize);
        this.blockSize = newBlockSize;
    
        this.worldMap.setBlockSize(newBlockSize);
        this.worldMap.resizeForTutorial();      
        this.updateBlockPositions();             
    
        this.updateBlockLayoutPosition();
        this.blockPick.x = width/2;
        
        const pickBlocks = this.pickBlockContainer.children.filter(c => c instanceof Blocks) as Blocks[];
        for (let i = 0; i < pickBlocks.length; i++) {
            pickBlocks[i].x = width/2;
            pickBlocks[i].y = this.blockY;
            pickBlocks[i].reSize(this.shapeSize);
        }
    
        this.layoutSetting(width,height)
    }
    
        updateBlockPositions() {
            const updatedBlocks = new Set<Blocks>();
        
            for (let row = 0; row < this.gridSize; row++) {
                for (let col = 0; col < this.gridSize; col++) {
                    const cell = this.worldMap.blockGrid[row][col];
                    const block = cell.blockRef;
                    if (block && !updatedBlocks.has(block)) {
                        const parentPos = cell.parentBlockPos;
                        if (parentPos) {
                            const parentCell = this.worldMap.blockGrid[parentPos.y][parentPos.x];
                            block.x = parentCell.x + this.worldMap.x;
                            block.y = parentCell.y + this.worldMap.y;
                        }
                        updatedBlocks.add(block);
                    }
                }
            }
        }
        
}