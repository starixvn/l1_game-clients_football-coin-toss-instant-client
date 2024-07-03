import gc from "@sg/game-client-base";
import { _decorator, Label } from "cc";
import { ResultStatistic } from "db://shared-components/game/result-statistic/scripts/components/result-statistic";
const { ccclass, property } = _decorator;
import Observer from "observer";
const { render } = Observer;
import { MatchConfigStore } from "../match-config";
import { GameServiceMessage } from "../game-messages";

@ccclass("CoinTossResultStatistic")
export class CoinTossResultStatistic extends ResultStatistic {
    @property({ override: true })
    supportStatisticKeys = "home,away";

    @property(Label)
    homeLabel: Label;

    @property(Label)
    awayLabel: Label;

    protected generateStatisticalData(histories: gc.RoundHistories.RoundHistory[]) {
        const statisticCount = histories.reduce((result, history) => {
            this.statisticKeys?.forEach((key) => {
                if (history.result[key]) {
                    result[key] = (result[key] || 0) + 1;
                }
            });
            return result;
        }, {});
        return Object.keys(statisticCount).reduce((result, key) => {
            result[key] = `${Math.round((statisticCount[key] / histories.length) * 100)}%`;
            return result;
        }, {});
    }

    @render(MatchConfigStore, (store) => store.match, { fireImmediately: true })
    updateMatch(match: GameServiceMessage.MatchConfig) {
        if (match && match.home && match.away && this.homeLabel && this.awayLabel) {
            this.homeLabel.string = gc.Translator.gameTranslate(`glossary_${match.home}`);
            this.awayLabel.string = gc.Translator.gameTranslate(`glossary_${match.away}`);
        }
    }
}
