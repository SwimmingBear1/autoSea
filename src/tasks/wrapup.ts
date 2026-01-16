import {Quest} from "../engine/task";
import {
    $class,
    $effect, $effects, $familiar,
    $item,
    $items,
    $location,
    $monster,
    $monsters,
    $skill, AprilingBandHelmet, ChestMimic,
    ClosedCircuitPayphone,
    get,
    have,
    Macro, set, withChoice
} from "libram";
import {OutfitSpec, step} from "grimoire-kolmafia";
import {CombatStrategy} from "../engine/combat";
import {abort, adv1, cliExecute, Location, myClass, myHash, runChoice, visitUrl} from "kolmafia";


function getFishLocation(): Location | undefined {
    if (!get("_unblemishedPearlTheBriniestDeepests")) {
        return $location`The Briniest Deepests`;
    } else if (!get("_unblemishedPearlMadnessReef")) {
        return $location`Madness Reef`;
    }
    return undefined;
}

function fishLocationAvailable(): boolean {
    return getFishLocation() !== undefined;
}

function getNextPearlZone(): Location | undefined {
    if (!get("_unblemishedPearlAnemoneMine")) {
        return $location`Anemone Mine`;
    } else if (!get("_unblemishedPearlTheBriniestDeepests")) {
        return $location`The Briniest Deepests`;
    } else if (!get("_unblemishedPearlMadnessReef")) {
        return $location`Madness Reef`;
    } else if (!get("_unblemishedPearlDiveBar")) {
        return $location`The Dive Bar`;
    }
    return undefined;
}

function pearlZoneAvailable(): boolean {
    return getNextPearlZone() !== undefined;
}

function getNextPearlTurns(): number {
    if (!get("_unblemishedPearlAnemoneMine")) {
        return Math.ceil((100 - get("_unblemishedPearlAnemoneMineProgress") - 0.0001) / 10.0);
    } else if (!get("_unblemishedPearlTheBriniestDeepests")) {
        return Math.ceil((100 - get("_unblemishedPearlTheBriniestDeepestsProgress") - 0.0001) / 10.0);
    } else if (!get("_unblemishedPearlMadnessReef")) {
        return Math.ceil((100 - get("_unblemishedPearlMadnessReefProgress") - 0.0001) / 10.0);
    } else if (!get("_unblemishedPearlDiveBar")) {
        return Math.ceil((100 - get("_unblemishedPearlDiveBarProgress") - 0.0001) / 10.0);
    }
    return 0;
}

export const WrapupQuest: Quest = {
    name: "Wrapup",
    tasks: [
        {
            name: "Fish Banish",
            after: ["Colosseum/Shub"],
            completed: () => !have($familiar`Patriotic Eagle`) || get("screechCombats") != 0 || !fishLocationAvailable(),
            do: () => getFishLocation()!,
            combat: new CombatStrategy().killBoss($monsters`time cop`).macro((): Macro => {
                return Macro.if_("!monstername time cop", Macro.trySkill($skill`%fn, Release the Patriotic Screech!`))
            }).killBad(),
            outfit: {
                familiar: $familiar`Patriotic Eagle`,
                equip: $items`Monodent of the Sea, Everfull Dart Holster, cursed monkey's paw, Möbius ring, shark jumper, bat wings`,
            },
            underwater: true,
            needresists: true
        },
        {
            name: "Tricking",
            after: ["Fish Banish"],
            completed: () => get("_trickOrTreatBlock").split('D').length < 6,
            do: () => {
                visitUrl(`place.php?whichplace=town&action=town_trickortreat`);
                const houseNumber = get("_trickOrTreatBlock").indexOf("D");
                if (houseNumber < 0) return;
                runChoice(3, `whichhouse=${houseNumber.toFixed(0)}`);
            },
            combat: new CombatStrategy().macro((): Macro => {
                return Macro.step("pickpocket")
                    .skill($skill`Recall Facts: Monster Habitats`)
            }).killBoss(),
            outfit: {
                familiar: $familiar`Peace Turkey`,
                equip: $items`Everfull Dart Holster, spring shoes, Mer-kin gladiator mask, Mer-kin gladiator tailpiece`
            }
        },
        // {
        //     name: "Habitat Dude",
        //     after: ["Fish Banish"],
        //     ready: () => ChestMimic.eggMonsters().has($monster`Black Crayon Fish`),
        //     completed: () => !ChestMimic.have() || !have($skill`Just the Facts`) || get("_monsterHabitatsRecalled") > 1,
        //     do: () => {
        //         ChestMimic.differentiate($monster`Black Crayon Fish`);
        //     },
        //     combat: new CombatStrategy().macro((): Macro => {
        //         return Macro.step("pickpocket")
        //             .skill($skill`Recall Facts: Monster Habitats`)
        //     }).killBoss(),
        //     outfit: {
        //         familiar: $familiar`Peace Turkey`,
        //         equip: $items`Everfull Dart Holster, spring shoes`
        //     }
        // },
        {
            name: "Do Habs",
            after: ["Tricking"],
            completed: () => !pearlZoneAvailable() || get("_monsterHabitatsFightsLeft") == 0,
            do: () => getNextPearlZone()!,
            combat: new CombatStrategy().killBoss($monsters`time cop`).macro((): Macro => {
                return Macro.externalIf(getNextPearlTurns() > 2,
                    Macro.trySkill($skill`Blow the Purple Candle`)
                        .trySkill($skill`Create an Afterimage`))
                    .trySkill($skill`Recall Facts: Monster Habitats`)
            }, $monsters`kid who is too old to be Trick-or-Treating, suburban security civilian, vandal kid`).killBoss($monsters`kid who is too old to be Trick-or-Treating, suburban security civilian, vandal kid`).macro((): Macro => {
                return Macro.trySkill($skill`Punch Out your Foe`)
                    .tryItem($item`stuffed yam stinkbomb`)
                    .tryItem($item`handful of split pea soup`)
                    .trySkill($skill`Sea *dent: Throw a Lightning Bolt`)
            }, $monsters`Mer-kin miner, Killer clownfish, Mer-kin tippler`).killBad(),
            outfit: {
                modifier: "-combat",
                equip: $items`Monodent of the Sea, Everfull Dart Holster, Roman Candelabra, cursed monkey's paw, Möbius ring, shark jumper, bat wings`,
                familiar: $familiar`Peace Turkey`,
            },
            underwater: true,
            needresists: true
        },
        {
            name: "Get Pearls",
            after: ["Do Habs", "Tricking", "Scholar/Abyss Mom"],
            completed: () => !pearlZoneAvailable(),
            do: () => getNextPearlZone()!,
            combat: new CombatStrategy().killBoss($monsters`time cop`).macro((): Macro => {
                return Macro.skill($skill`Saucegeyser`)
            }, $monsters`magic dragonfish`).killBad(),
            outfit: {
                modifier: "-combat",
                equip: $items`Monodent of the Sea, Everfull Dart Holster, Roman Candelabra, cursed monkey's paw, Möbius ring, shark jumper, bat wings`,
                familiar: $familiar`Peace Turkey`,
            },
            underwater: true,
            needresists: true
        }
    ]
}
