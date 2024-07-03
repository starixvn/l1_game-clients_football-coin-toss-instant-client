import inversify from "inversify";
const { injectable, inject } = inversify;
import gc from "@sg/game-client-base";
import { MatchConfigStore } from "../match-config";

@injectable()
export class FootballCoinTossNoticeHandlers extends gc.Notices.NoticeHandlers {
    @inject(MatchConfigStore)
    protected readonly matchConfigStore: MatchConfigStore;

    handleNotice(notice: gc.GameServiceMessage.Notice) {
        const { gameRoundId } = notice;

        if (gameRoundId && gameRoundId !== this.roundStore.roundId) {
            return;
        }

        const isHedgeBetGroup = !!notice?.hedgeBetGroup;
        const text = isHedgeBetGroup ? this.getHedgeBetErrorMessage(notice) : gc.ErrorUtils.getErrorMessage(notice, this.getSystem());
        this.noticeStore.addWarning(text);
    }

    getHedgeBetErrorMessage(notice: gc.GameServiceMessage.Notice) {
        const { errorCode, hedgeBetGroup } = notice;
        const option = { errorCode };
        hedgeBetGroup?.forEach((choice, index) => {
            const choiceName = this.matchConfigStore ? this.matchConfigStore[choice] : choice;
            option[`betChoice${index + 1}`] = gc.Translator.gameTranslate(`glossary_${choiceName}`);
        });

        return gc.Translator.translate("InstantGame.message_hedge_bet", option);
    }
}
