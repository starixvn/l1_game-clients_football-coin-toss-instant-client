import { _decorator, Label, Node, Sprite, UIOpacity } from "cc";
import { PFBetItem } from "db://shared-components/provably-fair/round-base/scripts/pf-bet-item";
import Observer from "observer";

import { MatchConfigStore } from "../match-config/match-config-store";

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

    @render(MatchConfigStore, (store) => store.match, { fireImmediately: false })
    updateTeamName(match) {
        this.lblTeamName.string = match[this.node.name];
    }

    public handleHighlightAnim(isActive: boolean) {
        this.loseBg.active = isActive;
        this.lblTotalBet && (this.lblTotalBet.getComponent(UIOpacity).opacity = isActive ? 180 : 255);
        this.lblOwnBet && (this.lblOwnBet.getComponent(UIOpacity).opacity = isActive ? 180 : 255);
    }
}
