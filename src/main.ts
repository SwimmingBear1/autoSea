import {get, set, sinceKolmafiaRevision} from "libram";
import {Args, step} from "grimoire-kolmafia";
import {Engine} from "./engine/engine";
import {getAllTasks} from "./tasks/all";
import {args} from "./args"


export function main(command?: string) {
    sinceKolmafiaRevision(28700);

    Args.fill(args, command);

    if (args.help) {
        Args.showHelp(args);
        return;
    }

    const engine = new Engine(getAllTasks());

    try {
        engine.run();
    } finally {
        engine.destruct();
    }

}
