/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import { Application, Assets, Container, Sprite, Text } from "pixi.js";
import { AssetLoader } from "./handle/AssetsManager";
import { SceneManager } from "./handle/SceneManager";
import { GameScene } from "./scenes/GameScene";
import { TutorialScene } from "./scenes/TutorialScene";
// import { TutorialScene } from "./scenes/TutorialScene";

(async () => {
  const app = new Application();
  await app.init({
    resizeTo: window, // Tự động theo cửa sổ
    background: "#000000",
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
    antialias: true
  });

  document.getElementById("pixi-container")!.appendChild(app.canvas);

  const rootContainer = new Container();
  app.stage.addChild(rootContainer);

  // Tải tài nguyên
  await Assets.load([
    { alias: "progress_bar_bg", src: "assets/atlases/spr_progress_bar_bg.png" },
    { alias: "progress_bar_fill", src: "assets/atlases/spr_progress_bar_fill.png" },
    { alias: "bgr_mainscreen", src: "assets/atlases/spr_background_mainscreen.png" },
    { alias: "progress_bar_dot", src: "assets/atlases/spr_progress_bar_dot.png" }
  ]);

  // Background
  const bgr = new Sprite(Assets.get("bgr_mainscreen"));
  rootContainer.addChild(bgr);

  // Progress bar
  const progressBarBg = new Sprite(Assets.get("progress_bar_bg"));
  const progressBarFill = new Sprite(Assets.get("progress_bar_fill"));
  const progressBarDot = new Sprite(Assets.get("progress_bar_dot"));

  progressBarBg.anchor.set(0.5);
  progressBarFill.anchor.set(0, 0.5);
  progressBarDot.anchor.set(0.5);

  // Text
  const loadingText = new Text({
    text: "LOADING...",
    style: {
      fill: 0x00000,
      fontSize: app.screen.width*( app.screen.width < 720 ? 0.05 : 0.03),
      fontFamily: "Arial",
      fontWeight: "bold"
    }
  });
  loadingText.anchor.set(0.5);
  rootContainer.addChild(progressBarBg, progressBarFill, progressBarDot, loadingText);

  // Resize layout
  function resizeLayout() {
    const { width, height } = app.screen;

    bgr.width = width;
    bgr.height = height;

    loadingText.position.set(width / 2, height / 2);
    progressBarBg.position.set(width / 2, height / 2 + 100);
    progressBarBg.width = width*(width<720?0.8:0.4);

    progressBarFill.position.set(progressBarBg.x - progressBarBg.width / 2 + 5, progressBarBg.y);
    progressBarFill.scale.set(0, 1);
    progressBarFill.width = progressBarFill.texture.width;
    
    progressBarDot.position.set(progressBarFill.x, progressBarBg.y - 25);
    progressBarDot.width = 30;
    progressBarDot.height = 30;
  }

  window.addEventListener("resize", resizeLayout);
  resizeLayout();

  // Âm thanh sau lần click đầu
  document.addEventListener("pointerdown", async () => {
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (context.state !== "running") {
        await context.resume();
      }
      context.close();
    } catch (err) {
      console.error("Failed to resume audio context", err);
    }
  }, { once: true });

  // Hiệu ứng loading
  await AssetLoader.loadProgress((percent) => {
    const progress = percent / 100;
    progressBarFill.scale.x = progress;

    const fillWidth = progressBarFill.texture.width;
    progressBarDot.x = progressBarFill.x + fillWidth * progress;
  });
  rootContainer.removeChild(bgr, loadingText, progressBarBg, progressBarFill, progressBarDot);

  SceneManager.init(app);
  const seenTutorial = localStorage.getItem("seen_tutorial");
  if (seenTutorial) {
    SceneManager.changeScene(new GameScene());
  } else {
    localStorage.removeItem("block_puzzle_score");
    SceneManager.changeScene(new TutorialScene());
  }
})();
