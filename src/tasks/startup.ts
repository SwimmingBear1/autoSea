import { Task, Quest } from "../engine/task"
import { ensureEffect } from "../engine/buff";
import {
    $class,
    $classes, $coinmaster,
    $effect,
    $effects,
    $familiar,
    $item,
    $items,
    $location,
    $skill, AprilingBandHelmet, AugustScepter, BurningLeaves, Clan,
    get,
    have,
    Leprecondo,
    MayamCalendar, TakerSpace
} from "libram";
import {
    autosell,
    buy,
    canAdventure,
    cliExecute,
    drink, Effect, equip, haveEffect, hippyStoneBroken, inHardcore,
    itemAmount, length, max, mpCost,
    myClass, myGardenType, myMp, pullsRemaining, restoreMp,
    Skill, turnsPerCast,
    use,
    useSkill,
    visitUrl,
    storageAmount,
    mallPrice,
    toInt,
} from "kolmafia";
import {args} from "../args";
import {pull} from "../util";


export const StartupQuest: Quest = {
    name: "Startup",
    tasks: [
        {
            name: "Pulls",
            after: [],
            ready: () => !inHardcore(),
            completed: () => inHardcore() || (pullsRemaining() < 20),
            do: () => {
                const potentialPulls = [
                    $item`pro skateboard`,
                    $item`shark jumper`,
                    $item`Flash Liquidizer Ultra Dousing Accessory`,
                    $item`spooky VHS tape`,
                    $item`sea lasso`,
                    $item`sea cowbell`,
                    $item`lodestone`,
                    $item`Mer-kin pinkslip`,
                    $item`stuffed yam stinkbomb`,
                    $item`handful of split pea soup`,
                    $item`anchor bomb`,
                    $item`Platinum Yendorian Express Card`,
                    $item`ink bladder`,
                    $item`Mer-kin sneakmask`,
                    $item`minin' dynamite`,
                ]
                const pullsWorth = new Map ([
                    [toInt($item`spooky VHS tape`), 2],
                    [toInt($item`sea lasso`), 16500/get("valueOfAdventure")],//16500 as the worth of a Barf monkey wish
                    [toInt($item`sea cowbell`), 16500/get("valueOfAdventure")],
                    [toInt($item`Mer-kin pinkslip`), 1],
                    [toInt($item`stuffed yam stinkbomb`), 1],
                    [toInt($item`handful of split pea soup`), 1],
                    [toInt($item`anchor bomb`), 1],
                    [toInt($item`ink bladder`), .8],
                    [toInt($item`minin' dynamite`), 1],
                ])
                for ( let i = 0; i < potentialPulls.length; i++) {
                    let x = potentialPulls[i];
                    if ( !(x == $item`minin' dynamite` && have($item`Platinum Yendorian Express Card`))
                        && (!pullsWorth.has(toInt(x)) || (pullsWorth.get(toInt(x))??0 * get("valueOfAdventure") > mallPrice(x)))
                        && (storageAmount(x) > 0 || mallPrice(x) < get("autoBuyPriceLimit"))) {
                            pull(x);
                    }
                }
            },
            free: true
        },
        {
            name: "Make tunac",
            completed: () => get("_floundryItemCreated"),
            do: () => cliExecute("acquire 1 tunac"),
            free: true,
        },
        {
            name: "Swim Sprints",
            completed: () => get("_olympicSwimmingPool"),
            do: () => cliExecute("swim sprints"),
            free: true,
        },
        {
            name: "Break Hippy Stone",
            after: [],
            ready: () => args.pvp,
            completed: () => hippyStoneBroken(),
            do: (): void => {
                visitUrl("peevpee.php?action=smashstone&pwd&confirm=on", true);
                visitUrl("peevpee.php?place=fight");
            },
            free: true
        },
        {
            name: "Drink beer",
            after: [],
            ready: () => have($item`astral six-pack`) || have($item`astral pilsner`),
            completed: () => !have($item`astral six-pack`) && !have($item`astral pilsner`),
            do: () => {
                if (have($item`astral six-pack`)) use($item`astral six-pack`);
                while (have($item`astral pilsner`)) {
                    if (!have($effect`Ode to Booze`)) {
                        useSkill($skill`Ode to Booze`);
                    }
                    drink(1, $item`astral pilsner`);
                }
            },
            effects: $effects`Ode to Booze`,
            free: true,
        },
        {
            name: "Summon Resort Pass",
            after: [],
            completed: () => !have($skill`Summon Kokomo Resort Pass`) || !(get("_summonResortPassesUsed") === 0),
            do: () => {
                useSkill($skill`Summon Kokomo Resort Pass`); // TODO: Figure out how to use this up to the cap
            },
            free: true
        },
        {
            name: "Sell Gems",
            after: ["Toot/Get Gems", "Summon Resort Pass"],
            completed: () => !have($item`porquoise`) && !have($item`hamethyst`) && !have($item`baconstone`),
            do: () => {
                const stuff_to_sell = $items`hamethyst, baconstone, porquoise, Kokomo Resort Pass`
                for (const item of stuff_to_sell) {
                    if (have(item)) autosell(item, itemAmount(item));
                }
            },
            free: true
        },
        {
            name: "Mayam Calendar",
            after: [],
            completed: () => !MayamCalendar.have() || MayamCalendar.remainingUses() === 0,
            do: () => {
                MayamCalendar.submit("vessel yam2 cheese explosion");
                MayamCalendar.submit("fur bottle wall clock");
                MayamCalendar.submit("eye meat yam3 yam4");
            },
            free: true,
            outfit: () => {
                if (have($familiar`Chest Mimic`)) return { modifier: "mp", familiar: $familiar`Chest Mimic` };
                return { modifier: "mp", familiar: $familiar`Grouper Groupie` };
            }
        },
        {
            name: "TakerSpace",
            after: [],
            completed: () => !TakerSpace.have() || TakerSpace.installed(),
            do: () => {
                use($item`TakerSpace letter of Marque`);
                TakerSpace.make($item`anchor bomb`, 1);
            },
            free: true,
        },
        {
            name: "Leprecondo",
            after: [],
            completed: () => !Leprecondo.have() || Leprecondo.rearrangesRemaining() < 3,
            do: () => {
                Leprecondo.setFurniture("high-end home workout system", "ultimate retro game console", "internet-connected laptop", "padded weight bench");
            },
            free: true,
        },
        {
            name: "Grab Rakes",
            after: [],
            completed: () => !BurningLeaves.have() || have($item`rake`),
            do: () => {
                visitUrl("campground.php?preaction=leaves")
            },
            free: true
        },
        {
            name: "Grab Scepter Items",
            after: [],
            completed: () => !AugustScepter.have() || AugustScepter.getAugustCast(24),
            do: () => {
                useSkill($skill`Aug. 24th: Waffle Day!`);
                // useSkill($skill`Aug. 18th: Serendipity Day!`);
            },
            free: true
        },
        {
            name: "Set SIT Course",
            after: [],
            completed: () => !have($item`S.I.T. Course Completion Certificate`) || have($skill`Psychogeologist`),
            do: () => {
                use($item`S.I.T. Course Completion Certificate`);
            },
            choices: { [1494]: 1 },
            free: true
        },
        {
            name: "Guild Pants Unlock",
            after: [],
            ready: () => myClass() === $class`Accordion Thief` || myClass() === $class`Disco Bandit`,
            completed: () => !have($item`tearaway pants`) || canAdventure($location`The Unquiet Garves`),
            do: () => {
                visitUrl("guild.php?place=challenge");
                visitUrl("guild.php?place=scg");
                visitUrl("guild.php?place=scg");
                visitUrl("guild.php?place=ocg");
                visitUrl("guild.php?place=ocg");
                visitUrl("guild.php?place=paco");
            },
            free: true,
            outfit: () => {
                return { pants: $item`tearaway pants` }
            }
        },
        {
            name: "Garden",
            after: [],
            completed: () => myGardenType() !== "rock" || have($item`milestone`),
            do: () => {
                cliExecute("garden pick")
            }
        },
        {
            name: "Censer Purchases",
            after: [],
            completed: () => !have($item`Sept-Ember Censer`) || get("availableSeptEmbers") <= 7,
            do: () => {
                visitUrl("shop.php?whichshop=september");
                // visitUrl("shop.php?whichshop=september&action=buyitem&quantity=3&whichrow=1513&pwd");
            },
            free: true,
        },
        {
            name: "Prepare Band",
            after: [],
            completed: () => !AprilingBandHelmet.have() || !AprilingBandHelmet.canJoinSection(),
            do: () => {
                AprilingBandHelmet.joinSection($item`Apriling band tuba`);
                AprilingBandHelmet.joinSection($item`Apriling band piccolo`);
                while (AprilingBandHelmet.canPlay($item`Apriling band piccolo`)) {
                    AprilingBandHelmet.play($item`Apriling band piccolo`);
                }
            },
            free: true,
            outfit: () => {
                if (have($familiar`Chest Mimic`)) return { familiar: $familiar`Chest Mimic` };
                return { familiar: $familiar`Grouper Groupie` };
            }
        },
        {
            name: "Get Sheriff Equipment",
            after: [],
            completed: () => !have($item`Clan VIP Lounge key`) || get("_photoBoothEquipment", 0) >= 3,
            do: () => {
                Clan.with("Bonus Adventures from Hell", () => {
                    cliExecute("photobooth item sheriff pistol");
                    cliExecute("photobooth item sheriff moustache");
                    cliExecute("photobooth item sheriff badge");
                });
            },
            free: true
        },
        {
            name: "Talk to Old Man",
            after: [],
            completed: () => have($item`really, really nice swimming trunks`),
            do: () => {
                visitUrl("place.php?whichplace=sea_oldman&action=oldman_oldman");
                if (have($item`sushi-rolling mat`)) use($item`sushi-rolling mat`);
            },
            free: true,
        },
        {
            name: "Open Ski Set",
            after: [],
            completed: () => !have($item`McHugeLarge duffel bag`) || have($item`McHugeLarge right pole`),
            do: () => visitUrl("inventory.php?action=skiduffel&pwd"),
            outfit: { avoid: $items`McHugeLarge duffel bag` },
            free: true,
        },
        {
            name: "Shower",
            after: [],
            completed: () => !have($item`April Shower Thoughts Shield`) || get("_aprilShowerGlobsCollected") || have($item`spitball`),
            do: () => {
                visitUrl("inventory.php?action=shower&pwd");
                visitUrl("shop.php?whichshop=showerthoughts");
                visitUrl("shop.php?whichshop=showerthoughts&action=buyitem&quantity=1&whichrow=1580&pwd");
            },
            free: true,
            outfit: {avoid: $items`April Shower Thoughts shield`}
        },
        {
            name: "2002",
            after: ["Pulls"],
            completed: () => !have($item`2002 Mr. Store Catalog`) || get("_2002MrStoreCreditsCollected"),
            do: () => {
                use($item`2002 Mr. Store Catalog`);
                if (!have($item`Flash Liquidizer Ultra Dousing Accessory`)) {
                    buy($coinmaster`Mr. Store 2002`, 1, $item`Flash Liquidizer Ultra Dousing Accessory`);
                }
                if (!have($item`pro skateboard`)) {
                    buy($coinmaster`Mr. Store 2002`, 1, $item`pro skateboard`);
                }
                buy($coinmaster`Mr. Store 2002`, get("availableMrStore2002Credits"), $item`Spooky VHS Tape`);
            },
            free: true
        }
    ]
}

