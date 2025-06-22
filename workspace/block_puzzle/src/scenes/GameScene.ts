/* eslint-disable prettier/prettier */
import { Application, Assets, Container, Sprite, Text } from "pixi.js";
import { BaseScene } from "./BaseScene";
import { SceneManager } from "../handle/SceneManager";
import { BlockShapeLibrary } from "../models/BlockShape";
import { Blocks } from "../models/Blocks";
// import { InputController } from "../handle/InputController";
import { BlockPickManager } from "../handle/BlockPickManager";
import { WorldMap } from "../models/WorldMap";

export class GameScene extends BaseScene{
    
    private blockPickManager!: BlockPickManager;
    private originalScale = 1;
    private originalPos = { x: 0, y: 0 };
    private isPicked   = false;
    public  blockSize !: number;
    public  gridSize : number = 8;
    private headerContainer     !: Container;
    private bodyContainer       !: Container;
    private pickFooterContainer !: Container;   
    private worldTileContainer  !: Container;
    public  blockGrid            : { x: number, y: number } [][] = [];
    public  gridOffsetX          : number = 0;
    public  gridOffsetY          : number = 0;
    private worldMap            !: WorldMap;
    private   curScore          !: Text;
    private   bestScore         !: Text;
    private   currentScore      : number = 0;
    private   bestStoreScore    : number = 0;
    constructor(){
        super();
    }
    init(): void {
        const app = SceneManager.getApp();
        const offsetYTop = -app.screen.height*0.4;
        const offsetYBottom = -app.screen.height*0.01;
        this.worldMap = new WorldMap(offsetYBottom,app);
        this.headerContainer     = this.header(offsetYTop,app);
        this.bodyContainer       = this.body(offsetYBottom,app);
        this.pickFooterContainer = this.pickFooter(offsetYTop,app);
        this.worldTileContainer  = this.worldMap;
        this.blockPickManager  = new BlockPickManager(this.worldMap,app);
        this.blockPickManager.setResetCallBack(()=>{
            this.createBlocks(app);
        })

        this.blockPickManager.setScore(this.updateScoreDisplay.bind(this));
        const storeBestScore = localStorage.getItem("block_puzzle_score");
        if(storeBestScore){
            this.bestStoreScore = parseInt(storeBestScore,10);
            this.bestScore.text = `${this.bestStoreScore}`;
        }

        this.addChild(this.headerContainer);
        this.addChild(this.bodyContainer);
        this.addChild(this.pickFooterContainer);
        this.addChild(this.worldTileContainer);
        this.createBlocks(app);
    }
    
