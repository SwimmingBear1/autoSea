import {Args} from "grimoire-kolmafia";

export const args = Args.create(
    "autosea",
    "This is a script to complete 11037 Leagues Under the Sea runs",
    {
        pvp: Args.flag({
            help: "Break your hippy stone at the start of the run.",
            default: true
        })
    }
)


