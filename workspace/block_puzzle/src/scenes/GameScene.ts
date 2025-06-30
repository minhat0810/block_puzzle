/* eslint-disable prettier/prettier */
import { Assets, Container, Sprite, Text } from "pixi.js";
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
    
    public blockPickManager!: BlocksPick;
    private originalScale = 1;
    private originalPos = { x: 0, y: 0 };
    private isPicked   = false;
    public  blockSize !: number;
    public  gridSize : number = 8;
    public headerContainer     !: Container;
    public bodyContainer       !: Container;
    public pickFooterContainer !: Container;   
    public worldTileContainer  !: Container;
    public gridBlockContainer  !: Container;
    public pickBlockContainer  !: Container;

    public  blockGrid            : { x: number, y: number } [][] = [];
    public  gridOffsetX          : number = 0;
    public  gridOffsetY          : number = 0;
    public worldMap            !: WorldMap;
    private   curScore          !: Text;
    private   bestScore         !: Text;
    public    currentScore      : number = 0;
    public    bestStoreScore    : number = 0;
    public   effectsUI         !: Effects;
    private   effectsContainer  !: Container;

    public headerBg            !: Sprite;
    public bodyBg              !: Sprite;
    public footerBg            !: Sprite;
    public settingBtn          !: Sprite;
    public background          !: Sprite;

    private scoreGroup          !: Container;
    private settingContainer    !: Container;
    private btnGroup            !: Container;
    private isPaused             : boolean = false;
    private isSoundOn            : boolean = true;

    public appWidth              : number = 0;
    public appHeight             : number = 0;
    public blockX                : number = 0;
    public blockY                : number = 0;
    private shapeSize            : number = 20;
    private fontSize             : number = 20;
    private blockSpacing         : number = 0;
    private blockCount           : number = 3;


    constructor(){
        super();
    }
    init(): void {
        const app = SceneManager.getApp();
        this.appWidth = window.innerWidth;
        this.appHeight = window.innerHeight;
        const bgrTexture = Assets.get("bgr");
        this.background = new Sprite(bgrTexture);
        this.background.position.set(0, 0);
        this.background.width = this.appWidth;
        this.background.height = this.appHeight;
    
        const offsetYTop = -this.appHeight * 0.4;
        const offsetYBottom = -this.appHeight * 0.01;
    
        this.worldMap = new WorldMap(offsetYBottom, app);
        this.headerContainer = this.header(offsetYTop);
        this.bodyContainer = this.body();
        this.pickFooterContainer = this.pickFooter();
        this.worldTileContainer = this.worldMap;
        this.blockPickManager    = new BlocksPick(this.worldMap,app,this);
        this.effectsContainer = new Container();
        this.effectsContainer.sortableChildren = true;
        this.effectsUI = new Effects(app.stage);
        this.gridBlockContainer = new Container();
        this.pickBlockContainer = new Container();

        this.blockPickManager.setResetCallBack(()=>{
            this.createBlocks();
        })
        this.blockPickManager.setScore((score,totalLines) => {
            this.updateScoreDisplay(score);
            const label = this.getScoreLabel(totalLines);
            if(label) this.effectsUI.scoreEffect(label,this.appWidth/2,this.appHeight/2,score);

        });

        const storeBestScore = localStorage.getItem("block_puzzle_score");
        if(storeBestScore){
           // console.log(storeBestScore);
            this.bestStoreScore = parseInt(storeBestScore,10);
            this.bestScore.text = `${this.bestStoreScore}`;
        }      
        
        this.addChild(this.background);
        this.addChild(this.headerContainer);
        this.addChild(this.bodyContainer);
        this.addChild(this.pickFooterContainer);
        this.addChild(this.worldTileContainer);
        this.createBlocks()
        this.addChild(this.gridBlockContainer);
        this.addChild(this.pickBlockContainer);
        this.addChild(this.effectsContainer);
        this.setChildIndex(this.effectsContainer, this.children.length - 1);
        this.settingOverlay();
    }
    
    private header(offsetYTop: number): Container{

        const header = new Container();

        // Header background
        this.headerBg = new Sprite(Assets.get("top_enless"));
        this.headerBg.anchor.set(0.5);
        header.addChild(this.headerBg);
        
        // Score group
        this.bestScore = new Text({
            text: '0',
            style: {fill: '#ffffff',fontSize: this.fontSize,fontFamily: 'Arial', fontWeight: "bold"
            }
        })

        this.curScore = new Text({
            text: '0',
            style: {fill: '#ffffff',fontSize: this.fontSize,fontFamily: 'Arial', fontWeight: "bold"
            }
        })
        this.curScore.anchor.set(0.5,0.5)
        this.bestScore.anchor.set(0.5,0.5)

        this.scoreGroup = new Container();
        

        // btn
        this.settingBtn = new Sprite(Assets.get("btn_setting"));
        this.settingBtn.anchor.set(0.5);
        this.settingBtn.eventMode = "static";
        this.settingBtn.cursor = "pointer";
        this.settingBtn.on("pointermove", () =>{
            this.settingBtn.alpha = 0.7;
        })
        this.settingBtn.on("pointerout", ()=>{
            this.settingBtn.alpha = 1;
        })

        this.settingBtn.on("pointertap", () =>{
            sound.play("click")
            this.showSettingOverlay();
        });

        header.addChild(this.scoreGroup);
        this.scoreGroup.addChild(this.bestScore, this.curScore);
        header.addChild(this.settingBtn);

        this.layoutHeader(this.appWidth, this.appHeight, offsetYTop);
        
        return header;
    }
    private body(): Container{
        const body = new Container();
         //bgr map chính
         const brgMapTexture = Assets.get("block_border");
         this.bodyBg = new Sprite(brgMapTexture);
        //  this.bodyBg.width = this.gridSize*this.worldMap.blockSize+15;
        //  this.bodyBg.height = this.gridSize*this.worldMap.blockSize+15;
         
         
         this.bodyBg.anchor.set(0.5,0.5);
         this.bodyBg.alpha = 0.5;
        // console.log(this.bodyBg.x, this.bodyBg.y);
        
        // body.addChild(this.bodyBg);
         this.layoutBody(this.appWidth,this.appHeight);
         return body;
    }
    private pickFooter(): Container{
        const pickFooter = new Container();
        const brgMapPickT = Assets.get("middle");
        this.footerBg = new Sprite(brgMapPickT);
        this.footerBg.width = Math.round(Math.max(this.appWidth*0.3,350));
        this.footerBg.height = this.appHeight*0.15;   
        this.footerBg.anchor.set(0.5,0.5);
        pickFooter.addChild(this.footerBg);
        this.layoutFooter(this.appWidth,this.appHeight)
        return pickFooter;
    }
    private createBlocks(){
        this.updateBlockLayoutPosition();
       // const shapeSize = 20;
        // const space = this.appWidth * 0.05; 
        // const startX = this.appWidth/2;
        
        // const space = Math.max(this.appWidth * 0.02, 10);
        // this.shapeSize = this.footerBg.height*0.2;
        // this.pickBlockContainer.removeChildren();
       // const startX = this.footerBg.x - this.footerBg.x/2;
        // const blockCount = 3;
        // const totalWidth = blockCount * shapeSize + (blockCount - 1) * space;
        // this.blockX = this.footerBg.x - totalWidth / 2;
        // this.blockY = this.appHeight - this.appHeight*0.15;
        
        const textureList = ["block_1", "block_2", "block_3", "block_4","block_5", "block_6"];
        this.pickBlockContainer.removeChildren();
        for( let i=0; i<3; i++){
            const matrix = BlockShapeLibrary.getRamdomShape();
            const texture = textureList[Math.floor(Math.random() * textureList.length)];
            const block = new Blocks(matrix, texture, this.shapeSize);
            block.x = this.blockX + i*(this.shapeSize+this.blockSpacing);
            block.y =  this.blockY ;
            this.pickBlockContainer.addChild(block);
            this.blockPickManager.addBlock(block); 
        }
    }
    
    destroyScene(): void {   
    }
    private layoutHeader(width: number, height: number, offsetYTop: number): void {
        const centerX = width/2;
        const centerY = height / 2 + offsetYTop;
        const scaleBgX = width > 720;
        const headerWidth = width * (scaleBgX ? 0.3 : 0.8);
        const headerHeight = height * 0.15;

        this.headerBg.width = headerWidth;
        this.headerBg.height = headerHeight;
        this.headerBg.x = centerX;
        this.headerBg.y = centerY;

        this.settingBtn.x = centerX + headerWidth / 2 * 0.7;
        this.settingBtn.y = centerY;
        this.settingBtn.width = headerHeight*0.5;
        this.settingBtn.height = headerHeight*0.5;

        this.scoreGroup.x = centerX ; 
        this.scoreGroup.y = centerY;

        this.bestScore.x = - (headerWidth*0.25);
        this.bestScore.style.fontSize = headerHeight*0.2;
        this.bestScore.y = 0;

        this.curScore.x = +(headerWidth*0.1) ;
        this.curScore.style.fontSize = headerHeight*0.2;
        this.curScore.y = 0;
    }
    private layoutBody(width: number, height: number): void {
        this.bodyBg.width = this.worldMap.blockSize * this.gridSize + 15;
        this.bodyBg.height = this.worldMap.blockSize * this.gridSize + 15;
        this.bodyBg.x = width / 2;
        this.bodyBg.y = height / 2;

        this.worldMap.x = this.bodyBg.x;
        this.worldMap.y = this.bodyBg.y;

        // const availableWidth = width * 0.6;
        // const availableHeight = height * 0.6;
     //   this.worldMap.blockSize = Math.floor(Math.min(availableWidth, availableHeight) / this.gridSize);
    }
    private layoutFooter(width: number, height: number): void {
        const footerWidth = width > 720 ? width * 0.3 : width * 0.8;
        const footerHeight = height * 0.15;

        this.footerBg.width = footerWidth;
        this.footerBg.height = footerHeight;
        this.footerBg.x = width / 2;
        this.footerBg.y = height - footerHeight/2;

    }      
    public updateScoreDisplay(insSCore: number): void {
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
    private settingOverlay(): void{
        this.settingContainer = new Container();
        this.settingContainer.visible = false;
        this.settingContainer.eventMode = "static";
        this.settingContainer.sortableChildren = true;
        
        const bgr = new Sprite(Assets.get("bgr_settings"));
        bgr.width = 500;
        bgr.height = this.appHeight*0.95;
        bgr.position.set(this.appWidth/2,this.appHeight/2)
        bgr.anchor.set(0.5,0.5);
        bgr.alpha = 0.9;

        const continueBtn = new Sprite(Assets.get("btn_next"));
        continueBtn.setSize(100,100);
        continueBtn.x = bgr.x;
        continueBtn.y = bgr.y-100;
        continueBtn.anchor.set(0.5,0.5)
        continueBtn.eventMode = "static";
        continueBtn.cursor = "pointer";
        continueBtn.on("pointertap", ()=>{
            sound.play("click")
            this.hideSettingOverlay();
        });

        const spacing = this.appWidth * 0.1;

        const btnReplay = new Sprite(Assets.get("btn_replay_2"));   
        btnReplay.x = bgr.x - spacing;
        btnReplay.y = bgr.y + 100;
        btnReplay.anchor.set(0.5,0.5);
        btnReplay.setSize(70,70);
        btnReplay.eventMode = "static";
        btnReplay.cursor = "pointer";
        btnReplay.on("pointertap", ()=>{
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

        btnSoundOn.on("pointertap", ()=>{
            sound.play("click");
            sound.muteAll();
            btnSoundOff.visible = true;
            btnSoundOn.visible = false;
            SceneManager.isSoundOn = false;
        });

        btnSoundOff.on("pointertap", ()=>{
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
        
        // const RESPONSIVE_THRESHOLD = 1000;
        //  const isLargeScreen = width > RESPONSIVE_THRESHOLD;
       // const app = SceneManager.getApp();
        this.appWidth = width;
        this.appHeight = height;
      //  console.log(this.appWidth);
        

        const offsetYTop = -height * 0.4;
      //  const offsetYBottom = -height * 0.01;
    
        // Background
        this.background.width = this.appWidth;
        this.background.height = this.appHeight;
        
    
        // Layout UI
        this.layoutHeader(width, height, offsetYTop);
        this.layoutBody(width, height);
        this.layoutFooter(width, height);
    
        // Update block size
        // this.blockSize = Math.min(
        //     (width * 0.7) / this.gridSize,
        //     (height * 0.6) / this.gridSize
        // );
        
        const availableWidth = width * (width > 720? 0.6 : 0.8);
        const availableHeight = height * 0.6;
       // this.worldMap.blockSize = Math.floor(Math.min(availableWidth, availableHeight) / this.gridSize);
       const newBlockSize = Math.floor(Math.min(availableWidth, availableHeight) / this.gridSize);

       this.worldMap.setBlockSize(newBlockSize);
       this.blockSize = newBlockSize;
        
        
        // Update pick blocks position
        // const shapeSize = 20;
        // const space = Math.max(width * 0.02, 100)
        // const blockCount = 3;
        // const totalWidth = blockCount * shapeSize + (blockCount - 1) * space;
        // this.blockX = this.footerBg.x - totalWidth / 2;
        // this.blockY = height - height * 0.15;
        
        this.updateBlockLayoutPosition();
        const blocks = this.pickBlockContainer.children.filter(c => c instanceof Blocks) as Blocks[];
        for (let i = 0; i < blocks.length; i++) {
            blocks[i].x = this.blockX + i * (this.shapeSize + this.blockSpacing);
            blocks[i].y = this.blockY;
            blocks[i].reSize(this.shapeSize);
        }
    
        // Update setting overlay
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

    private updateBlockLayoutPosition(): void {
        this.shapeSize = this.footerBg.height*0.2; 
        const space = Math.max(this.footerBg.width * 0.2, 20);
        this.blockCount = 3;
        const totalWidth = this.blockCount * this.shapeSize + (this.blockCount - 1) * space;

        this.blockX = this.footerBg.x - totalWidth/2;
        this.blockY = this.footerBg.y - this.footerBg.height/3;
        this.blockSpacing = space;
    }

      
}