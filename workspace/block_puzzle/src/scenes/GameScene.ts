/* eslint-disable prettier/prettier */
import { Assets, Container, Sprite } from "pixi.js";
import { BaseScene } from "./BaseScene";
import { SceneManager } from "../handle/SceneManager";

export class GameScene extends BaseScene{
    constructor(){
        super();
    }
    init(): void {
        const app = SceneManager.getApp();
        const offsetYTop = -300;
        const offsetYBottom = -10;

        // bgr menu
        // const bgrSettingT = Assets.get("bgr_settings");
        // const bgrSettingS = new Sprite(bgrSettingT);
        // bgrSettingS.scale.x = 0.44;
        // bgrSettingS.scale.y = 0.1;
        // bgrSettingS.x = SceneManager.getApp().screen.width/2;
        // bgrSettingS.y = SceneManager.getApp().screen.height/2 +offsetYTop;
        // bgrSettingS.anchor.set(0.5);

        //bgr map chính
        const brgMapTexture = Assets.get("block_border");
        const brgMapSprite = new Sprite(brgMapTexture);
        brgMapSprite.scale.set(0.4);
        brgMapSprite.x = app.screen.width/2;
        brgMapSprite.y = app.screen.height/2 + offsetYBottom;
        brgMapSprite.anchor.set(0.5);

        const brgMapSettingS = new Sprite(brgMapTexture);
        brgMapSettingS.scale.x = 0.4;
        brgMapSettingS.scale.y = 0.05;
        brgMapSettingS.x = SceneManager.getApp().screen.width/2;
        brgMapSettingS.y = SceneManager.getApp().screen.height/2 +offsetYTop;
        brgMapSettingS.anchor.set(0.5);

        const brgMapPickS = new Sprite(brgMapTexture);
        brgMapPickS.scale.x = 0.4;
        brgMapPickS.scale.y = 0.1;
        brgMapPickS.x = app.screen.width/2;
        brgMapPickS.y = app.screen.height/2 +300;
        brgMapPickS.anchor.set(0.5);
        
        //world
        const tileSize = 50;
        const rows = 8;
        const cols = 8;
        const tileLayer = new Container();
        
        const gridOffsetX  = app.screen.width/2 - (cols*tileSize)/2;
        const gridOffsetY = app.screen.height / 2 + offsetYBottom - (rows * tileSize) / 2;

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

        // thêm vào stage
        this.addChild(brgMapSprite);
        // this.addChild(bgrSettingS);
        this.addChild(brgMapSettingS);
        this.addChild(brgMapPickS);
        this.addChild(tileLayer)
    }
    
    destroyScene(): void {
        
    }
}