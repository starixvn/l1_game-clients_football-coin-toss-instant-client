import { IHandler } from "@sg/game-client-base/dist/shared";
import inversify from "inversify";

import { GameServiceMessage } from "../game-messages";
import { MatchConfigStore } from "./match-config-store";

const { injectable, inject } = inversify;

@injectable()
export class MatchConfigHandler implements IHandler<GameServiceMessage.MatchConfig> {
    name = GameServiceMessage.MatchConfig.eventName;

    @inject(MatchConfigStore) private readonly matchConfigStore: MatchConfigStore;

    handle(match: GameServiceMessage.MatchConfig) {
        if (match) {
            this.matchConfigStore.match = match;
            console.log(match);
        }
    }
}