const aprilBuffs = new Map<Effect, Skill>([
    [$effect`Thoughtful Empathy`, $skill`Empathy of the Newt`],
    [$effect`Lubricating Sauce`, $skill`Sauce Contemplation`],
    [$effect`Tubes of Universal Meat`, $skill`Manicotti Meditation`],
    [$effect`Slippery as a Seal`, $skill`Seal Clubbing Frenzy`],
    [$effect`Strength of the Tortoise`, $skill`Patience of the Tortoise`],
    [$effect`Disco over Matter`, $skill`Disco Aerobics`],
    [$effect`Mariachi Moisture`, $skill`Moxie of the Mariachi`],
])

const nonAprilBuffs = new Map<Effect, Skill>([
    [$effect`Empathy`, $skill`Empathy of the Newt`],
    [$effect`Elemental Saucesphere`, $skill`Elemental Saucesphere`],
    [$effect`Astral Shell`, $skill`Astral Shell`],
    [$effect`Leash of Linguini`, $skill`Leash of Linguini`],
    [$effect`Singer's Faithful Ocelot`, $skill`Singer's Faithful Ocelot`],
    [$effect`Springy Fusilli`, $skill`Springy Fusilli`],
    [$effect`Only Dogs Love a Drunken Sailor`, $skill`Only Dogs Love a Drunken Sailor`]
])


