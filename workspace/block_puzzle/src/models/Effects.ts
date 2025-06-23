/* eslint-disable prettier/prettier */
import gsap from "gsap";
import { Assets, Container, Sprite, Text } from "pixi.js";


export class Effects {
    private stage: Container;
  
    constructor(stage: Container) {
      this.stage = stage;
    }
  
    public scoreEffect(name: string, x: number, y: number,score: number) {
      if(name == "text"){
        this.scoreTextOnly(score,x,y);
        return
      }
      const texture = Assets.get(name);
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5);
      sprite.width = 120;
      sprite.height = 60;
      sprite.zIndex = 9999;

      const textScore = new Text({
        text: `${score}`,
        style: {
            fill: '#ffffff',
            fontSize: 50,
            fontFamily: 'MyFont',
        }
      });
      textScore.anchor.set(0.5);
      textScore.y = -50;
      
      const container = new Container();
      container.x = x;
      container.y = y;
      container.zIndex = 9999;
      container.addChild(sprite, textScore);
      this.stage.sortableChildren = true;
      this.stage.addChild(container);
      this.stage.sortChildren();

      container.alpha = 0;
      container.scale.set(0.5);

      const tl = gsap.timeline();

      tl.to(container, { alpha: 1, duration: 0.2, ease: 'sine.out' }, 0)
        .to(container.scale, { x: 1.2, y: 1.2, duration: 0.3, ease: 'back.out(2)' }, 0)
        .to(container, {
        y: y - 50,
        alpha: 0,
        duration: 0.5,
        ease: 'sine.in',
        delay: 0.3,
        onComplete: () => {
            this.stage.removeChild(container);
            container.destroy({ children: true });
        }
        });
    }
    public scoreTextOnly(score: number, x: number, y: number){
        const text = new Text({
            text: `${score}`,
            style: {
                fill: '#ffffff',
                fontSize: 50,
                fontFamily: 'MyFont',
            }
          });
        text.anchor.set(0.5);
        text.x = x;
        text.y = y;

        this.stage.addChild(text);

        gsap.to(text, {
            y: y - 50,
            alpha: 0,
            duration: 0.8,
            ease: "sine.inOut",
            onComplete: () => {
                this.stage.removeChild(text);
                text.destroy();
            }
        });
    }
}
  