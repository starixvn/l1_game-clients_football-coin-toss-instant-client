export namespace GameServiceMessage {
    export class MatchConfig {
        home: string;
        away: string;

        static eventName = "match";
    }
}
