/* eslint-disable prettier/prettier */
import { Application, Assets, Container, Sprite, Text } from "pixi.js";
import { BaseScene } from "./BaseScene";
import { SceneManager } from "../handle/SceneManager";
import { BlockShapeLibrary } from "../models/BlockShape";
import { Blocks } from "../models/Blocks";
// import { InputController } from "../handle/InputController";
// import { BlockPickManager } from "../handle/BlockPickManager";
import { WorldMap } from "../models/WorldMap";
import { BlocksPick } from "../models/BlocksPick";
import { Effects } from "../models/Effects";

export class GameScene extends BaseScene{
    
    private blockPickManager!: BlocksPick;
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
    public    currentScore      : number = 0;
    public    bestStoreScore    : number = 0;
    private   effectsUI         !: Effects;
    private   effectsContainer  !: Container;

    private headerBg            !: Sprite;
    private settingBtn          !: Sprite;
    private scoreGroup          !: Container;
    private settingContainer    !: Container;
    private gridBlockContainer  !: Container;
    private pickBlockContainer  !: Container;
    private btnGroup            !: Container;

    private isPaused             : boolean = false;
    constructor(){
        super();
    }
    init(): void {
        const app = SceneManager.getApp();
        const bgrTexture = Assets.get("bgr");
        const brgSprite = new Sprite(bgrTexture);
        brgSprite.position.set(0, 0);
        brgSprite.width = app.screen.width;
        brgSprite.height = app.screen.height;
        const offsetYTop = -app.screen.height*0.4;
        const offsetYBottom = -app.screen.height*0.01;
        this.worldMap = new WorldMap(offsetYBottom,app);
        this.headerContainer     = this.header(offsetYTop,app);
        this.bodyContainer       = this.body(offsetYBottom,app);
        this.pickFooterContainer = this.pickFooter(offsetYTop,app);
        this.worldTileContainer  = this.worldMap;
        this.blockPickManager    = new BlocksPick(this.worldMap,app,this);
        this.effectsContainer = new Container();
        this.effectsContainer.sortableChildren = true;
        this.effectsUI = new Effects(app.stage);
        this.gridBlockContainer = new Container();
        this.pickBlockContainer = new Container();

        this.blockPickManager.setResetCallBack(()=>{
            this.createBlocks(app);
        })
        this.blockPickManager.setScore((score,totalLines) => {
            this.updateScoreDisplay(score);
            const label = this.getScoreLabel(totalLines);
            if(label) this.effectsUI.scoreEffect(label,app.screen.width/2,app.screen.height/2,score);

        });

        const storeBestScore = 0;
        if(storeBestScore){
            this.bestStoreScore = parseInt(storeBestScore,10);
            this.bestScore.text = `${this.bestStoreScore}`;
        }

        
        this.addChild(brgSprite);
        this.addChild(this.headerContainer);
        this.addChild(this.bodyContainer);
        this.addChild(this.pickFooterContainer);
        this.addChild(this.worldTileContainer);
        this.createBlocks(app)
        this.addChild(this.gridBlockContainer);
        this.addChild(this.pickBlockContainer);
        this.addChild(this.effectsContainer);
        this.setChildIndex(this.effectsContainer, this.children.length - 1);
        this.settingOverlay(app);
    }
    
