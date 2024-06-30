import { _decorator, Label, Node, Sprite, SpriteAtlas, UIOpacity } from "cc";
import { PFBetItem } from "db://shared-components/provably-fair/round-base/scripts/pf-bet-item";
import Observer from "observer";

import { GameServiceMessage } from "../game-messages";
import { MatchConfigStore } from "../match-config/match-config-store";

const { ccclass, property } = _decorator;
const { render } = Observer;

@ccclass("CoinTossBetItem")
export class CoinTossBetItem extends PFBetItem {
    @property(Sprite)
    flag: Sprite = null;

    @property(SpriteAtlas)
    flagsAtlas: SpriteAtlas = null;

    @property(Label)
    lblTeamName: Label = null;

    @property(Node)
    loseBg: Node = null;

    @render(MatchConfigStore, (store) => store.match, { fireImmediately: true })
    updateTeamName(match: GameServiceMessage.MatchConfig) {
        if (match.home && match.away) {
            const teamType = this.node.name;
            const teamCode = match[teamType];
            this.lblTeamName.string = teamCode;
            this.loadFlag(teamCode, teamType);
        }
    }

    public handleHighlightAnim(isActive: boolean) {
        this.loseBg.active = isActive;
        this.lblTotalBet && (this.lblTotalBet.getComponent(UIOpacity).opacity = isActive ? 180 : 255);
        this.lblOwnBet && (this.lblOwnBet.getComponent(UIOpacity).opacity = isActive ? 180 : 255);
    }

    loadFlag(teamCode: string, teamType: string) {
        const spriteFrame = this.flagsAtlas.getSpriteFrame(teamCode.toLowerCase());
        this.flag.spriteFrame = spriteFrame ?? this.flagsAtlas.getSpriteFrame(teamType);
    }
}
