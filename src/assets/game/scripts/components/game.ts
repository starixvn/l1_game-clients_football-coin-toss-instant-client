import gc from "@sg/game-client-base";
import { Label, Node, _decorator, log, sp } from "cc";
import GameComponent from "db://shared-components/game/scripts/components/game-component";
import { startGame } from "db://shared-components/shared/scripts/startup";
import Observer from "observer";
import { AudioUtils } from "../../../../extensions/shared-components/assets/game/audios/utils";
import { bundleManager } from "../../../../extensions/shared-components/assets/shared/common-components/bundle-manager/bundle-manager";
import { FunctionUtils } from "../../../../extensions/shared-components/assets/shared/utils";
import { siteConfigs } from "../../../scripts/site-configs";
import { GameServiceMessage } from "../game-messages";
import { containerOptions, settings } from "../game-settings";
import { MatchConfigHandler, MatchConfigStore } from "../match-config";
import "./../../../resources/i18n";
import { CoinTossWinningResult } from "./coin-toss-winning-result";
import { FlipCoin } from "./flip-coin";
import { HighlightResult } from "./highlight-result";

const { Rounds, Translator, RoundHistories, UserSettings } = gc;

startGame(settings.name, containerOptions, siteConfigs);

const { ccclass, property } = _decorator;
const { observer, render, handle } = Observer;

type ResultSoundInfo = {
    soundId: string;
    duration: number;
};

export const HOME_AWAY_NAME = "HOME-AWAY";

@ccclass
@observer(settings.name)
export default class Game extends GameComponent {
    @property({ type: Label, override: true, visible: false })
    lblMinBet: Label = null;

    @property({ type: Label, override: true, visible: false })
    lblMaxBet: Label = null;

    @property({ type: Node })
    winningResultNode: Node = null;

    @property({ type: Node })
    flipCoinNode: Node = null;

    @property({ type: Node })
    highlightResultNode: Node = null;

    private winningResult: CoinTossWinningResult = null;
    private flipCoin: FlipCoin = null;
    private highlightResult: HighlightResult = null;

    override namespace = settings.name;
    override containerOptions = containerOptions;
    isLoading = true;

    private readonly winningSounds = { home: "home", away: "away" };
    private readonly winningMusic = { home: "home_music", away: "home_music" };
    private readonly crowdSounds = "crowd-game";
    private readonly pathAnimTossDefault = `animations/${HOME_AWAY_NAME}/toss/coin_toss`;

    protected clientRoundId = -1;
    protected resultSoundIds: ResultSoundInfo[] = [];
    enableFixHandleFinish = true;

    private match: GameServiceMessage.MatchConfig;
    private nextMatchSkeleton: sp.SkeletonData;

    onLoad() {
        super.onLoad();
        this.fetchComponents();
        this.winningResult?.hideQuickly();
        this.flipCoin?.init();
    }

    fetchComponents() {
        this.winningResult = this.winningResultNode?.getComponent(CoinTossWinningResult);
        this.flipCoin = this.flipCoinNode?.getComponent(FlipCoin);
        this.highlightResult = this.highlightResultNode?.getComponent(HighlightResult);
    }

    @render(Rounds.RoundStore, (store) => store.clientRoundId)
    storeClientRoundId(clientRoundId: number) {
        this.clientRoundId = clientRoundId;
    }

    @render(Rounds.RoundTimeStore, (store) => store.isInRoundTime)
    renderInRoundTime(isInRoundTime: boolean) {
        if (isInRoundTime && !this.isLoading) {
            this.winningResult.hideQuickly();
            this.updateCurrentMatch(this.match);
        }
    }

    async finishShowResult(result: gc.GameServiceMessage.TResult, settlementResult: gc.GameServiceMessage.TSettlementResult) {
        this.highlightResult.show(result);
        this.playWinningSound();
        super.finishShowResult(result, settlementResult);
    }

    async showResult(result: gc.GameServiceMessage.TResult, hasAnimation: boolean) {
        if (result) {
            this.flipCoin.setStatusNode(false);
            this.loadSoundResultBeforeRead(result);
            this.winningResult.setResult(result);
            if (hasAnimation) {
                await this.winningResult.show();
            }
        }
    }

    @render(Rounds.RoundTimeStore, (store) => store.isStartPlacingBet)
    startPlacingBet(isStartPlacingBet: boolean) {
        this.playStoppableSFX(this.crowdSounds);
    }

    async playWinningSound() {
        for (const resultSoundInfo of this.resultSoundIds) {
            this.playStoppableSFX(resultSoundInfo.soundId);
            await FunctionUtils.delay(resultSoundInfo.duration * 1000);
        }
    }

    @handle(gc.Audios.AudioHandler, (handle, id: string) => handle.stopStoppableSFX(id))
    stopStoppableSFX(id: string) {
        return id;
    }

    @handle(gc.Audios.AudioHandler, (handle, id: string) => handle.playStoppableSFX(id))
    playStoppableSFX(id: string) {
        return id;
    }

