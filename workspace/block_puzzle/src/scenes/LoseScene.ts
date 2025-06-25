/* eslint-disable prettier/prettier */
import { Assets, Sprite, Text } from "pixi.js";
import { SceneManager } from "../handle/SceneManager";
import { BaseScene } from "./BaseScene";
import { Effects } from "../models/Effects";
import { GameScene } from "./GameScene";

export class LoseScene extends BaseScene{
    private score : number = 0;
    private bestScore: number = 0;
    private effectsUI !: Effects;
    private onReplay!: () => void;
    
    constructor(score: number, bestScore: number){
        super();
        this.score = score;
        this.bestScore = bestScore;
     }
    init(): void {
        const app = SceneManager.getApp();
        const maxWidth = app.screen.width;
        const maxHeight = app.screen.height;
        this.effectsUI = new Effects(this);

        const bgrTexture = Assets.get("bgr");
        const brgSprite = new Sprite(bgrTexture);
        brgSprite.position.set(0, 0);
        brgSprite.width = maxWidth;
        brgSprite.height = maxHeight;

        const bgrLose = new Sprite(Assets.get("bgr_settings"));
        bgrLose.width = maxWidth*0.4;
        bgrLose.height = maxHeight*0.95;
        bgrLose.position.set(maxWidth/2,maxHeight/2)
        bgrLose.anchor.set(0.5,0.5);
        bgrLose.alpha = 0.9;

        const loseS = new Sprite(Assets.get("title_game_over"));
        loseS.anchor.set(0.5,0.5);
        loseS.position.set(maxWidth/2, maxHeight*0.2);
        loseS.width = maxWidth*0.2;
        loseS.height = 80;

        const titleScore = new Sprite(Assets.get("title_score"));
        titleScore.anchor.set(0.5,0.5);
        titleScore.setSize(100,50)
        titleScore.position.set(maxWidth/2, maxHeight*0.3);

        const titleBestScore = new Sprite(Assets.get("title_best_score"));
        titleBestScore.anchor.set(0.5,0.5);
        titleBestScore.setSize(100,50)
        titleBestScore.position.set(maxWidth/2, maxHeight*0.5);
        console.log(titleBestScore.x,titleBestScore.y);
        

        const bgrScore = new Sprite(Assets.get("middle"));
        bgrScore.anchor.set(0.5,0.5);
        bgrScore.setSize(250,50)
        bgrScore.position.set(maxWidth/2, titleScore.y + 70);
        bgrScore.alpha = 0.5;

        const bgrBScore = new Sprite(Assets.get("middle"));
        bgrBScore.anchor.set(0.5,0.5);
        bgrBScore.setSize(250,50)
        bgrBScore.position.set(maxWidth/2, titleBestScore.y + 70);
        bgrBScore.alpha = 0.5;

        const star_off = new Sprite(Assets.get("star_off"));
        star_off.anchor.set(0.5,0.5);
        star_off.setSize(30,30)
        star_off.position.set(bgrScore.x - bgrScore.width/2+30, bgrScore.y);

        const star_on = new Sprite(Assets.get("star_on"));
        star_on.anchor.set(0.5);
        star_on.setSize(100, 100);
        star_on.position.set(maxWidth/2, maxHeight/2);

        const king = new Sprite(Assets.get("win_icon"));
        king.anchor.set(0.5,0.5);
        king.setSize(30,30)
        king.position.set(bgrScore.x - bgrBScore.width/2+30, bgrBScore.y);

        const wheel = new Sprite(Assets.get("wheel"));
        wheel.anchor.set(0.5,0.5);
        wheel.setSize(20,20)
        wheel.position.set(bgrScore.x - bgrScore.width/2+20, bgrScore.y-5);

        const btnReplay = new Sprite(Assets.get("btn_replay_2"));
        btnReplay.anchor.set(0.5,0.5);
        btnReplay.setSize(70,70)
        btnReplay.position.set(maxWidth/2, maxHeight*0.8);
        btnReplay.eventMode = "static";
        btnReplay.cursor = "pointer";
        this.onReplay = () => {
            SceneManager.changeScene(new GameScene());
        };
        btnReplay.on("click", this.onReplay);

        const scoreText = new Text({
            text : "0",
            style: {
                fill: 0xffffff,
                fontFamily: "Robo",
                fontSize: "30",
                fontWeight: "bold"
            }
        });
        scoreText.anchor.set(0.5,0.5);
        scoreText.position.set(bgrScore.x, bgrScore.y);

        const titleNewBest = new Sprite(Assets.get("text_new_best_score"));
        titleNewBest.visible = false;
        titleNewBest.anchor.set(0.5,0.5);
        titleNewBest.setSize(500, 100);
        titleNewBest.position.set(maxWidth/2, maxHeight/2);
        const tgNewBestX = maxWidth/2;
        const tgNewBestY = maxHeight*0.5;
        console.log(tgNewBestX,tgNewBestY);
        
        const bestScoreText = new Text({
            text : `${this.bestScore}`,
            style: {
                fill: 0xffffff,
                fontFamily: "Robo",
                fontSize: "30",
                fontWeight: "bold"
            }
        })
        bestScoreText.anchor.set(0.5,0.5);
        bestScoreText.position.set(bgrBScore.x, bgrBScore.y);
           

        // hiệu ứng
        const scoreObj = { value: 0};
        this.effectsUI.increaseScore(scoreObj,this.score,scoreText);

        const targetX = bgrScore.x - bgrScore.width/2+30;
        const targetY = bgrScore.y;
        this.effectsUI.starOn(star_off,star_on,wheel,targetX,targetY);
        if(this.score > this.bestScore){ 
            this.effectsUI.newBestScore(titleBestScore,titleNewBest,king,tgNewBestX,tgNewBestY);
            this.effectsUI.increaseScore(scoreObj,this.score,bestScoreText);
            this.bestScore = this.score;
            localStorage.setItem("block_puzzle_score", `${this.bestScore}`);
        }


        this.addChild(brgSprite);
        this.addChild(bgrLose);
        this.addChild(loseS);
        this.addChild(titleScore);
        this.addChild(titleBestScore);
        this.addChild(bgrScore);
        this.addChild(bgrBScore);
        this.addChild(star_off);
        this.addChild(star_on);
        this.addChild(wheel);
        this.addChild(king);
        this.addChild(btnReplay);
        this.addChild(scoreText);
        this.addChild(bestScoreText);
        this.addChild(titleNewBest);

    }
    destroyScene(): void {
        this.off("click", this.onReplay);
        this.removeChildren();
        this.destroy({children: true, texture: false});
    }
    
}