    private header(offsetYTop: number,app: Application): Container{

        const header = new Container();

        const brgMapSettingT = Assets.get("top_enless");
        const brgMapSettingS = new Sprite(brgMapSettingT);
        brgMapSettingS.width = Math.max(app.screen.width*0.3,350);
        brgMapSettingS.height = app.screen.height*0.15;
        brgMapSettingS.x = app.screen.width/2;
        brgMapSettingS.y = app.screen.height/2 +offsetYTop;
        brgMapSettingS.anchor.set(0.5);

        this.bestScore = new Text({
            text: '0',
            style: {
                fill: '#ffffff',
                fontSize: 30,
                fontFamily: 'MyFont',
            }
        })

        this.curScore = new Text({
            text: '0',
            style: {
                fill: '#ffffff',
                fontSize: 30,
                fontFamily: 'MyFont',
            }
        })
        this.curScore.anchor.set(0.5,0.5)
        this.curScore.x = brgMapSettingS.x+40;
        this.curScore.y = brgMapSettingS.y;

        this.bestScore.anchor.set(0.5,0.5)
        this.bestScore.x = brgMapSettingS.x-110;
        this.bestScore.y = brgMapSettingS.y;

        header.addChild(brgMapSettingS);
        
        header.addChild(this.curScore);
        header.addChild(this.bestScore);
        return header;
    }
    private body(offsetYBottom: number, app: Application): Container{
        const body = new Container();
         //bgr map chính
         const brgMapTexture = Assets.get("block_border");
         const brgMapSprite = new Sprite(brgMapTexture);
         brgMapSprite.width = Math.max(app.screen.width*0.273,350);
         brgMapSprite.height = Math.max(app.screen.width*0.273,350);
         brgMapSprite.x = app.screen.width/2;
         brgMapSprite.y = app.screen.height/2 + offsetYBottom;
         brgMapSprite.anchor.set(0.5);
 
         body.addChild(brgMapSprite);
         return body;
    }
    private pickFooter(offsetYBottom: number, app: Application): Container{
        const pickFooter = new Container();
        const brgMapPickT = Assets.get("middle");
        const brgMapPickS = new Sprite(brgMapPickT);
        brgMapPickS.width = Math.round(Math.max(app.screen.width*0.3,350));
        
        brgMapPickS.height = app.screen.height*0.15;
        brgMapPickS.x = app.screen.width/2;
        brgMapPickS.y = app.screen.height*0.9;
        brgMapPickS.anchor.set(0.5);
        pickFooter.addChild(brgMapPickS);
        return pickFooter;
    }
    private worldTile(blockSize: number, gridSize: number,offset: number,app: Application):Container{
        const tileLayer = new Container();
        
        this.gridOffsetX   = Math.round(app.screen.width/2 - (gridSize*blockSize)/2);
        this.gridOffsetY   =  Math.round(app.screen.height / 2 + offset - (gridSize * blockSize) / 2);  
        this.blockSize = blockSize;
       // console.log(this.gridOffsetX, this.gridOffsetY);
        

        for(let row = 0 ; row<gridSize; row++){
            for(let col = 0 ; col<gridSize; col++){
                const tileT = Assets.get("block_7");
                const tileS = new Sprite(tileT);

                tileS.width = blockSize;
                tileS.height = blockSize;

                tileS.x = Math.round(this.gridOffsetX + col * blockSize);
                tileS.y = Math.round(this.gridOffsetY + row * blockSize);

                if(!this.blockGrid[row]) this.blockGrid[row] = [];
                this.blockGrid[row][col] = {x: tileS.x , y: tileS.y}
             //   console.log(this.blockGrid);
                

                tileLayer.addChild(tileS);
            }
        }
        return tileLayer;
    }
    private createBlocks(app: Application){
        const shapeSize = 20;
        const space = app.screen.width * 0.05; 
        const startX = app.screen.width/2 - 100;
        const startY = app.screen.height * 0.85;
        
        const textureList = ["block_1", "block_2", "block_3", "block_4","block_5", "block_6"];
        for( let i=0; i<3; i++){
            const matrix = BlockShapeLibrary.getRamdomShape();
            const texture = textureList[Math.floor(Math.random() * textureList.length)];
            const block = new Blocks(matrix, texture, shapeSize);
            block.x = startX + i*(shapeSize+space);
            block.y = startY;
            this.addChild(block);
            this.blockPickManager.addBlock(block); 
        }
        
    }
    destroyScene(): void {   
    }
    private layoutHeader(width: number, height: number): void {
        const headerBg = this.headerContainer.children[0] as Sprite;
        headerBg.x = width / 2;
        headerBg.y = height * 0.1;
        headerBg.width = Math.max(width * 0.3, 350);
        headerBg.height = height * 0.15;
    
        const spacing = headerBg.height * 0.25;
    
        this.curScore.x = this.bestScore.x = headerBg.x;
        this.curScore.y = headerBg.y - spacing;
        this.bestScore.y = headerBg.y + spacing;
    }
    private layoutBody(width: number, height: number): void {
        const bodyBg = this.bodyContainer.children[0] as Sprite;
        bodyBg.x = width / 2;
        bodyBg.y = height / 2;
        bodyBg.width = bodyBg.height = Math.max(width * 0.273, 350);
    }
private layoutFooter(width: number, height: number): void {
    const footer = this.pickFooterContainer.children[0] as Sprite;
    footer.x = width / 2;
    footer.y = height * 0.9;
    footer.width = Math.max(width * 0.3, 350);
    footer.height = height * 0.15;
}
        
    onResize(width: number, height: number): void {
        const app = SceneManager.getApp();
        // const coefficientX = this.getScaleFactor(width,height);
        // console.log(coefficientX);
        console.log(width);
        

        const offsetYTop = -height * 0.4;
        const offsetYBottom = -height * 0.01;

        const header = this.headerContainer.children[0] as Sprite;
        header.x = width / 2;
        header.y = height / 2 + offsetYTop;
        header.width = Math.max(width * 0.3 , 350);
        header.height = height * 0.1;
        

        const body = this.bodyContainer.children[0] as Sprite;
        body.x = width / 2;
        body.y = height / 2 + offsetYBottom;
        body.width =  Math.max(width*0.273,350)
        body.height = Math.max(width*0.273,350)

        const footerPick = this.pickFooterContainer.children[0] as Sprite;
        footerPick.x = width / 2;
        footerPick.y = height *0.9;
        footerPick.width = Math.max(width * 0.3 , 350);
        footerPick.height = height * 0.15;
        // console.log(footerPick.x,footerPick.y);

        const newBlockSize = Math.max(width * 0.033, 40);
        this.blockSize = newBlockSize;

        this.removeChild(this.worldTileContainer);
        this.worldTileContainer = this.worldTile(newBlockSize, this.gridSize, offsetYBottom, app);
        this.addChild(this.worldTileContainer);

       
        const blocks = this.children.filter(c => c instanceof Blocks) as Blocks[];
        const space = width * 0.05;
        const startX = width * 0.4;
        const startY = height * 0.85;

        // const shapeSize = Math.max(width * 0.025, 20);
        // console.log(shapeSize);
        
        for (let i = 0; i < blocks.length; i++) {
            blocks[i].x = startX + i * (20 + space);
            blocks[i].y = startY;
            blocks[i].setSize(20); 
        }   
        // this.addChild(blocks)
    }
    public updateScoreDisplay(insSCore: number): void {
        this.currentScore += insSCore;
        this.curScore.text = `${this.currentScore}`;
        if(this.currentScore>this.bestStoreScore){
            this.bestStoreScore = this.currentScore;
            this.bestScore.text = `${this.bestStoreScore}`;
            localStorage.setItem("block_puzzle_score", `${this.bestStoreScore}`);
        }
    }
}