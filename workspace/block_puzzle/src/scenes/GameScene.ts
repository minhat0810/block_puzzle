/* eslint-disable prettier/prettier */
import { Application, Assets, Container, Sprite } from "pixi.js";
import { BaseScene } from "./BaseScene";
import { SceneManager } from "../handle/SceneManager";
import { BlockShapeLibrary } from "../models/BlockShape";
import { Blocks } from "../models/Blocks";
// import { InputController } from "../handle/InputController";
import { BlockPickManager } from "../handle/BlockPickManager";

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
    constructor(){
        super();
    }
    init(): void {
        const app = SceneManager.getApp();
        const offsetYTop = -app.screen.height*0.4;
        const offsetYBottom = -app.screen.height*0.01;
        this.headerContainer     = this.header(offsetYTop,app);
        this.bodyContainer       = this.body(offsetYBottom,app);
        this.pickFooterContainer = this.pickFooter(offsetYTop,app);
        this.worldTileContainer  = this.worldTile(50,this.gridSize,offsetYBottom,app);

        this.blockPickManager  = new BlockPickManager(this,app);

        this.addChild(this.headerContainer);
        this.addChild(this.bodyContainer);
        this.addChild(this.pickFooterContainer);
        this.addChild(this.worldTileContainer);
        this.createBlocks(app);
        // bgr menu
        // const bgrSettingT = Assets.get("bgr_settings");
        // const bgrSettingS = new Sprite(bgrSettingT);
        // bgrSettingS.scale.x = 0.44;
        // bgrSettingS.scale.y = 0.1;
        // bgrSettingS.x = SceneManager.getApp().screen.width/2;
        // bgrSettingS.y = SceneManager.getApp().screen.height/2 +offsetYTop;
        // bgrSettingS.anchor.set(0.5);
    }
    
    private header(offsetYTop: number,app: Application): Container{

        const header = new Container();

        const brgMapSettingT = Assets.get("top_enless");
        const brgMapSettingS = new Sprite(brgMapSettingT);
        //brgMapSettingS.scale.x = 0.4;
        // brgMapSettingS.scale.y = 0.05;
        brgMapSettingS.width = Math.max(app.screen.width*0.3,350);
        brgMapSettingS.height = app.screen.height*0.15;
        brgMapSettingS.x = app.screen.width/2;
        brgMapSettingS.y = app.screen.height/2 +offsetYTop;
        brgMapSettingS.anchor.set(0.5);

        header.addChild(brgMapSettingS);
        return header;
    }
    private body(offsetYBottom: number, app: Application): Container{
        const body = new Container();
         //bgr map chính
         const brgMapTexture = Assets.get("block_border");
         const brgMapSprite = new Sprite(brgMapTexture);
         // brgMapSprite.scale.set(0.4);
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
         //bgr map chính
        const brgMapPickT = Assets.get("middle");
        const brgMapPickS = new Sprite(brgMapPickT);
        // brgMapPickS.scale.x = 0.4;
        // brgMapPickS.scale.y = 0.1;
        brgMapPickS.width = Math.round(Math.max(app.screen.width*0.3,350));
        
        brgMapPickS.height = app.screen.height*0.15;
        brgMapPickS.x = app.screen.width/2;
        brgMapPickS.y = app.screen.height/2 - offsetYBottom;
        brgMapPickS.anchor.set(0.5);
        pickFooter.addChild(brgMapPickS);
        return pickFooter;
    }
    private worldTile(blockSize: number, gridSize: number,offsetYBottom: number,app: Application):Container{
        const tileLayer = new Container();
        
        const gridOffsetX  = Math.round(app.screen.width/2 - (gridSize*blockSize)/2);
        const gridOffsetY = Math.round(app.screen.height / 2 + offsetYBottom - (gridSize * blockSize) / 2);  
        this.blockSize = blockSize;
        

        for(let row = 0 ; row<gridSize; row++){
            for(let col = 0 ; col<gridSize; col++){
                const tileT = Assets.get("block_7");
                const tileS = new Sprite(tileT);

                tileS.width = blockSize;
                tileS.height = blockSize;

                tileS.x = Math.round(gridOffsetX + col * blockSize);
                tileS.y = Math.round(gridOffsetY + row * blockSize);

                if(!this.blockGrid[row]) this.blockGrid[row] = [];
                this.blockGrid[row][col] = {x: tileS.x , y: tileS.y}
               // console.log(this.blockGrid);
                

                tileLayer.addChild(tileS);
            }
        }
        return tileLayer;
    }
    private createBlocks(app: Application){
        const shapeSize = 20;
        const space = app.screen.width * 0.05; 
        const startX = app.screen.width * 0.435;
        const startY = app.screen.height;
        
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
        const startY = height * 0.9;

        // const shapeSize = Math.max(width * 0.025, 20);
        // console.log(shapeSize);
        
        for (let i = 0; i < blocks.length; i++) {
            blocks[i].x = startX + i * (20 + space);
            blocks[i].y = startY;
            blocks[i].setSize(20); 
        }   
        // this.addChild(blocks)
    }
    // private getScaleFactor(width: number,height: number): number {
    //     const baseWidth = 1280;
    //     const minScale = 0.5;
    //     return Math.max(Math.min(width / baseWidth,0.5), minScale);
    // }
}