export const BuffQuest: Quest = {
    name: "Starting Buffs" ,
    tasks: [
        {
            name: "Get Accordion",
            after: ["Startup/Sell Gems", "Startup/Mayam Calendar"],
            completed: () => have($item`antique accordion`),
            do: () => buy($item`antique accordion`),
            free: true
        },
        {
            name: "April Buffs",
            after: ["Get Accordion"],
            completed: () => Array.from(aprilBuffs.keys()).every(effect => have(effect)),
            do: () => {
                for (const effect of aprilBuffs.keys()) {
                    if (!have(effect)) {
                        const skill = aprilBuffs.get(effect)!;
                        ensureEffect(skill, effect, 120);
                    }
                }
            },
            free: true,
            outfit: { modifier: "mp", offhand: $item`April Shower Thoughts shield`}
        },
        {
            name: "Non-April Buffs",
            after: ["Get Accordion"],
            completed: () => Array.from(nonAprilBuffs.keys()).every(effect => have(effect)),
            do: () => {
                for (const effect of nonAprilBuffs.keys()) {
                    if (!have(effect)) {
                        const skill = nonAprilBuffs.get(effect)!;
                        ensureEffect(skill, effect, 150);
                    }
                }
            },
            free: true,
            outfit: { modifier: "mp", avoid: $items`April Shower Thoughts shield`}
        },
        {
            name: "Zirconia Buffs",
            after: [],
            completed: () => !have($item`blood cubic zirconia`) || get("_bczSweatEquityCasts") > 0,
            do: () => {
                for (let i = 0; i < 3; i++) {
                    useSkill($skill`BCZ: Sweat Equity`);
                    useSkill($skill`BCZ: Dial it up to 11`);
                    useSkill($skill`BCZ: Prepare Spinal Tapas`);
                    useSkill($skill`BCZ: Craft a Pheromone Cocktail`);
                    useSkill($skill`BCZ: Create Blood Thinner`);
                }
            },
            free: true,
            outfit: { acc1: $item`blood cubic zirconia` }
        },
        {
            name: "Alliedradio Boon",
            after: [],
            ready: () => have($item`Allied Radio Backpack`),
            completed: () => get("_alliedRadioWildsunBoon"),
            do: () => cliExecute("alliedradio effect boon"),
            free: true
        },
        {
            name: "Softcore Lighthouse",
            after: [],
            ready: () => AugustScepter.have(),
            completed: () => !AugustScepter.have() || !AugustScepter.canCast(7),
            do: () => {
                useSkill($skill`Aug. 7th: Lighthouse Day!`);
            },
            free: true
        }
    ]
}
