import { _decorator, ImageAsset, Label, Node, resources, Sprite, SpriteFrame, UIOpacity } from "cc";
import { PFBetItem } from "db://shared-components/provably-fair/round-base/scripts/pf-bet-item";
import Observer from "observer";

import { MatchConfigStore } from "../match-config/match-config-store";
import { GameServiceMessage } from "../game-messages";

const { ccclass, property } = _decorator;
const { render } = Observer;

@ccclass("CoinTossBetItem")
export class CoinTossBetItem extends PFBetItem {
    @property(Sprite)
    flag: Sprite = null;

    @property(Label)
    lblTeamName: Label = null;

    @property(Node)
    loseBg: Node = null;

    @render(MatchConfigStore, (store) => store.match, { fireImmediately: true })
    updateTeamName(match: GameServiceMessage.MatchConfig) {
        if (match.home && match.away) {
            const teamCode = match[this.node.name];
            this.lblTeamName.string = teamCode;
            this.loadFlag(teamCode);
        }
    }

    public handleHighlightAnim(isActive: boolean) {
        this.loseBg.active = isActive;
        this.lblTotalBet && (this.lblTotalBet.getComponent(UIOpacity).opacity = isActive ? 180 : 255);
        this.lblOwnBet && (this.lblOwnBet.getComponent(UIOpacity).opacity = isActive ? 180 : 255);
    }

    loadFlag(teamCode: string) {
        resources.load(`flags/${teamCode.toLowerCase()}`, ImageAsset, (err, imageAsset) => {
            if (err) {
                console.log(err);
                // Should load default image here
                return;
            }

            this.flag.spriteFrame = SpriteFrame.createWithImage(imageAsset);
        });
    }
}
