import gc from "@sg/game-client-base";
import { IMultipleHandlers } from "@sg/game-client-base/dist/shared";
import inversify from "inversify";

import { GameServiceMessage } from "../game-messages";
import { MatchConfigStore } from "./match-config-store";

const { injectable, inject } = inversify;

@injectable()
export class MatchConfigHandler implements IMultipleHandlers {
    @inject(MatchConfigStore) private readonly matchConfigStore: MatchConfigStore;

    handleMatch(match: GameServiceMessage.MatchConfig) {
        if (match) {
            this.matchConfigStore.match = match;
        }
    }

    handleLastMatch(roundHistories: gc.RoundHistories.RoundHistory[]) {
        if (roundHistories && roundHistories.length > 0) {
            const parsedMatch = (roundHistories[0] as any).match;
            const lastMatch = {
                home: parsedMatch.home,
                away: parsedMatch.away,
                roundId: roundHistories[0].roundId,
            };
            this.matchConfigStore.lastMatch = lastMatch;
        }
    }

    eventHandleList = [
        {
            name: GameServiceMessage.MatchConfig.eventName,
            handle: this.handleMatch,
        },
        {
            name: GameServiceMessage.LastMatchConfig.eventName,
            handle: this.handleLastMatch,
        },
    ];
}
