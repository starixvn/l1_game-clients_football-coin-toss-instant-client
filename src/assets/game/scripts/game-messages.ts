export namespace GameServiceMessage {
    export class MatchConfig {
        home: string;
        away: string;

        static eventName = "match";
    }

    export class LastMatchConfig {
        home: string;
        away: string;
        roundId: number;

        static eventName = "roundHistory";
    }
}
