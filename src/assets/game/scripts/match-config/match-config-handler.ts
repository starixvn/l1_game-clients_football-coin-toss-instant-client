import inversify from "inversify";
import { Match } from "./definitions";
import { IMultipleHandlers } from "@sg/game-client-base/dist/shared";

const { injectable } = inversify;

@injectable()
export class MatchConfigHandler implements IMultipleHandlers {
    handle(match: Match) {
        if (match) {
            console.log(match);
        }
    }

    eventHandleList = [
        {
            name: "match",
            handle: this.handle,
        },
    ];
}
