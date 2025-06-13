/* eslint-disable prettier/prettier */
import { Application } from "pixi.js"
import type { BaseScene } from "../scenes/BaseScene";

export class SceneManager{

    private static currentScene: BaseScene;
    private static app: Application;

    static init(app: Application){
        this.app = app;
    }
    static getApp(){
        return this.app;
    }
    static changeScene(newScene: BaseScene){
        if(this.currentScene){
            this.app.stage.removeChild(this.currentScene);
            this.currentScene.destroy( {children : true} );
        }
        this.currentScene = newScene;
        this.app.stage.addChild(this.currentScene);
        newScene.init();
    }
}