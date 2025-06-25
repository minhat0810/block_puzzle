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
import { sound } from "@pixi/sound";

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
    private bodyBg              !: Sprite;
    private footerBg            !: Sprite;
    private settingBtn          !: Sprite;
    private background          !: Sprite;

    private scoreGroup          !: Container;
    private settingContainer    !: Container;
    private gridBlockContainer  !: Container;
    private pickBlockContainer  !: Container;
    private btnGroup            !: Container;
    private isPaused             : boolean = false;
    private isSoundOn: boolean = true;

    constructor(){
        super();
    }
    init(): void {
        const app = SceneManager.getApp();
        const bgrTexture = Assets.get("bgr");
        this.background = new Sprite(bgrTexture);
        this.background.position.set(0, 0);
        this.background.width = app.screen.width;
        this.background.height = app.screen.height;
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

        const storeBestScore = localStorage.getItem("block_puzzle_score");
        if(storeBestScore){
            this.bestStoreScore = parseInt(storeBestScore,10);
            this.bestScore.text = `${this.bestStoreScore}`;
        }      
        
        this.addChild(this.background);
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
            style: {fill: '#ffffff',fontSize: 20,fontFamily: 'Robo',
            }
        })

        this.curScore = new Text({
            text: '0',
            style: {fill: '#ffffff',fontSize: 20,fontFamily: 'Robo',
            }
        })
        this.curScore.anchor.set(0.5,0.5)
        this.bestScore.anchor.set(0.5,0.5)

        this.scoreGroup = new Container();
        

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
            sound.play("click")
            this.showSettingOverlay();
        });

        header.addChild(this.scoreGroup);
        this.scoreGroup.addChild(this.bestScore, this.curScore);
        header.addChild(this.settingBtn);

        this.layoutHeader(app.screen.width, app.screen.height, offsetYTop);
        
        return header;
    }
    private body(offsetYBottom: number, app: Application): Container{
        const body = new Container();
         //bgr map chính
         const brgMapTexture = Assets.get("block_border");
         this.bodyBg = new Sprite(brgMapTexture);
         this.bodyBg.width = Math.max(app.screen.width*0.273,350);
         this.bodyBg.height = Math.max(app.screen.width*0.273,350);
        
         this.bodyBg.anchor.set(0.5);
         this.bodyBg.alpha = 0.5;
 
         body.addChild(this.bodyBg);
         this.layoutBody(app.screen.width,app.screen.height,offsetYBottom);
         return body;
    }
    private pickFooter(offsetYBottom: number, app: Application): Container{
        const pickFooter = new Container();
        const brgMapPickT = Assets.get("middle");
        this.footerBg = new Sprite(brgMapPickT);
        this.footerBg.width = Math.round(Math.max(app.screen.width*0.3,350));
        
        this.footerBg.height = app.screen.height*0.15;
        
        this.footerBg.anchor.set(0.5);
        pickFooter.addChild(this.footerBg);

        this.layoutFooter(app.screen.width,app.screen.height)
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
        // const space = app.screen.width * 0.05; 
        // const startX = app.screen.width/2;
        const startY = app.screen.height * 0.85;
        const space = Math.max(app.screen.width * 0.02, 100)
       // const startX = this.footerBg.x - this.footerBg.x/2;
        const blockCount = 3;
        const totalWidth = blockCount * shapeSize + (blockCount - 1) * space;
        const startX = this.footerBg.x - totalWidth / 2;
        
        
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
       // this.layoutPickBlocks(app.screen.width, app.screen.height);
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
    private layoutBody(width: number, height: number, offsetYBottom: number): void {
        this.bodyBg.x = width/2;
        this.bodyBg.y = height/2 + offsetYBottom;
    }
    private layoutFooter(width: number, height: number): void {
        this.footerBg.x = width/2;
        this.footerBg.y = height*0.9;
    }
    private layoutPickBlocks(width: number, height: number): void {
        const blocks = this.pickBlockContainer.children.filter(c => c instanceof Blocks) as Blocks[];
    
        const shapeSize = Math.min(width * 0.05, 50); // Block size theo tỷ lệ, tối thiểu 50
        const spacing = Math.max(width * 0.02, 20);   // Spacing tối thiểu 20px
    
        const totalWidth = blocks.length * shapeSize + (blocks.length - 1) * spacing;
        const startX = (width - totalWidth) / 2;
        const startY = height * 0.85;
    
        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            block.x = startX + i * (shapeSize + spacing);
            block.y = startY;
            block.reSize(shapeSize);
        }
    }
    
        
   
    public updateScoreDisplay(insSCore: number): void {
        console.log(this.currentScore);
        
        this.currentScore += insSCore;
        this.curScore.text = `${this.currentScore}`;
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
        bgr.width = 500;
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
            sound.play("click")
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
            sound.play("click");
            const nextScene = new GameScene();
            nextScene.setSoundState(SceneManager.isSoundOn);
            SceneManager.changeScene(nextScene);
        });

        const btnSoundOff = new Sprite(Assets.get("btn_sound_off")); 
        btnSoundOff.visible = false;  
        btnSoundOff.x = bgr.x + spacing;
        btnSoundOff.y = bgr.y + 100;
        btnSoundOff.anchor.set(0.5,0.5);
        btnSoundOff.setSize(70,70);
        btnSoundOff.eventMode = "static";
        btnSoundOff.cursor = "pointer";

        const btnSoundOn = new Sprite(Assets.get("btn_sound_on"));   
        btnSoundOn.visible = true;
        btnSoundOn.x = bgr.x + spacing;
        btnSoundOn.y = bgr.y + 100;
        btnSoundOn.anchor.set(0.5,0.5);
        btnSoundOn.setSize(70,70);
        btnSoundOn.eventMode = "static";
        btnSoundOn.cursor = "pointer";

        if (SceneManager.isSoundOn) {
            sound.unmuteAll();
            btnSoundOn.visible = true;
            btnSoundOff.visible = false;
        } else {
            sound.muteAll();
            btnSoundOn.visible = false;
            btnSoundOff.visible = true;
        }

        btnSoundOn.on("click", ()=>{
            sound.play("click");
            sound.muteAll();
            btnSoundOff.visible = true;
            btnSoundOn.visible = false;
            SceneManager.isSoundOn = false;
        });

        btnSoundOff.on("click", ()=>{
            btnSoundOn.visible = true;
            btnSoundOff.visible = false;
            sound.unmuteAll();
            sound.play("click");
            SceneManager.isSoundOn = true;
        });        

        this.settingContainer.addChild(bgr);
        this.settingContainer.addChild(continueBtn);
        this.settingContainer.addChild(btnReplay);
        this.settingContainer.addChild(btnSoundOff);
        this.settingContainer.addChild(btnSoundOn);
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
    public setSoundState(isOn: boolean) {
        this.isSoundOn = isOn;
    }
    
    onResize(width: number, height: number): void {
        
        const app = SceneManager.getApp();
        const offsetYTop = -height * 0.4;
        const offsetYBottom = -height * 0.01;
    
        this.layoutHeader(width, height, offsetYTop);
        this.layoutBody(width, height, offsetYBottom);
        this.layoutFooter(width, height);
      //  this.layoutPickBlocks(width, height);
    
        const newBlockSize = Math.max(width * 0.033, 40);
        this.blockSize = newBlockSize;
    
        this.removeChild(this.worldTileContainer);
        this.worldTileContainer = this.worldTile(newBlockSize, this.gridSize, offsetYBottom, app);
        this.addChild(this.worldTileContainer);
        this.setChildIndex(this.worldTileContainer, this.getChildIndex(this.bodyContainer) + 1);
    
        const space = width * 0.05;
        const shapeSize = 20;
        const startX = width / 2 - 100;
        const startY = height * 0.85;

        const blocks = this.pickBlockContainer.children.filter(c => c instanceof Blocks) as Blocks[];
        for (let i = 0; i < blocks.length; i++) {
            blocks[i].x = startX + i * (shapeSize + space);
            blocks[i].y = startY;
            blocks[i].reSize(shapeSize);
        }
    
        if (this.settingContainer) {
            const bgr = this.settingContainer.children[0] as Sprite;
            bgr.x = width / 2;
            bgr.y = height / 2;
            bgr.height = height * 0.95;
    
            const continueBtn = this.settingContainer.children[1] as Sprite;
            continueBtn.x = bgr.x;
            continueBtn.y = bgr.y - 100;
    
            const spacing = width * 0.1;
    
            const btnReplay = this.settingContainer.children[2] as Sprite;
            btnReplay.x = bgr.x - spacing;
            btnReplay.y = bgr.y + 100;
    
            const btnSoundOff = this.settingContainer.children[3] as Sprite;
            btnSoundOff.x = bgr.x + spacing;
            btnSoundOff.y = bgr.y + 100;
    
            const btnSoundOn = this.settingContainer.children[4] as Sprite;
            btnSoundOn.x = bgr.x + spacing;
            btnSoundOn.y = bgr.y + 100;
        }
    }  
      
}