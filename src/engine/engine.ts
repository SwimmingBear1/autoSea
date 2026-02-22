import {Engine as BaseEngine, EngineOptions, Outfit} from "grimoire-kolmafia"
import {Task} from "./task";
import {
    Location,
    myHp,
    myMaxhp,
    myMp,
    myMaxmp,
    print,
    restoreHp,
    setLocation,
    numericModifier,
    use,
    create,
    toSkill, mpCost, mySpleenUse, spleenLimit, abort, cliExecute,
    haveSkill
} from "kolmafia";
import {CombatActions, CombatStrategy, MyActionDefaults} from "./combat";
import {
    $effect,
    $effects, $familiar,
    $item, $items,
    $location, $monsters,
    $skill, Counter,
    ensureEffect,
    have,
    PropertiesManager,
    undelay,
    uneffect
} from "libram";
import {myRestoreMp} from "./buff";


const pearlResists = new Map<Location, string>([
    [$location`Anemone Mine`, "Spooky resistance"],
    [$location`Dive Bar`, "Sleaze resistance"],
    [$location`Madness Reef`, "Stench resistance"],
    [$location`Marinara Trench`, "Hot resistance"],
    [$location`The Briniest Deepests`, "Cold resistance"]
])

function ensureResists(location: Location): boolean {
    const pearlResist = pearlResists.get(location);
    if (!pearlResist) {
        return true;
    }
    if (!have($effect`Minor Invulnerability`)) {
        use($item`scroll of minor invulnerability`)
    }
    if (numericModifier(pearlResist!) < 18) {
        throw `Could not reach desired ${pearlResist} for ${location}`;
    }
    return true;
}

export class Engine extends BaseEngine<CombatActions, Task> {

    constructor(tasks: Task[], options: EngineOptions<CombatActions, Task> = {}) {
        if (!options.combat_defaults) options.combat_defaults = new MyActionDefaults();
        super(tasks, options);
    }

    public override run(actions?: number): void {
        this.initPropetiesManagerOnRun();
        super.run(actions);
    }

    public override getNextTask(): Task | undefined {
        if (Counter.get("Spooky VHS Tape Monster") <= 0) {
            return {
                name: "Spooky VHS Time!",
                completed: () => Counter.get("Spooky VHS Tape Monster") <= 0,
                do: $location`Anemone Mine`,
                combat: new CombatStrategy().killBoss($monsters`time cop`),
                free: true,
                outfit: {
                    familiar: $familiar`Peace Turkey`,
                    equip: $items`cursed monkey's paw, spring shoes, Möbius ring, shark jumper, prismatic beret, scale-mail underwear, old SCUBA tank`
                },
                prepare: () => {
                    if (!have($effect`Jelly Combed`) && have($item`comb jelly`)) {
                        use($item`comb jelly`);
                    }
                }
            }
        }
        return super.getNextTask();
    }

    override createOutfit(task: Task): Outfit {
        print("Running createOutfit for task");
        print(task.name);
        print(task.do.toString());
        print("That was the task");
        let outfit = super.createOutfit(task);
        if (task.underwater || (task.do instanceof Location && task.do.environment === "underwater")) {
            print("Underwater location detected");
            print("outfit familiar:");
            print(outfit.familiar?.toString());
            if (!(outfit.haveEquipped($item`Mer-kin gladiator mask`)
                || outfit.haveEquipped($item`Mer-kin scholar mask`)
                || outfit.haveEquipped($item`crappy Mer-kin mask`)
                || outfit.haveEquipped($item`old SCUBA tank`))) {
                if (!outfit.equip($item`really, really nice swimming trunks`)) {
                    throw `Unable to breathe underwater for ${task.name}`;
                }
            }
            if (!outfit.familiar?.underwater) {
                print("Executing underwater familiar logic...");
                if (have($item`das boot`)) {
                    if (!outfit.equip($item`das boot`)) {
                        throw `Unable to breathe underwater for ${task.name}`;
                    }
                } else {
                    if (!outfit.equip($item`little bitty bathysphere`)) {
                        throw `Unable to breathe underwater for ${task.name}`;
                    }
                }
            }
        }
        return outfit;
    }

    override do(task: Task): void {
        super.do({
            ...task,
            do: () => {
                const peridotTarget = undelay(task.peridot);
                if (peridotTarget) {
                    this.propertyManager.setChoice(1557, `1&bandersnatch=${peridotTarget.id}`);
                }
                if (task.do instanceof Location) return task.do;
                return task.do();
            }
        })
    }

