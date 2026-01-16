import {$item, $skill, get, have} from "libram";
import {Effect, equip, haveEffect, mpCost, myMp, restoreMp, Skill, turnsPerCast, useSkill} from "kolmafia";


export function myRestoreMp() {
    if (have($item`bat wings`) && get("_batWingsRestUsed") < 11) {
        equip($item`bat wings`);
        useSkill($skill`Rest upside down`);
        return;
    } else {
        restoreMp(100);
    }
}


export function ensureEffect(skill: Skill, effect: Effect, duration: number) {
    while (haveEffect(effect) < duration) {
        while (myMp() < mpCost(skill)) {
            myRestoreMp();
        }

        const turnsNeeded = duration - haveEffect(effect);
        const castsNeeded = Math.ceil(turnsNeeded / turnsPerCast(skill));
        const availableCasts = Math.floor(myMp() / mpCost(skill));
        const castsToMake = Math.min(castsNeeded, availableCasts);

        if (castsToMake > 0) {
            useSkill(castsToMake, skill);
        } else {
            break;
        }
    }
}


