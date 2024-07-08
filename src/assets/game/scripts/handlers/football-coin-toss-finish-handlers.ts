import inversify from "inversify";

const { injectable, inject } = inversify;

import gc from "@sg/game-client-base";
import { MatchConfigStore } from "../match-config";

@injectable()
export class FootballCoinTossRFinishedShowResult extends gc.Settlements.SettlementUIHandlers.FinishedShowResult {
    @inject(gc.RoundHistories.RoundHistoryStore) private readonly footballRoundHistoryStore: gc.RoundHistories.RoundHistoryStore;

    @inject(gc.Settlements.SettlementStore) private readonly footballSettlementStore: gc.Settlements.SettlementStore;

    @inject(MatchConfigStore)
    protected readonly matchConfigStore: MatchConfigStore;

    handle() {
        this.handleFinishedShowResult();

        const { roundId, result, settlementResult, md5Result } = this.footballSettlementStore;
        const { currentMatch, match } = this.matchConfigStore;

        const isValidMatch = (match) => {
            return match && typeof match.home === "string" && typeof match.away === "string";
        };

        const matchToInsert = isValidMatch(currentMatch) ? currentMatch : null;
        this.footballRoundHistoryStore.insertNewRound({
            roundId,
            result,
            settlementResult,
            md5Result,
            match: matchToInsert ?? match,
        } as any);
    }
}
