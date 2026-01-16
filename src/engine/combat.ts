import { ActionDefaults, CombatStrategy as BaseCombatStrategy } from "grimoire-kolmafia"
import {haveEquipped, haveSkill, Location, Monster, myLevel} from "kolmafia";
import {$effect, $item, $skill, get, have, Macro} from "libram";

const myActions = [
    "kill",
    "killBoss",
    "killFree",
    "killBad",
    "run"
] as const;

export type CombatActions = (typeof myActions)[number];
export class CombatStrategy extends BaseCombatStrategy.withActions(myActions) {

}

export class MyActionDefaults implements ActionDefaults<CombatActions> {

    kill(target?: Monster | Location) {
        return killMacro(false, false, false);
    }

    killBoss(target?: Monster | Location) {
        return killMacro(true, false, false);
    }

    killFree(target?: Monster | Location) {
        return killMacro(false, true, false)
    }

    killBad(target?: Monster | Location) {
        return killMacro(false, true, true);
    }

    run(target?: Monster | Location) {
        return runMacro();
    }

}

export function runMacro(): Macro {
    const result = new Macro();

    if (haveEquipped($item`Everfull Dart Holster`)) {
        result.trySkill($skill`Darts: Throw at %part1`)
    }
    result.if_("monstername Mer-kin*", Macro.tryItem($item`Mer-kin pinkslip`))
    if (haveEquipped($item`Mafia middle finger ring`)) {
        result.trySkill($skill`Show them your ring`)
    }
    result.trySkillRepeat($skill`Saucegeyser`);
    return result.attack().repeat();
}

export function killMacro(hard?: boolean, free?: boolean, badfree?: boolean): Macro {
    const result = new Macro();
    if (!hard) {
        result.step("pickpocket");
    }

    if (haveEquipped($item`Everfull Dart Holster`)) {
        if (!hard && get("everfullDartPerks").includes("You are less impressed by bullseyes") && !have($effect`Everything Looks Red`)) {
            result
                .trySkill($skill`Darts: Aim for the Bullseye`)
                .trySkill($skill`Darts: Aim for the Bullseye`)
                .trySkill($skill`Darts: Aim for the Bullseye`)
                .trySkill($skill`Darts: Aim for the Bullseye`)
                .trySkill($skill`Darts: Aim for the Bullseye`);
        } else {
            result.if_(
                "hasskill darts: throw at butt",
                Macro.step("skill darts: throw at butt")
            ).ifNot(
                "hasskill darts: throw at butt",
                Macro.trySkill($skill`Darts: Throw at %part1`)
            )
        }
    }
    if (free) {
        if (badfree) {
            result.trySkill($skill`Assert your authority`)
                // .tryItem($item`groveling gravel`);
        }
        result.if_(`hasskill 7573`, Macro.skill($skill`BCZ: Sweat Bullets`))
            .externalIf(get("_shadowBricksUsed") < 13, Macro.tryItem($item`shadow brick`))
            .trySkill($skill`Shattering Punch`)
            .trySkill($skill`Gingerbread Mob Hit`)
            .tryItem($item`spitball`);
    }
    if (badfree || hard) {
        result.trySkillRepeat($skill`Saucegeyser`);
    }
    if (haveSkill($skill`Shieldbutt`)) {
        result.trySkillRepeat($skill`Shieldbutt`);
    }

    return result.attack().repeat();
}
