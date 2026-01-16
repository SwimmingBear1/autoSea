// From loopstar (https://github.com/Kasekopf/loopstar/)

import {autosell, itemAmount, sell, use, visitUrl} from "kolmafia";
import { $item, have } from "libram";
import { Quest } from "../engine/task";
import { step } from "grimoire-kolmafia";

export const TootQuest: Quest = {
    name: "Toot",
    tasks: [
        {
            name: "Start",
            after: [],
            completed: () => step("questM05Toot") !== -1,
            do: () => visitUrl("council.php"),
            limit: { tries: 1 },
            free: true,
        },
        {
            name: "Toot",
            after: ["Start"],
            completed: () => step("questM05Toot") > 0,
            do: () => visitUrl("tutorial.php?action=toot"),
            limit: { tries: 1 },
            free: true,
        },
        {
            name: "Finish",
            after: ["Toot"],
            completed: () => step("questM05Toot") > 0 && !have($item`letter from King Ralph XI`),
            do: () => use($item`letter from King Ralph XI`),
            limit: { tries: 1 },
            free: true,
        },
        {
            name: "Get Gems",
            after: ["Finish"],
            completed: () => !have($item`pork elf goodies sack`),
            do: () => use($item`pork elf goodies sack`),
            limit: { tries: 1 },
            free: true,
        },
    ],
};