    override dress(task: Task, outfit: Outfit): void {
        if (have($effect`Beaten Up`)) {
            abort();
        }
        /*if (have($item`phosphor traces`) && mySpleenUse() < spleenLimit() - 3) {
            use($item`phosphor traces`);
        }*/
        if (have($item`Grandma's Chartreuse Yarn`)) {
            cliExecute("grandpa note");
        }
        if (have($item`whirled peas`, 2)) {
            create($item`handful of split pea soup`);
        }
        if (task.do instanceof Location) setLocation(task.do);
        outfit.dress();
        if (myHp() < 200 && myHp() < myMaxhp()) {
            restoreHp(myMaxhp());
        }
        if (myMp() < 200 && myMp() < myMaxmp()) {
            if (!(task.do instanceof Location && task.do === $location`Mer-kin Temple Left Door`)) {
                myRestoreMp();
            }
        }
        if (task.do instanceof Location && task.do === $location`Shadow Rift (The Misspelled Cemetary)`) {
            if (myHp() < myMaxhp() * 0.95) {
                restoreHp(myMaxhp());
            }
        }

        let modifier = outfit.modifier.join(",");
        if (modifier === "-combat") {
            const ncEffects = $effects`Smooth Movements, Chorale of Companionship, The Sonata of Sneakiness, Hiding From Seekers, Wild and Westy!, Ultra-Soft Steps`
            if (have($effect`Fat Leon's Phat Loot Lyric`)) {
                uneffect($effect`Fat Leon's Phat Loot Lyric`);
            }
            for (const ef of ncEffects) {
                const skill = toSkill(ef);
                if (haveSkill(skill)) {
                    if (skill !== $skill`None` && mpCost(skill) > myMp()) {
                        throw `Cannot cast required ${skill} due to insufficient MP`
                    }
                    if (!have(ef)) {
                        ensureEffect(ef);
                    }
                }
            }
        } else if (modifier === "item") {
            const itemSongs = $effects`Donho's Bubbly Ballad, Fat Leon's Phat Loot Lyric, The Ballad of Richie Thingfinder, Chorale of Companionship`
            if (have($effect`The Sonata of Sneakiness`)) {
                uneffect($effect`The Sonata of Sneakiness`);
            }
            if (have($effect`Ode to Booze`)) {
                uneffect($effect`Ode to Booze`);
            }
            for (const ef of itemSongs) {
                const skill = toSkill(ef);
                if (haveSkill(skill)) {
                    if (skill !== $skill`None` && mpCost(skill) > myMp()) {
                        throw `Cannot cast required ${skill} due to insufficient MP`
                    }
                    if (!have(ef)) {
                        ensureEffect(ef);
                    }
                }
            }
        } else if (modifier === "+combat") {
            const combatEffects = $effects`Crunchy Steps, Carlweather's Cantata of Confrontation, Musk of the Moose, Attracting Snakes, Bloodbathed, Towering Muscles`
            if (have($effect`The Sonata of Sneakiness`)) {
                uneffect($effect`The Sonata of Sneakiness`);
            }
            if (have($effect`Ode to Booze`)) {
                uneffect($effect`Ode to Booze`);
            }
            if (have($effect`Fat Leon's Phat Loot Lyric`)) {
                uneffect($effect`Fat Leon's Phat Loot Lyric`);
            }
            for (const ef of combatEffects) {
                const skill = toSkill(ef);
                if (skill !== $skill`None` && mpCost(skill) > myMp()) {
                    throw `Cannot cast required ${skill} due to insufficient MP`
                }
                if (!have(ef)) {
                    ensureEffect(ef);
                }
            }
        }

        if (task.do instanceof Location) {
            ensureResists(task.do);
        } else if (task.needresists) {
            let locationTest = task.do();
            if (locationTest instanceof Location) {
                ensureResists(locationTest);
            }
        }
    }


    override initPropertiesManager(manager: PropertiesManager): void {}

    initPropetiesManagerOnRun(): void {
        super.initPropertiesManager(this.propertyManager);
        this.propertyManager.set({
            choiceAdventureScript: "autosea_choice.js",
        });
    }

    print() {
        print(`Task List:`);
        for (const task of this.tasks) {
            print(`${task.name}: available:${this.available(task)}`);
        }
    }

}
