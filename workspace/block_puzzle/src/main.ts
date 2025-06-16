/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import { Application, Assets, Sprite } from "pixi.js";
import { AssetLoader } from "./handle/AssetsManager";
import { SceneManager } from "./handle/SceneManager";
import { GameScene } from "./scenes/GameScene";
(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: "#1099bb", resizeTo: window,resolution: window.devicePixelRatio || 1,autoDensity: true, });

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
  
  
  
  await AssetLoader.loadAllAssets();
  const bgrTexture = Assets.get("bgr");
  const brgSprite = new Sprite(bgrTexture);
  brgSprite.position.set(0, 0);
  app.stage.addChild(brgSprite);

  SceneManager.init(app);
  SceneManager.changeScene(new GameScene);

  // window.addEventListener("resize", () => {
  //   // console.log("Resized:", app.screen.width, app.screen.height);
  //   brgSprite.width = app.screen.width;
  //   brgSprite.height = app.screen.height;

  //   const scene = SceneManager.getCurrentScene();
    
  //   // if (scene && scene.onResize) {
  //   //   scene.onResize(app.screen.width, app.screen.height);
  //   // }
  //   app.renderer.resize(window.innerWidth,window.innerHeight);
  //   scene.onResize(window.innerWidth,window.innerHeight);
  // });
  

  // const frames = Array.from( { length:10 }, (_,i) => Assets.get(`jewel_green_${i}`) );
  // const frames = [];
  // for (let i = 1; i < 10; i++) {
  //   frames.push(Assets.get(`jewel_green_${i}`))
  // }
  // const anim = new AnimatedSprite(frames);
  // anim.animationSpeed = 0.15;
  // anim.play();
  // app.stage.addChild(anim)

  

  // Listen for animate update
  // app.ticker.add((time) => {
  //   // console.log(time.deltaTime);
  // });
})();
