/* eslint-disable prettier/prettier */
import gsap from "gsap";
import { Assets, Container, Sprite, Text } from "pixi.js";
import { Blocks } from "./Blocks";


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
            fill: 0xffffff,
            fontSize: 40,
            fontFamily: 'Arial',
            fontWeight: "bold"
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
                fill: 0xffffff,
                fontSize: 40,
                fontFamily: 'Arial',
                fontWeight: "bold"
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
    public increaseScore(scoreObj: {value: number},score: number,text: Text, delay: number = 0 ){
      gsap.to(scoreObj,{
        value: score,
        duration:0.2,
        delay: delay,
        ease: 'power1.out',
        onUpdate: () => {
          text.text = Math.floor(scoreObj.value).toString();
        }
    })
    }
    public starOn(star_off: Sprite,star_on: Sprite,wheel: Sprite, targetX: number, targetY: number,width: number, height: number,sWitdh: number,sHeight: number){
      star_on.position.set(sWitdh / 2, sHeight / 2);
      star_on.alpha = 1;
      star_on.width = star_on.height = 0;
         gsap.to(star_on, {
            x: targetX,
            y: targetY,
            width: width,
            height: height,
            alpha: 1,
            rotation: Math.PI * 2,
            duration: 0.5,
            ease: "power2.inOut",
            onComplete: () => {
                star_on.visible = true;
                star_off.visible = false;
            }
        });

        gsap.to(wheel, {
            x: wheel.x,
            y: wheel.y,
            alpha: 1,
            rotation: Math.PI * 2,
            //repeat: 1,
            duration: 0.8,
            ease: "power2.inOut",
        });

    }
    public newBestScore(best_text: Sprite,new_best: Sprite,king: Sprite,targetX : number, targetY: number,width: number, height: number ){
      new_best.visible = true;
      gsap.to(new_best, {
            x: targetX,
            y: targetY,
            width: width,
            height: height,
            alpha: 1,
            duration: 0.5,
            ease: "power2.inOut",
            onComplete: () => {
                best_text.visible = false;
            }
        });

        king.rotation = -Math.PI / 4;
        gsap.to(king, {
            rotation: "-=0.1",
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            repeatDelay: 0.1,
            ease: "sine.inOut"
        });

    }
    public newMapEffect(tile1: Sprite, x: number, y: number, delay: number){
      gsap.to(tile1, {
        x: x,
        y: y,
        width: 50,
        height: 50,
        alpha: 1,
        scale: 1,
        duration: 0.5,
        delay: delay,
        ease: "back.out(1.7)"
      });
    //   gsap.to(tile2, {
    //     x: x,
    //     y: y,
    //     width: 50,
    //     height: 50,
    //     alpha: 1,
    //     scale: 1,
    //     duration: 0.5,
    //     delay: delay + 0.05,
    //     ease: "back.out(1.7)"
    // });
    }
    public zoomBlock(block: Blocks, newSize: number) {
      block.tiles.forEach((row, rowIndex) => {
          row.forEach((tile, colIndex) => {
            if (tile && tile.parent) {
              gsap.to(tile, {
                  width: newSize,
                  height: newSize,
                  x: colIndex * newSize,
                  y: rowIndex * newSize,
                  duration: 0.2,
                  ease: "back"
              });
            }
            
          });
      });
      block.shapeSize = newSize;
    }
    public hand(sprite: Sprite, targetX: number, targetY: number, orgX: number, orgY: number, onComplete?: ()=>void) {
      sprite.x = orgX;
      sprite.y = orgY;
  
      const tl = gsap.timeline({
        onComplete: () => {
          if(onComplete) onComplete();
        }
      });
  
      tl.to(sprite, {
          x: targetX,
          y: targetY,
          duration: 0.5,
          ease: "back.out(1.7)"
      }).to(sprite, {
          x: orgX,
          y: orgY,
          duration: 0.5,
          ease: "power2.inOut",
          delay: 0.5 
      });
  }
  
  
}
  