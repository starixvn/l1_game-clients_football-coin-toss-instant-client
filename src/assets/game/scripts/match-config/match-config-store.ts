import inversify from "inversify";
import mobx from "mobx";

import { GameServiceMessage } from "../game-messages";

const { injectable } = inversify;
const { makeAutoObservable } = mobx;

export const DefaultMatchData = {
    home: "",
    away: "",
};

@injectable()
export class MatchConfigStore {
    private _home: string;
    private _away: string;
    private _lastMatch: GameServiceMessage.LastMatchConfig;

    set match(match: GameServiceMessage.MatchConfig) {
        this._home = match?.home;
        this._away = match?.away;
    }

    get match(): GameServiceMessage.MatchConfig {
        return { home: this._home, away: this._away };
    }

    get home(): string {
        return this._home;
    }

    get away(): string {
        return this._away;
    }

    set lastMatch(match: GameServiceMessage.LastMatchConfig) {
        this._lastMatch = match;
    }

    get lastMatch(): GameServiceMessage.LastMatchConfig {
        return this._lastMatch;
    }

    constructor() {
        makeAutoObservable(this);
    }
}
