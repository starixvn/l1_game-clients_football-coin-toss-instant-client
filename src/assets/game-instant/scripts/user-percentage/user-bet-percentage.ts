import gc from "@sg/game-client-base";
import { _decorator, Node, Layout, UITransform } from "cc";
import { ObserverComponent } from "../../../../extensions/shared-components/assets/shared/common-components/observer-component/scripts/observer-component";
import Observer from "observer";
import { BetChoice } from "../coin-toss-choices";
const { ccclass, property } = _decorator;
const { render } = Observer;
const { Rounds } = gc;
@ccclass()
export default class UserBetPercentage extends ObserverComponent {
    @property(Node)
    headPercentage: Node = null;

    @property(Node)
    tailPercentage: Node = null;

    @property(Node)
    nodePercentageLayout: Node = null;

    @render(Rounds.RoundStore, (store) => store.userBetPercentage)
    handleUserBetPercentage(userBetPercentage: gc.GameServiceMessage.UserBetPercentage) {
        const homeBetPercentage = userBetPercentage?.[BetChoice.Home] ?? 0;
        const awayBetPercentage = userBetPercentage?.[BetChoice.Away] ?? 0;
        const isShowProgressDefault = homeBetPercentage === 0 && awayBetPercentage === 0;
        this.updateProgressBar(homeBetPercentage, isShowProgressDefault);
    }
    updateProgressBar(progress: number, isShowProgressDefault: boolean) {
        this.nodePercentageLayout.active = !isShowProgressDefault;
        const progressBarLayout = this.nodePercentageLayout.getComponent(Layout);
        const progressBarTransform = this.nodePercentageLayout.getComponent(UITransform);
        const widthDefault = progressBarTransform.width;
        if (progressBarLayout) {
            const [headNode, tailNode] = progressBarLayout.node.children;
            const headUITransform = headNode.getComponent(UITransform);
            const tailUITransform = tailNode.getComponent(UITransform);

            if (headUITransform && tailUITransform) {
                headUITransform.width = progress * (widthDefault / 100);
                tailUITransform.width = widthDefault - headUITransform.width;
            }
        }
    }
}
