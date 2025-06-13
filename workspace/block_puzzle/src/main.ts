/* eslint-disable prettier/prettier */
import { AnimatedSprite, Application, Assets, Sprite } from "pixi.js";
import { AssetLoader } from "./assets/AssetLoader";
import { SceneManager } from "./handle/SceneManager";
import { GameScene } from "./scenes/GameScene";

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: "#1099bb", resizeTo: window });

  // Append the application canvas to the document body
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  await AssetLoader.loadAllAssets();
  const bgrTexture = Assets.get("bgr");
  const brgSprite = new Sprite(bgrTexture);
  brgSprite.position.set(0, 0);
  app.stage.addChild(brgSprite);

  // const frames = Array.from( { length:10 }, (_,i) => Assets.get(`jewel_green_${i}`) );
  // const frames = [];
  // for (let i = 1; i < 10; i++) {
  //   frames.push(Assets.get(`jewel_green_${i}`))
  // }
  // const anim = new AnimatedSprite(frames);
  // anim.animationSpeed = 0.15;
  // anim.play();
  // app.stage.addChild(anim)

  SceneManager.init(app);
  SceneManager.changeScene(new GameScene);

  // Listen for animate update
  app.ticker.add((time) => {
    // console.log(time.deltaTime);
  });
})();
