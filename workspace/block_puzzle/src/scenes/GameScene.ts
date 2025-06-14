/* eslint-disable prettier/prettier */
import { Application, Assets, Container, Sprite } from "pixi.js";
import { BaseScene } from "./BaseScene";
import { SceneManager } from "../handle/SceneManager";
import { BlockShapeLibrary } from "../models/BlockShape";
import { Blocks } from "../models/Blocks";
import { InputController } from "../handle/InputController";
import { BlockPickManager } from "../handle/BlockPickManager";

export class GameScene extends BaseScene{
    private blockPickManager ;
    private originalScale = 1;
    private originalPos = { x: 0, y: 0 };
    private isPicked = false;
    constructor(){
        super();
    }
    init(): void {
        const app = SceneManager.getApp();
        const offsetYTop = -300;
        const offsetYBottom = -10;
        

        const header     = this.header(offsetYTop,app);
        const body       = this.body(offsetYBottom,app);
        const pickFooter = this.pickFooter(offsetYTop,app);
        const worldTile  = this.worldTile(50,8,8,offsetYBottom,app);

        this.blockPickManager  = new BlockPickManager(this);

        this.addChild(header);
        this.addChild(body);
        this.addChild(pickFooter);
        this.addChild(worldTile);
        this.blockVisible();
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
        brgMapSettingS.width = 420;
        brgMapSettingS.height = 100;
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
         brgMapSprite.width = 415;
         brgMapSprite.height = 415;
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
        brgMapPickS.width = 450;
        brgMapPickS.height = 100;
        brgMapPickS.x = app.screen.width/2;
        brgMapPickS.y = app.screen.height/2 - offsetYBottom;
        brgMapPickS.anchor.set(0.5);
        pickFooter.addChild(brgMapPickS);
        return pickFooter;
    }
    private worldTile(tileSize: number, rows: number, cols: number,offsetYBottom: number,app: Application):Container{
        const tileLayer = new Container();
        
        const gridOffsetX  = app.screen.width/2 - (cols*tileSize)/2;
        const gridOffsetY = app.screen.height / 2 + offsetYBottom - (rows * tileSize) / 2;
        // console.log(gridOffsetX,gridOffsetY);
        

        for(let row = 0 ; row<rows; row++){
            for(let col = 0 ; col<cols; col++){
                const tileT = Assets.get("block_7");
                const tileS = new Sprite(tileT);

                tileS.width = tileSize;
                tileS.height = tileSize;

                tileS.x = gridOffsetX + col * tileSize;
                tileS.y = gridOffsetY + row * tileSize;

                tileLayer.addChild(tileS);
            }
        }
        return tileLayer;
    }
    private blockVisible(){
        const shapeWidth = 20;
        const space = 100;
        const startX = 650;
        const textureList = ["block_1", "block_2", "block_3", "block_4","block_5", "block_6"];
        for( let i=0; i<3; i++){
            const matrix = BlockShapeLibrary.getRamdomShape();
            const texture = textureList[Math.floor(Math.random() * textureList.length)];
            const block = new Blocks(matrix, texture, shapeWidth);
            block.x = startX + i*(shapeWidth+space);
            block.y = 665;
            this.addChild(block);
            this.blockPickManager.addBlock(block);
        }
        
    }
    destroyScene(): void {
        
    }
}