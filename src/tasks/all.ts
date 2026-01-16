import { Quest, Task } from "../engine/task"
import { getTasks } from "grimoire-kolmafia"
import { TootQuest } from "./toot";
import { StartupQuest, BuffQuest } from "./startup";
import {ShadowRealmTask} from "./shadowRealm";
import {CyberRealmTask} from "./cyberRealm";
import {OctopusGardenTask} from "./octopusGarden";
import {ColosseumQuest} from "./colosseum";
import {PreItemTask} from "./preCurrents";
import {ItemTask} from "./itemRush";
import {FinalQuest} from "./final";
import {WrapupQuest} from "./wrapup";
import {ScholarTask} from "./scholar";

const allQuests: Quest[] = [
    TootQuest,
    StartupQuest,
    BuffQuest,
    ShadowRealmTask,
    CyberRealmTask,
    OctopusGardenTask,
    PreItemTask,
    ItemTask,
    ScholarTask,
    ColosseumQuest,
    WrapupQuest,
    FinalQuest
]

export function getAllTasks(): Task[] {
    return getTasks(allQuests);
}
