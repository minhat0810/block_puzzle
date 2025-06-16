/* eslint-disable prettier/prettier */
import { Application } from "pixi.js"
import type { BaseScene } from "../scenes/BaseScene";

export class SceneManager{

    private static currentScene: BaseScene;
    private static app: Application;

    static init(app: Application){
        this.app = app;
        window.addEventListener("resize", this.onWindowResize.bind(this));
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
    static getCurrentScene(){
        return this.currentScene;
    }
    static onWindowResize() {
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
        if (this.currentScene) {
          this.currentScene.onResize(window.innerWidth, window.innerHeight);
        }
    }
}