import gc from "@sg/game-client-base";
import { LogStore } from "db://shared-components/game/scripts/stores/log-store";
import { sharedContainer } from "../../scripts/shared-container";
import { FootballCoinTossRFinishedShowResult } from "./handlers/football-coin-toss-finish-handlers";
import { FootballCoinTossNoticeHandlers } from "./handlers/notice-handler";
import * as MatchInfoFeature from "./match-config/index";

const GAME_NAME = "FootballCoinToss";
export const settings = {
    id: 93,
    name: GAME_NAME,
    durations: {
        wholeRound: 29,
        lockingBet: 3,
        placingBet: 20,
        generatingResult: 2,
        startRound: 3,
    },
    numberOfRoundHistory: 100,
    observerNamespace: GAME_NAME,
};

export const containerOptions: gc.IContainerOptions = {
    globalContainer: sharedContainer,
    onContainerCreated: (container) => {
        container.bind(gc.GameConfigs.GameSetting).toConstantValue(settings);
        container.bind(LogStore).to(LogStore);
        container.bind(gc.Notices.NoticeHandlers).to(FootballCoinTossNoticeHandlers);
        container.bind(gc.Settlements.SettlementUIHandlers.FinishedShowResult).to(FootballCoinTossRFinishedShowResult);
    },
    features: [MatchInfoFeature, gc.RoundBasePF, ...gc.defaultFeatures],
};
