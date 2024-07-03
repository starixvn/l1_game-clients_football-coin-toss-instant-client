import gc from "@sg/game-client-base";
import { LogStore } from "db://shared-components/game/scripts/stores/log-store";
import { sharedContainer } from "../../scripts/shared-container";
import * as MatchInfoFeature from "./match-config/index";
import { FootballCoinTossNoticeHandlers } from "./handlers/notice-handler";

export const settings = {
    id: 93,
    name: "FootballCoinToss",
    durations: {
        wholeRound: 29,
        lockingBet: 3,
        placingBet: 20,
        generatingResult: 2,
        startRound: 3,
    },
    numberOfRoundHistory: 100,
};

export const containerOptions: gc.IContainerOptions = {
    globalContainer: sharedContainer,
    onContainerCreated: (container) => {
        container.bind(gc.GameConfigs.GameSetting).toConstantValue(settings);
        container.bind(LogStore).to(LogStore);
        container.bind(gc.Notices.NoticeHandlers).to(FootballCoinTossNoticeHandlers);
    },
    features: [MatchInfoFeature, gc.RoundBasePF, ...gc.defaultFeatures],
};