    @render(UserSettings.UserSettingStore, (store) => store.sfxEnable)
    enableSFX(sfxEnable: boolean) {
        if (!sfxEnable) {
            this.stopStoppableSFX("");
        }
    }

    async loadSoundResultBeforeRead(data: gc.GameServiceMessage.TResult) {
        let isCancelLoadSounds = false;
        const maxWaitTime = 5000;
        const result = Object.keys(data).find((key) => data[key]);

        const timeoutCancelWinningSound = setTimeout(() => {
            isCancelLoadSounds = true;
        }, maxWaitTime);

        if (isCancelLoadSounds) {
            return;
        }

        const winOptionName = this.match ? this.match[result]?.toLowerCase() : this.winningSounds[result];

        const soundId = this.getAudioKeyForLanguage(winOptionName);
        if (soundId) {
            const duration = (await AudioUtils.getDurationClip(soundId)) - 0.4; // reduce duration of winning sound

            this.resultSoundIds.push({ soundId, duration });
        }
        const musicDuration = await AudioUtils.getDurationClip(this.winningMusic[result]);
        this.resultSoundIds.push({ soundId: this.winningMusic[result], duration: musicDuration });
        timeoutCancelWinningSound && clearTimeout(timeoutCancelWinningSound);
    }

    getAudioKeyForLanguage(name: string): string {
        return `${name}_${Translator.getLanguageId() || "en"}`;
    }

    async handleStartRound(isStartRound: boolean) {
        if (isStartRound) {
            super.handleStartRound(isStartRound);
            this.winningResult?.hideQuickly();
            if (this.nextMatchSkeleton) {
                this.flipCoin?.setSkeletonData(this.nextMatchSkeleton);
                this.flipCoin?.playAnim();
                this.winningResult?.setSkeletonData(this.nextMatchSkeleton);
            }

            this.highlightResult?.hide();
            this.resultSoundIds = [];
        }
    }

    @handle(MatchConfigHandler, (handle, match: GameServiceMessage.MatchConfig) => handle.handleCurrentMatch(match))
    updateCurrentMatch(match: GameServiceMessage.MatchConfig) {
        if (match?.home && match?.away) {
            return match;
        }
    }

    @render(gc.App.AppStore, (store) => store.isLoading)
    updateLoading(isLoading: boolean) {
        this.isLoading = isLoading;
    }

    @render(MatchConfigStore, (store) => store.match, { fireImmediately: true })
    updateMatch(match: GameServiceMessage.MatchConfig) {
        if (match.home && match.away) {
            this.match = match;
            this.loadMatchSkeleton(this.match);
        }
    }

    @render(RoundHistories.RoundHistoryStore, (store) => store.firstJoinGameHistory)
    async renderStaticResult(firstJoinGameHistory: gc.RoundHistories.IFirstJoinGameHistory) {
        if (!firstJoinGameHistory) {
            return;
        }

        const { animationHighlight, roundTime, roundHistory: lastRound } = firstJoinGameHistory;
        if (lastRound && animationHighlight && roundTime > 0) {
            const { result } = lastRound;
            this.flipCoin?.setStatusNode(false);
            this.highlightResult?.show(result);
        }
    }

    async loadMatchSkeleton(match: GameServiceMessage.MatchConfig) {
        if (match?.home && match?.away) {
            const resourcePath = `${match?.home.toUpperCase()}-${match?.away.toUpperCase()}`;
            await this.loadResourcesAnim(resourcePath);
        }
    }

    async loadResourcesAnim(resourcePath: string) {
        const customPath = `animations/${resourcePath}/toss/coin_toss`;

        try {
            const skeletonData = await this.loadSkeletonData(customPath);
            skeletonData && this.updateSkeletonData(skeletonData);
        } catch (error) {
            log("Not found skeleton data into path: ", resourcePath, error.message);
            const skeletonData = await this.loadSkeletonData(this.pathAnimTossDefault);
            skeletonData && this.updateSkeletonData(skeletonData);
        }
    }

    private async loadSkeletonData(path: string): Promise<sp.SkeletonData | null> {
        try {
            const skeletonData = (await bundleManager?.loadAssetsFromBundle("resources", path, sp.SkeletonData, null)) as sp.SkeletonData;

            return (
                skeletonData ?? (await bundleManager?.loadAssetsFromBundle("resources", this.pathAnimTossDefault, sp.SkeletonData, null))
            );
        } catch (error) {
            log("Failed to load skeleton data from path: ", path, error.message);
            return null;
        }
    }

    private updateSkeletonData(skeletonData: sp.SkeletonData) {
        if (!this.nextMatchSkeleton) {
            this.winningResult.setSkeletonData(skeletonData);
            this.flipCoin.setSkeletonData(skeletonData);
        }

        if (skeletonData) {
            this.nextMatchSkeleton = skeletonData;
        }
    }
}
