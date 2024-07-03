import gc from "@sg/game-client-base";
import { _decorator, Label, Node, Sprite, SpriteAtlas, UIOpacity } from "cc";
import { PFBetItem } from "db://shared-components/provably-fair/round-base/scripts/pf-bet-item";
import Observer from "observer";

import { GameServiceMessage } from "../game-messages";
import { MatchConfigStore } from "../match-config/match-config-store";

const { ccclass, property } = _decorator;
const { render } = Observer;
const { Rounds, RoundHistories } = gc;
const { RoundTimeStore } = Rounds;

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

    private match: GameServiceMessage.MatchConfig;
    private lastMatch: GameServiceMessage.LastMatchConfig;

    @render(MatchConfigStore, (store) => store.match, { fireImmediately: true })
    updateTeamName(match: GameServiceMessage.MatchConfig) {
        if (match.home && match.away) {
            this.match = match;
        }
    }

    @render(MatchConfigStore, (store) => store.lastMatch, { fireImmediately: false })
    updateLastMatchTeamName(lastMatch: GameServiceMessage.LastMatchConfig) {
        if (lastMatch.home && lastMatch.away) {
            this.lastMatch = lastMatch;
        }
    }

    @render(RoundHistories.RoundHistoryStore, (store) => store.firstJoinGameHistory)
    async renderStaticResult(firstJoinGameHistory: gc.RoundHistories.IFirstJoinGameHistory) {
        if (!firstJoinGameHistory) {
            return;
        }

        const { animationHighlight, roundTime, roundHistory: lastRound } = firstJoinGameHistory;
        if (lastRound && animationHighlight && roundTime > 0) {
            this.setTeam(this.lastMatch);
        } else {
            this.setTeam(this.match);
        }
    }

    @render(RoundTimeStore, (store) => store.isStartRound, { fireImmediately: true })
    receiveRoundTime(isStartRound: boolean) {
        if (isStartRound) {
            this.setTeam(this.match);
        }
    }

    private setTeam(match: GameServiceMessage.MatchConfig) {
        if (match?.home && match?.away) {
            const teamType = this.node.name;
            const teamCode = match[teamType];
            this.lblTeamName.string = this.getTeamName(teamCode, teamType);
            this.loadFlag(teamCode, teamType);
        }
    }

    getTeamName(teamCode: string, teamType: string) {
        const teamTypeText = gc.Translator.gameTranslate(`glossary_${teamCode.toUpperCase()}`);
        if (teamTypeText.startsWith("glossary_")) {
            return gc.Translator.gameTranslate(`glossary_${teamType}`);
        }

        return teamTypeText;
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
