/* eslint-disable prettier/prettier */
import { Assets } from "pixi.js";

/* eslint-disable prettier/prettier */
export class AssetLoader{
    constructor(){

    }
    public static async loadAllAssets(): Promise<void>{
        await Promise.all([
            this.loadBackground(),
            this.loadBlock(),
            this.loadButton(),
            this.loadUI(),
            this.loadAnimationJewel()
        ])
    }
    private static async loadBackground(): Promise<void>{
        const backgrounds = {
            bgr: "assets/textures/bg.png",
            bgr_mainscreen: "assets/atlases/spr_background_mainscreen.png",
            bgr_settings:"assets/atlases/spr_background_setting_screen.png",
            bgr_bannergame: "assets/atlases/spr_banner_game.png"
        };
      await Promise.all(Object.entries(backgrounds).map( ([ alias , path ]) => Assets.load( { alias, src: path } ) ));
      
    }
    private static async loadBlock(): Promise<void>{
        const blocks = {
            block_1: "assets/atlases/spr_block_1.png",
            block_2: "assets/atlases/spr_block_2.png",
            block_3: "assets/atlases/spr_block_3.png",
            block_4: "assets/atlases/spr_block_4.png",
            block_5: "assets/atlases/spr_block_5.png",
            block_6: "assets/atlases/spr_block_6.png",
            block_7: "assets/atlases/spr_block_7.png",
            block_hightlight:"assets/atlases/spr_block_highlight.png",
            block_bomb: "assets/atlases/spr_bomb.png",
            block_border: "assets/atlases/spr_border.png"
        };
        await Promise.all(
            Object.entries(blocks).map(
                ([alias , path]) => Assets.load({alias, src: path})
            )
        );
    }
    private static async loadUI(): Promise <void>{
        const uiElements = {
            crown: "assets/atlases/crown.png",
            crown_active: "assets/atlases/crown_active.png",
            cell: "assets/atlases/spr_cell.png",
            circle:  "assets/atlases/spr_circle.png",
            cool:  "assets/atlases/spr_cool_text.png",
            excellent:  "assets/atlases/spr_excell_text.png",
            glow:  "assets/atlases/spr_glow.png",
            great:  "assets/atlases/spr_great_text.png",
            new_score:  "assets/atlases/Spr_icon_new_best_score.png",
            star_off:  "assets/atlases/spr_icon_star_off.png",
            star_on:  "assets/atlases/spr_icon_star_on.png",
            logo: "assets/atlases/spr_logo.png",
            blink: "assets/atlases/spr_blink.png",
            win: "assets/atlases/spr_panel_win.png",
            middle: "assets/atlases/spr_pannel_middle.png",
            top: "assets/atlases/spr_pannel_top.png",
            top_enless: "assets/atlases/spr_pannel_top_endless.png",
            particle: "assets/atlases/spr_particle.png",
            progress_bar_bg: "assets/atlases/spr_progress_bar_bg.png",
            progress_bar_star: "assets/atlases/progress_bar_star_active.png",
            progress_bar_dot: "assets/atlases/spr_progress_bar_dot.png",
            progress_bar_fill: "assets/atlases/spr_progress_bar_fill.png",
            progress_bar_revive_fill: "assets/atlases/spr_progress_bar_bg.png",
            star: "assets/atlases/spr_star.png",
            text_endless_loss: "assets/atlases/spr_text_endless_lose.png",
            text_new_best_score: "assets/atlases/spr_text_new_best_score.png",
            title_best_score: "assets/atlases/spr_title_ best_score.png",
            title_continue: "assets/atlases/spr_title_continue.png",
            title_game_lose: "assets/atlases/spr_title_game_lose.png",
            title_game_over: "assets/atlases/spr_title_game_over.png",
            title_score: "assets/atlases/spr_title_score.png",
            hand: "assets/atlases/spr_tut_hand.png",
            wheel: "assets/atlases/spr_wheel.png",
            win_icon: "assets/atlases/spr_win_icon.png",
        }
        await Promise.all(
            Object.entries(uiElements).map(
                ( [ alias , path] ) => Assets.load({ alias, src: path })
            )
        );
    }
    private static async loadButton(): Promise <void>{
        const buttons = {
            btn_ads: "assets/atlases/spr_btn_ads.png",
            btn_close: "assets/atlases/spr_btn_close.png",
            btn_continue: "assets/atlases/spr_btn_continue.png",
            btn_home: "assets/atlases/spr_btn_home.png",
            btn_next: "assets/atlases/spr_btn_next.png",
            btn_replay: "assets/atlases/spr_btn_replay.png",
            btn_challenge_start: "assets/atlases/spr_button_chanllenge_start.png",
            btn_classic_start: "assets/atlases/spr_button_classic_start.png",
            btn_continue_alt: "assets/atlases/spr_button_continue.png",
            btn_bomb_ads: "assets/atlases/spr_button_get_bomb_by_ads.png",
            btn_home_2: "assets/atlases/spr_button_home.png",
            btn_replay_2: "assets/atlases/spr_button_replay.png",
            btn_results: "assets/atlases/spr_button_result.png",
            btn_setting: "assets/atlases/spr_button_setting.png",
            btn_sound_off: "assets/atlases/spr_button_sound_off.png",
            btn_sond_on: "assets/atlases/spr_button_sound_on.png",
        };
        await Promise.all(
            Object.entries(buttons).map(
                ([alias ,path]) => Assets.load({alias,src: path})
            )
        )
    }
    private static async loadAnimationJewel(): Promise<void>{
        const colors = ["cyan", "green", "orange","pink","purple","red"];

        const loadSpritePromise = [];

        for(const color of colors){
            // console.log(color);
            for(let i= 0; i<10; i++){
                const alias = `jewel_${color}_${i}`;
                const path  = `assets/atlases/jewel-${color}-animation_${i}.png`
                loadSpritePromise.push( Assets.load({ alias, src: path}))
            }
        }
        await Promise.all(loadSpritePromise);
    }
    private static async sounds(): Promise<void>{
        // const audios = {
            
        // }
    }
}