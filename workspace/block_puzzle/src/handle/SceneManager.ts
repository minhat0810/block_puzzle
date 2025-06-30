/* eslint-disable prettier/prettier */
import { Application } from "pixi.js";
import type { BaseScene } from "../scenes/BaseScene";

export class SceneManager {
    private static currentScene: BaseScene;
    private static app: Application;
    static isSoundOn: boolean = true;
    private static resizeCallback?: () => void;

    static init(app: Application, resizeCallback?: () => void) {
        this.app = app;
        this.resizeCallback = resizeCallback;
        window.addEventListener("resize", this.onWindowResize.bind(this));
    }

    static getApp() {
        return this.app;
    }

    static changeScene(newScene: BaseScene) {
        if (this.currentScene) {
            this.app.stage.removeChild(this.currentScene);
            this.currentScene.destroy({ children: true });
        }
        this.currentScene = newScene;
        this.app.stage.addChild(this.currentScene);
        newScene.init();

        const { innerWidth, innerHeight } = window;

        // Gọi resize callback để scale rootContainer
        if (this.resizeCallback) this.resizeCallback();

        // Gọi resize logic của scene
        this.currentScene.onResize(innerWidth, innerHeight);
    }

    static getCurrentScene() {
        return this.currentScene;
    }

    static onWindowResize() {
        this.app.renderer.resize(window.innerWidth, window.innerHeight);
        if (this.currentScene) {
          this.currentScene.onResize(window.innerWidth, window.innerHeight);
        }
    }
}