    private header(offsetYTop: number,app: Application): Container{

        const header = new Container();

        // Header background
        this.headerBg = new Sprite(Assets.get("top_enless"));
        this.headerBg.anchor.set(0.5);
        header.addChild(this.headerBg);
        
        // Score group
        this.bestScore = new Text({
            text: '0',
            style: {fill: '#ffffff',fontSize: 30,fontFamily: 'Robo',
            }
        })

        this.curScore = new Text({
            text: '0',
            style: {fill: '#ffffff',fontSize: 30,fontFamily: 'Robo',
            }
        })
        this.curScore.anchor.set(0.5,0.5)
        this.bestScore.anchor.set(0.5,0.5)

        this.scoreGroup = new Container();
        this.scoreGroup.addChild(this.bestScore, this.curScore);
        header.addChild(this.scoreGroup);

        // btn
        this.settingBtn = new Sprite(Assets.get("btn_setting"));
        this.settingBtn.anchor.set(0.5);
        this.settingBtn.width = 50;
        this.settingBtn.height = 50;
        this.settingBtn.eventMode = "static";
        this.settingBtn.cursor = "pointer";
        this.settingBtn.on("pointermove", () =>{
            this.settingBtn.alpha = 0.7;
        })
        this.settingBtn.on("pointerout", ()=>{
            this.settingBtn.alpha = 1;
        })

        this.settingBtn.on("click", () =>{
            this.showSettingOverlay();
        })
        header.addChild(this.settingBtn);

        this.layoutHeader(app.screen.width, app.screen.height, offsetYTop);
        
        // const settingTexture = Assets.get("btn_setting");
        // const settingSprite  = new Sprite(settingTexture);
        // settingSprite.x = brgMapSettingS.width*0.5 + brgMapSettingS.x;
        // settingSprite.anchor.set(0.5,0.5);
        // settingSprite.setSize(50,50)
        // header.addChild(brgMapSettingS);
        
        // header.addChild(this.curScore);
        // header.addChild(this.bestScore);
        // header.addChild(settingSprite);
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
         brgMapSprite.alpha = 0.5;
 
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
            this.pickBlockContainer.addChild(block);
            this.blockPickManager.addBlock(block); 
        }
        
    }
    destroyScene(): void {   
    }
    private layoutHeader(width: number, height: number, offsetYTop: number): void {
        const centerX = width/2;
        const centerY = height / 2 + offsetYTop;
        const headerWidth = Math.max(width * 0.3, 350);
        const headerHeight = height * 0.15;

        this.headerBg.width = headerWidth;
        this.headerBg.height = headerHeight;
        this.headerBg.x = centerX;
        this.headerBg.y = centerY;

        this.settingBtn.x = centerX + headerWidth / 2 * 0.7;
        this.settingBtn.y = centerY;

        const spacing = headerWidth * 0.25;
        this.scoreGroup.x = centerX ; 
        this.scoreGroup.y = centerY;

        this.bestScore.x = -spacing;
        this.bestScore.y = 0;

        this.curScore.x = +spacing -70;
        this.curScore.y = 0;
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
        
   
    public updateScoreDisplay(insSCore: number): void {
        console.log(this.currentScore);
        
        this.currentScore += insSCore;
        this.curScore.text = `${this.currentScore}`;
        if(this.currentScore>this.bestStoreScore){
            this.bestStoreScore = this.currentScore;
            this.bestScore.text = `${this.bestStoreScore}`;
         //   localStorage.setItem("block_puzzle_score", `${this.bestStoreScore}`);
        }
    }
    private getScoreLabel(totalLines: number): string | null {
        if (totalLines === 1) return "text";
        if (totalLines === 2) return "cool";
        if (totalLines === 3) return "excellent";
        if (totalLines >= 4) return "great";
        return null;
    }
    private settingOverlay(app : Application): void{
        this.settingContainer = new Container();
        this.settingContainer.visible = false;
        this.settingContainer.eventMode = "static";
        this.settingContainer.sortableChildren = true;
        
        const bgr = new Sprite(Assets.get("bgr_settings"));
        bgr.width = app.screen.width*0.9;
        bgr.height = app.screen.height*0.95;
        bgr.position.set(app.screen.width/2,app.screen.height/2)
        bgr.anchor.set(0.5,0.5);
        bgr.alpha = 0.9;

        const continueBtn = new Sprite(Assets.get("btn_next"));
        continueBtn.setSize(100,100);
        continueBtn.x = bgr.x;
        continueBtn.y = bgr.y-100;
        continueBtn.anchor.set(0.5,0.5)
        continueBtn.eventMode = "static";
        continueBtn.cursor = "pointer";
        continueBtn.on("click", ()=>{
            this.hideSettingOverlay();
        });

        const spacing = app.screen.width * 0.1;

        const btnReplay = new Sprite(Assets.get("btn_replay_2"));   
        btnReplay.x = bgr.x - spacing;
        btnReplay.y = bgr.y + 100;
        btnReplay.anchor.set(0.5,0.5);
        btnReplay.setSize(70,70);
        btnReplay.eventMode = "static";
        btnReplay.cursor = "pointer";
        btnReplay.on("click", ()=>{
           // this.hideSettingOverlay();
        });

        const btnSoundOff = new Sprite(Assets.get("btn_sound_off"));   
        btnSoundOff.x = bgr.x + spacing;
        btnSoundOff.y = bgr.y + 100;
        btnSoundOff.anchor.set(0.5,0.5);
        btnSoundOff.setSize(70,70);
        btnSoundOff.eventMode = "static";
        btnSoundOff.cursor = "pointer";
        btnSoundOff.on("click", ()=>{
            //this.hideSettingOverlay();
        });

        this.settingContainer.addChild(bgr);
        this.settingContainer.addChild(continueBtn);
        this.settingContainer.addChild(btnReplay,btnSoundOff);

        this.addChild(this.settingContainer);
        this.setChildIndex(this.settingContainer, this.children.length - 1);
    }
    private showSettingOverlay(): void {
        this.isPaused = true;
        this.settingContainer.visible = true;
    }
    
    private hideSettingOverlay(): void {
        this.isPaused = false;
        this.settingContainer.visible = false;
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
      
}