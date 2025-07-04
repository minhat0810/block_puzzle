/* eslint-disable prettier/prettier */
import { Assets, NineSliceSprite, Sprite, Text } from "pixi.js";
import { SceneManager } from "../handle/SceneManager";
import { BaseScene } from "./BaseScene";
import { Effects } from "../models/Effects";
import { GameScene } from "./GameScene";

export class LoseScene extends BaseScene{
    private score : number = 0;
    private bestScore: number = 0;
    private effectsUI !: Effects;
    private onReplay!: () => void;

    private brgSprite       !: Sprite;
    private bgrLose         !: NineSliceSprite;
    private loseS           !: Sprite;
    private titleScore      !: Sprite;
    private titleBestScore  !: Sprite;
    private bgrScore        !: NineSliceSprite;
    private bgrBScore       !: NineSliceSprite;
    private star_off        !: Sprite;
    private star_on         !: Sprite;
    private king            !: Sprite;
    private wheel           !: Sprite;
    private btnReplay       !: Sprite;
    private scoreText       !: Text;
    private titleNewBest    !: Sprite;
    private bestScoreText   !: Text;
    private btnReplayPulseTicker?: (delta: number) => void;

    private maxWidth : number = 0;
    private maxHeight : number = 0;
    
    constructor(score: number, bestScore: number){
        super();
        this.score = score;
        this.bestScore = bestScore;
     }
    init(): void {
        const app = SceneManager.getApp();
        this.maxWidth = app.screen.width;
        this.maxHeight = app.screen.height;
        this.effectsUI = new Effects(this);

        this.brgSprite = new Sprite({
            texture:  Assets.get("bgr"),
        }); 
        this.bgrLose = new NineSliceSprite({
            texture: Assets.get("bgr_settings"),
            leftWidth: 100,
            rightWidth: 100,
            topHeight: 100,
            bottomHeight: 100,
        }) 
        this.bgrLose.anchor.set(0.5,0.5);
        this.bgrLose.alpha = 0.9;

        this.loseS = new Sprite(Assets.get("title_game_over"));
        this.loseS.anchor.set(0.5,0.5);
      

        this.titleScore = new Sprite(Assets.get("title_score"));
        this.titleScore.anchor.set(0.5,0.5);
      

        this.titleBestScore = new Sprite(Assets.get("title_best_score"));
        this.titleBestScore.anchor.set(0.5,0.5);
        

        this.bgrScore = new NineSliceSprite({
            texture: Assets.get("middle"),
            leftWidth: 150,
            rightWidth: 150,
            topHeight: 150,
            bottomHeight: 150,
        });
        this.bgrScore.anchor.set(0.5,0.5);
        this.bgrScore.alpha = 0.5;

        this.bgrBScore = new NineSliceSprite(
          {  texture:Assets.get("middle"),
            leftWidth: 150,
            rightWidth: 150,
            topHeight: 150,
            bottomHeight: 150,
          });
        this.bgrBScore.anchor.set(0.5,0.5);
        this.bgrBScore.alpha = 0.5;

        this.star_off = new Sprite(Assets.get("star_off"));
        this.star_off.anchor.set(0.5,0.5);
      

        this.star_on = new Sprite(Assets.get("star_on"));
        this.star_on.anchor.set(0.5);


        this.king = new Sprite(Assets.get("win_icon"));
        this.king.anchor.set(0.5,0.5);


        this.wheel = new Sprite(Assets.get("wheel"));
        this.wheel.anchor.set(0.5,0.5);


        this.btnReplay = new Sprite(Assets.get("btn_replay_2"));
        this.btnReplay.anchor.set(0.5,0.5);
        this.btnReplay.eventMode = "none";
        this.btnReplay.cursor = "pointer";
        this.onReplay = () => {
            SceneManager.changeScene(new GameScene());
        };
        this.btnReplay.on("pointertap", this.onReplay);
        setTimeout(() => {
            this.btnReplay.eventMode = "static";
        }, 1000)
        this.titleNewBest = new Sprite(Assets.get("text_new_best_score"));
        this.titleNewBest.visible = false;
        this.titleNewBest.anchor.set(0.5,0.5);
        this.posElement();

        const targetX = this.star_off.x;
        const targetY = this.star_off.y;
        const tgNewBestX = this.maxWidth/2;
        const tgNewBestY = (this.bgrBScore.y + this.bgrScore.y )/2;

        // this.star_on.width = 0;
        // this.star_on.height = 0;
        // this.titleNewBest.width = 0;
        // this.titleNewBest.height = 0;

        this.star_on.position.set(this.maxWidth / 2, this.maxHeight / 2);
        this.titleNewBest.position.set(this.maxWidth / 2, this.maxHeight / 2);
        
        this.scoreText = new Text({
            text : "0",
            style: {
                fill: 0xffffff,
                fontFamily: "Arial",
                fontSize: `${this.bgrScore.height*0.5}`,
                fontWeight: "bold"
            }
        });
        this.scoreText.anchor.set(0.5,0.5);
        
        this.bestScoreText = new Text({
            text : `${this.bestScore}`,
            style: {
                fill: 0xffffff,
                fontFamily: "Arial",
                fontSize: `${this.bgrScore.height*0.5}`,
                fontWeight: "bold"
            }
        })
        this.bestScoreText.anchor.set(0.5,0.5);

        
       
        this.posTextElement();


        this.addChild(this.brgSprite);
        this.addChild(this.bgrLose);
        this.addChild(this.loseS);
        this.addChild(this.titleScore);
        this.addChild(this.titleBestScore);
        this.addChild(this.bgrScore);
        this.addChild(this.bgrBScore);
        this.addChild(this.star_off);
        this.addChild(this.star_on);
        this.addChild(this.wheel);
        this.addChild(this.king);
        this.addChild(this.btnReplay);
        this.addChild(this.scoreText);
        this.addChild(this.bestScoreText);
        this.addChild(this.titleNewBest);

         // hiệu ứng
        const scoreObj = { value: 0};
        this.effectsUI.increaseScore(scoreObj,this.score,this.scoreText);

       
        this.effectsUI.starOn(this.star_off,this.star_on,this.wheel,targetX,targetY,this.star_off.width,this.star_off.height,this.maxWidth,this.maxHeight);
        console.log(this.score, this.bestScore);
        
        if(this.score > this.bestScore){ 
            this.effectsUI.newBestScore(this.titleBestScore,this.titleNewBest,this.king,tgNewBestX,tgNewBestY,this.titleNewBest.width,this.titleNewBest.height);
            this.effectsUI.increaseScore(scoreObj,this.score,this.bestScoreText);
           localStorage.setItem("block_puzzle_score", `${this.score}`);
        }

    }
    posElement() {
        
        const w = this.maxWidth;
        const h = this.maxHeight;
        const isMobile = this.maxWidth < 720 ;
    
        const spacing = h * 0.03;
        const blockW = w * (isMobile ?0.5: 0.4);
        const blockH = h * 0.1;
        const iconSize = h * (isMobile ?0.05: 0.05);
    
        this.brgSprite.position.set(0, 0);
        this.brgSprite.width = w;
        this.brgSprite.height = h;
    
        this.bgrLose.position.set(w / 2, h / 2);
        this.bgrLose.width = w * 0.9;
        this.bgrLose.height = h * 0.9;
    

        this.loseS.position.set(w / 2, this.bgrLose.height*0.2);
        this.loseS.width = w * (isMobile ? 0.5 :  0.3);
        this.loseS.height = h * 0.08;
    
        this.titleScore.width = w* (isMobile? 0.15: 0.05);
        this.titleScore.height = h*( h > 800 ? 0.15: 0.03);
        this.titleScore.position.set(w / 2, this.loseS.y + this.loseS.height + spacing);
   
        this.bgrScore.setSize(blockW, blockH);
        this.bgrScore.position.set(w / 2, this.titleScore.y + spacing + this.titleScore.height / 2 + blockH / 2);
    
        this.star_off.setSize(iconSize, iconSize);
        this.star_off.position.set(this.bgrScore.x - this.bgrScore.width / 2 + iconSize, this.bgrScore.y);

        this.star_on.setSize(iconSize, iconSize);
        this.star_on.position.set(this.star_off.x, this.star_off.y);
    
        this.wheel.setSize(iconSize * 0.6, iconSize * 0.6);
        this.wheel.position.set(this.star_off.x -iconSize*0.4, this.star_off.y - iconSize * 0.4);
    
        
        this.titleBestScore.width = w* (isMobile? 0.15: 0.05);
        this.titleBestScore.height = h*( h > 800 ? 0.15: 0.03);
        this.titleBestScore.position.set(w / 2, this.bgrScore.y + blockH + spacing * 1.2);
    

        this.bgrBScore.setSize(blockW, blockH);
        this.bgrBScore.position.set(w / 2, this.titleBestScore.y + spacing + this.titleBestScore.height / 2 + blockH / 2);
    
        this.king.setSize(iconSize, iconSize);
        this.king.position.set(this.bgrBScore.x - this.bgrBScore.width / 2 + iconSize, this.bgrBScore.y);
    
       
    
        this.titleNewBest.width = w * ((isMobile? 0.15 : 0.1));
        this.titleNewBest.height = h*( h > 800 ? 0.03: 0.03);
        this.titleNewBest.position.set(w / 2, this.bgrScore.y + blockH + spacing * 1.2);
    
    
        this.btnReplay.setSize(iconSize*1.5,iconSize*1.5);
        this.btnReplay.position.set(w / 2, h * 0.8);
    }
    posTextElement(){
        this.scoreText.position.set(this.bgrScore.x, this.bgrScore.y);
        this.scoreText.style.fontSize = this.bgrBScore.height*0.4;
        this.bestScoreText.position.set(this.bgrBScore.x, this.bgrBScore.y);
        this.bestScoreText.style.fontSize = this.bgrBScore.height*0.4;
    }
    
    destroyScene(): void {
        this.off("pointertap", this.onReplay);
        this.removeChildren();
        this.destroy({children: true, texture: false});
    }
    public onResize(width: number, height: number): void {
        this.maxWidth = width;
        this.maxHeight = height;
        this.posElement();
        this.posTextElement();
    }
    
}