import { Location, Monster } from "kolmafia"
import { Task as BaseTask, Quest as BaseQuest } from "grimoire-kolmafia"
import { CombatActions, CombatStrategy } from "./combat"
import { CombatStrategy as BaseCombatStrategy } from "grimoire-kolmafia"

export type Quest = BaseQuest<Task>

export type Task = {

    priority?: number;
    combat?: CombatStrategy | BaseCombatStrategy<CombatActions>
    free?: boolean;
    underwater?: boolean;
    needresists?: boolean;

    minturns?: number | (() => number);
    avgturns?: number | (() => number);

    peridot?: Monster;

} & BaseTask<CombatActions>;
