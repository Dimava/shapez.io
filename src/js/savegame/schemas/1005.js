import { createLogger } from "../../core/logging.js";
import { SavegameInterface_V1004 } from "./1004.js";

import { gMetaBuildingRegistry } from "../../core/global_registries";
import { gBuildingVariants, registerBuildingVariant } from "../../game/building_codes";

const schema = require("./1005.json");
const logger = createLogger("savegame_interface/1005");

export class SavegameInterface_V1005 extends SavegameInterface_V1004 {
    getVersion() {
        return 1005;
    }

    getSchemaUncached() {
        return schema;
    }

    /**
     * @param {import("../savegame_typedefs.js").SavegameData} data
     */
    static migrate1004to1005(data) {
        logger.log("Migrating 1004 to 1005");
        const dump = data.dump;
        if (!dump) {
            return true;
        }

        // just reset belt paths for now
        dump.beltPaths = [];

        const entities = dump.entities;

        // clear ejector slots
        for (let i = 0; i < entities.length; ++i) {
            const entity = entities[i];
            const itemEjector = entity.components.ItemEjector;
            if (itemEjector) {
                const slots = itemEjector.slots;
                for (let k = 0; k < slots.length; ++k) {
                    const slot = slots[k];
                    slot.item = null;
                    slot.progress = 0;
                }
            }
        }
    }

    static migrate1005BeforeGameEnter(data) {
        if (!data.dump.entities.find(e => e.components.Unremovable)) {
            return;
        }
        // data.dump.entities.filter(e=>e.components.Unremovable)
        //     .map(e => delete e.components.Unremovable)

        // data.dump.entities.filter(e=>e.components.ReplaceableMapEntity)
        //     .map(e => delete e.components.ReplaceableMapEntity)

        globalThis.dump = data.dump;
        data.dump._entities = data.dump.entities;
        data.dump.entities = [];
        data.dump.beltPaths = [];

        // data.dump.entities.filter(e=>e.components.EnergyConsumer)
        //     .map(e => delete e.components.EnergyConsumer)

        // data.dump.entities.filter(e=>e.components.EnergyGenerator)
        //     .map(e => delete e.components.EnergyGenerator)

         
        // debugger;
    }

    static migrate1005AfterGameEnter(data, root) {
        let es = [];
        for (let e of data.dump._entities) {
            if (e.components.StaticMapEntity.code) {
                let vrt = gBuildingVariants[e.components.StaticMapEntity.code]
                const entity = root.logic.tryPlaceBuilding({
                    origin: e.components.StaticMapEntity.origin,
                    rotation: e.components.StaticMapEntity.rotation,
                    rotationVariant: vrt.rotationVariant,
                    originalRotation: e.components.StaticMapEntity.originalRotation,
                    building: vrt.metaInstance,
                    variant: vrt.variant,
                });
                es.push({e, entity});
            }
        }
    }



}
