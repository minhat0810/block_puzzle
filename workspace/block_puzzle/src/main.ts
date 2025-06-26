/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import { Application, Assets, Sprite, Text } from "pixi.js";
import { AssetLoader } from "./handle/AssetsManager";
import { SceneManager } from "./handle/SceneManager";
import { GameScene } from "./scenes/GameScene";
import { TutorialScene } from "./scenes/TutorialScene";
import { LoseScene } from "./scenes/LoseScene";
//import { HomeScene } from "./scenes/HomeScene";
(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: "#000000", resizeTo: window,resolution: window.devicePixelRatio || 1,autoDensity: true, antialias: true });

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);
  document.addEventListener("pointerdown",async() =>{
    try{
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      if(context.state != "running"){
        await context.resume();
      }
      context.close();
    }catch(err){
      console.error("Failed to resume audio context", err);
    }
  },{once: true});

  await Assets.load([
    { alias: "progress_bar_bg", src: "assets/atlases/spr_progress_bar_bg.png" },
    { alias: "progress_bar_fill", src: "assets/atlases/spr_progress_bar_fill.png" },
    { alias: "bgr_mainscreen", src: "assets/atlases/spr_background_mainscreen.png" },
    { alias: "progress_bar_dot", src: "assets/atlases/spr_progress_bar_dot.png" }
  ]);
  const bgr = new Sprite(Assets.get("bgr_mainscreen"));
  bgr.position.set(0,0);
  bgr.width = app.screen.width;
  bgr.height = app.screen.height;

  
  const progressBarBg = new Sprite(Assets.get("progress_bar_bg"));
  const progressBarFill = new Sprite(Assets.get("progress_bar_fill"));
  const progressBarDot = new Sprite(Assets.get("progress_bar_dot"));

  progressBarBg.anchor.set(0.5);
  progressBarFill.anchor.set(0, 0.5); 
  progressBarBg.position.set(app.screen.width / 2, app.screen.height / 2 + 100);
  progressBarFill.position.set(progressBarBg.x - progressBarBg.width / 2 + 5, progressBarBg.y);
  progressBarFill.scale.x = 0;

  progressBarDot.anchor.set(0, 0.5); 
  progressBarDot.position.set(progressBarBg.x - progressBarBg.width / 2 + 5, progressBarBg.y-25);
  progressBarDot.setSize(30,30);

  app.stage.addChild(bgr);
  app.stage.addChild(progressBarBg);
  app.stage.addChild(progressBarFill);
  app.stage.addChild(progressBarDot);
  

   const loadingText = new Text({
    text : "Loading...",
    style: {
      fill: 0x00000,
      fontSize: 36,
      fontFamily: "Robo"
    }
  });
  loadingText.anchor.set(0.5);
  loadingText.position.set(app.screen.width / 2, app.screen.height / 2);
  app.stage.addChild(loadingText);

  await AssetLoader.loadProgress((percent) => {
    progressBarFill.scale.x = percent/100;
    const progress = percent/100;
    const fillWidth = progressBarFill.texture.width;
    progressBarDot.x = progressBarFill.x + fillWidth * progress
  });

  app.stage.removeChild(bgr);
  app.stage.removeChild(loadingText);
  app.stage.removeChild(progressBarBg);
  app.stage.removeChild(progressBarFill);


  SceneManager.init(app);
  //localStorage.removeItem("seen_tutorial")
  const seenTutorial = localStorage.getItem("seen_tutorial");

  if (seenTutorial) {
    localStorage.removeItem("block_puzzle_score");
    SceneManager.changeScene(new LoseScene(10,10));
  } else {
    SceneManager.changeScene(new TutorialScene());
  }


})();
