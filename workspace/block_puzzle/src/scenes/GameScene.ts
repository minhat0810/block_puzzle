/* eslint-disable prettier/prettier */
import {  Assets, Container, NineSliceSprite, Sprite, Text } from "pixi.js";
import { BaseScene } from "./BaseScene";
import { SceneManager } from "../handle/SceneManager";
import { BlockShapeLibrary } from "../models/BlockShape";
import { Blocks } from "../models/Blocks";
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

    private block               !: Blocks;
    public  blockGrid            : { x: number, y: number } [][] = [];
    public  gridOffsetX          : number = 0;
    public  gridOffsetY          : number = 0;
    public worldMap             !: WorldMap;
    private   curScore          !: Text;
    private   bestScore         !: Text;
    public    currentScore       : number = 0;
    public    bestStoreScore     : number = 0;
    public   effectsUI          !: Effects;
    private   effectsContainer  !: Container;

    public headerBg             !: NineSliceSprite;
    public bodyBg               !: Sprite;
    public footerBg             !: NineSliceSprite;
    public settingBtn           !: Sprite;
    public background           !: Sprite;

    private scoreGroup          !: Container;
    public settingContainer     !: Container;
    private btnGroup            !: Container;
    private isPaused             : boolean = false;
    private isSoundOn            : boolean = true;

    public appWidth              : number = 0;
    public appHeight             : number = 0;
    public blockX                : number = 0;
    public blockY                : number = 0;
    public shapeSize             : number = 20;
    private fontSize             : number = 20;
    public blockSpacing          : number = 0;
    private blockCount           : number = 3;

    public settingBgr           !: NineSliceSprite;
    public btnContinue          !: Sprite;
    public btnReplay            !: Sprite;
    public btnSoundOn           !: Sprite;
    public btnSoundOff          !: Sprite;



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
    
        this.gridBlockContainer = new Container();
        this.pickBlockContainer = new Container();
        this.worldMap = new WorldMap(offsetYBottom, app);
        this.blockPickManager    = new BlocksPick(this.worldMap,app,this);
        this.headerContainer = this.header(offsetYTop);
        this.bodyContainer = this.body();
        this.pickFooterContainer = this.pickFooter();
        this.worldTileContainer = this.worldMap;
        this.effectsContainer = new Container();
        this.effectsContainer.sortableChildren = true;
        this.effectsUI = new Effects(app.stage);
        

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
        this.updateBlockLayoutPosition();
        requestAnimationFrame(() => {
            this.createBlocks();
        });
        this.addChild(this.gridBlockContainer);
        this.addChild(this.pickBlockContainer);
        this.addChild(this.effectsContainer);
        this.setChildIndex(this.effectsContainer, this.children.length - 1);
        this.settingOverlay();
    }
    
    private header(offsetYTop: number): Container{

        const header = new Container();

        // Header background
        this.headerBg = new NineSliceSprite({
            texture: Assets.get("top_enless"),
            leftWidth: 130,
            rightWidth: 130,
            topHeight: 140,
            bottomHeight: 140,
        });
        this.headerBg.anchor.set(0.5);
        header.addChild(this.headerBg);
        
        // Score group
        this.bestScore = new Text({
            text: '0',
            style: {fill: '#FFFF00',fontSize: this.fontSize,fontFamily: 'Arial', fontWeight: "bold"
            }
        })

        this.curScore = new Text({
            text: '0',
            style: {fill: '#FFFF00',fontSize: this.fontSize,fontFamily: 'Arial', fontWeight: "bold"
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
        
         
         this.layoutBody(this.appWidth,this.appHeight);
         return body;
    }
    private pickFooter(): Container{
        const pickFooter = new Container();
        const brgMapPickT = Assets.get("middle");
        this.footerBg = new NineSliceSprite({
            texture: brgMapPickT,
            leftWidth: 100,
            topHeight: 100,
            rightWidth: 100,
            bottomHeight: 100, 
        });
        // this.footerBg.width = Math.round(Math.max(this.appWidth*0.3,350));
     //   // this.footerBg.height = this.appHeight*0.15;   
        this.footerBg.anchor.set(0.5,0.5);
        pickFooter.addChild(this.footerBg);
        this.layoutFooter(this.appWidth,this.appHeight)
        return pickFooter;
    }
    private createBlocks(){
        this.updateBlockLayoutPosition();

        const textureList = ["block_1", "block_2", "block_3", "block_4","block_5", "block_6"];
        this.pickBlockContainer.removeChildren();
        for( let i=0; i<3; i++){
            const matrix = BlockShapeLibrary.getRamdomShape();
            const texture = textureList[Math.floor(Math.random() * textureList.length)];
            this.block = new Blocks(matrix, texture, this.shapeSize);
            this.block.x = this.blockX + i*(this.shapeSize+this.blockSpacing);
            this.block.y = this.footerBg.y - this.block.shapeSize * this.block.getShape().length / 2;  
            this.pickBlockContainer.addChild(this.block);
            this.blockPickManager.addBlock(this.block); 
        }
    }
    
    destroyScene(): void {   
    }
    public layoutHeader(width: number, height: number, offsetYTop: number): void {
        const centerX = width/2;
        const centerY = height / 2 + offsetYTop;
        const headerWidth = width > 720 ? width * 0.3 : width * 0.9;
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
        this.bestScore.style.fontSize = headerHeight*(width > 720 ? 0.2 : 0.2);
        this.bestScore.y = 0;
  
        this.curScore.x = +(headerWidth*0.1) ;
        this.curScore.style.fontSize = headerHeight* (width > 720 ? 0.2 : 0.2);
        this.curScore.y = 0;
    }
    public layoutBody(width: number, height: number): void {
        this.bodyBg.width = this.worldMap.blockSize * this.gridSize + 15;
        this.bodyBg.height = this.worldMap.blockSize * this.gridSize + 15;
        this.bodyBg.x = width / 2;
        this.bodyBg.y = height / 2;

        this.worldMap.x = this.bodyBg.x;
        this.worldMap.y = this.bodyBg.y;


    }
    public layoutFooter(width: number, height: number): void {
        const footerWidth = width > 720 ? width * 0.3 : width * 0.9;
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
    public getScoreLabel(totalLines: number): string | null {
        if (totalLines === 1) return "text";
        if (totalLines === 2) return "cool";
        if (totalLines === 3) return "great";
        if (totalLines >= 4) return "excellent";
        return null;
    }
    public settingOverlay(): void {
        this.settingContainer = new Container();
        this.settingContainer.visible = false;
        this.settingContainer.eventMode = "static";
        this.settingContainer.sortableChildren = true;
    
        this.settingBgr = new NineSliceSprite({
            texture: Assets.get("bgr_settings"),
            leftWidth: 130,
            rightWidth: 130,
            topHeight: 130,
            bottomHeight: 130,
        });
        this.settingBgr.anchor.set(0.5);
        this.settingBgr.alpha = 0.9;
    
        this.btnContinue = new Sprite(Assets.get("btn_next"));
        this.btnContinue.setSize(100, 100);
        this.btnContinue.anchor.set(0.5);
        this.btnContinue.eventMode = "static";
        this.btnContinue.cursor = "pointer";
        this.btnContinue.on("pointertap", () => {
            sound.play("click");
            this.hideSettingOverlay();
        });
    
        this.btnReplay = new Sprite(Assets.get("btn_replay_2"));
        this.btnReplay.anchor.set(0.5);
        this.btnReplay.setSize(70, 70);
        this.btnReplay.eventMode = "static";
        this.btnReplay.cursor = "pointer";
        this.btnReplay.on("pointertap", () => {
            sound.play("click");
            const nextScene = new GameScene();
            nextScene.setSoundState(SceneManager.isSoundOn);
            SceneManager.changeScene(nextScene);
        });
    
        this.btnSoundOff = new Sprite(Assets.get("btn_sound_off"));
        this.btnSoundOff.anchor.set(0.5);
        this.btnSoundOff.setSize(70, 70);
        this.btnSoundOff.eventMode = "static";
        this.btnSoundOff.cursor = "pointer";
    
        this.btnSoundOn = new Sprite(Assets.get("btn_sound_on"));
        this.btnSoundOn.anchor.set(0.5);
        this.btnSoundOn.setSize(70, 70);
        this.btnSoundOn.eventMode = "static";
        this.btnSoundOn.cursor = "pointer";
    
        this.btnSoundOff.visible = false;
        this.btnSoundOn.visible = true;
    
        this.btnSoundOn.on("pointertap", () => {
            sound.play("click");
            sound.muteAll();
            SceneManager.isSoundOn = false;
            this.btnSoundOff.visible = true;
            this.btnSoundOn.visible = false;
        });
    
        this.btnSoundOff.on("pointertap", () => {
            sound.unmuteAll();
            sound.play("click");
            SceneManager.isSoundOn = true;
            this.btnSoundOn.visible = true;
            this.btnSoundOff.visible = false;
        });
    
        if (SceneManager.isSoundOn) {
            sound.unmuteAll();
            this.btnSoundOn.visible = true;
            this.btnSoundOff.visible = false;
        } else {
            sound.muteAll();
            this.btnSoundOn.visible = false;
            this.btnSoundOff.visible = true;
        }
    
        this.settingContainer.addChild(
            this.settingBgr,
            this.btnContinue,
            this.btnReplay,
            this.btnSoundOff,
            this.btnSoundOn
        );
        this.addChild(this.settingContainer);
        this.setChildIndex(this.settingContainer, this.children.length - 1);
        this.layoutSetting(this.appWidth,this.appHeight)
    }
    
    public layoutSetting(width: number, height: number): void {
        const centerX = width / 2;
        const centerY = height / 2;

        this.settingBgr.x = centerX;
        this.settingBgr.y = centerY;
        this.settingBgr.width = width * 0.95;
        this.settingBgr.height = height * 0.95;
    
        this.btnContinue.x = centerX;
        this.btnContinue.y = centerY - height*0.2;
        this.btnContinue.setSize(height*0.1,height*0.1);
    
        this.btnReplay.x = centerX - width*0.2;
        this.btnReplay.y = centerY + height*0.2;
        this.btnReplay.setSize(height*0.1,height*0.1);
    
        this.btnSoundOn.x = centerX + width*0.2;
        this.btnSoundOn.y = centerY + height*0.2;
        this.btnSoundOn.setSize(height*0.1,height*0.1);
    
        this.btnSoundOff.x = centerX + width*0.2;
        this.btnSoundOff.y = centerY + height*0.2;
        this.btnSoundOff.setSize(height*0.1,height*0.1);
    }
    
    public showSettingOverlay(): void {
        this.isPaused = true;
        this.settingContainer.visible = true;
    }
    
    public hideSettingOverlay(): void {
        this.isPaused = false;
        this.settingContainer.visible = false;
    }
    public setSoundState(isOn: boolean) {
        this.isSoundOn = isOn;
    }
    
    onResize(width: number, height: number): void {
        
        this.appWidth = width;
        this.appHeight = height;

        const offsetYTop = -height * 0.4;

        // Background
        this.background.width = this.appWidth;
        this.background.height = this.appHeight;
        
    
        // Layout UI
        this.layoutHeader(width, height, offsetYTop);
        this.layoutBody(width, height);
        this.layoutFooter(width, height);
        this.layoutSetting(width,height);
        
        const availableWidth = width * (width > 720? 0.6 : 0.8);
        const availableHeight = height * 0.6;
        const newBlockSize = Math.floor(Math.min(availableWidth, availableHeight) / this.gridSize);

        this.worldMap.setBlockSize(newBlockSize);
        this.worldMap.resize();
        this.blockSize = newBlockSize;
        
        
        this.updateBlockLayoutPosition();
        const blocks = this.pickBlockContainer.children.filter(c => c instanceof Blocks) as Blocks[];
        for (let i = 0; i < blocks.length; i++) {
            blocks[i].reSize(this.shapeSize);
            blocks[i].x = this.blockX + i * (this.shapeSize + this.blockSpacing);
            blocks[i].y = this.footerBg.y - blocks[i].shapeSize * blocks[i].getShape().length / 2;
        }
    }

    public updateBlockLayoutPosition(): void {
        this.shapeSize = this.footerBg.height*0.15; 
        const space = Math.max(this.footerBg.width * 0.2, 10);
        this.blockCount = 3;
        const totalWidth = this.blockCount * this.shapeSize + (this.blockCount - 1) * space;
        this.blockX = this.footerBg.x - totalWidth/2;        
        this.blockY = this.footerBg.y - this.footerBg.height/3;
        this.blockSpacing = space;
    }
    
      
}