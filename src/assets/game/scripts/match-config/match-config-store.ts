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

    set match(match: GameServiceMessage.MatchConfig) {
        this._home = match?.home;
        this._away = match?.away;
    }

    get home(): string {
        return this._home;
    }

    get away(): string {
        return this._away;
    }

    constructor() {
        makeAutoObservable(this);
    }
}
