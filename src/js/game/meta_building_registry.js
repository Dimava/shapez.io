import { gMetaBuildingRegistry } from "../core/global_registries";
import { createLogger } from "../core/logging";
import { MetaToolbarSwapperBuilding } from "./buildings/toolbar_swapper"
import { MetaAdvancedProcessorBuilding } from "./buildings/advanced_processor";
import { MetaBeltBuilding } from "./buildings/belt";
import { MetaBeltBaseBuilding } from "./buildings/belt_base";
import { enumCutterVariants, MetaCutterBuilding } from "./buildings/cutter";
import { MetaEnergyGenerator } from "./buildings/energy_generator";
import { MetaHubBuilding } from "./buildings/hub";
import { enumMinerVariants, MetaMinerBuilding } from "./buildings/miner";
import { MetaMixerBuilding } from "./buildings/mixer";
import { enumPainterVariants, MetaPainterBuilding } from "./buildings/painter";
import { enumRotaterVariants, MetaRotaterBuilding } from "./buildings/rotater";
import { enumSplitterVariants, MetaSplitterBuilding } from "./buildings/splitter";
import { MetaStackerBuilding } from "./buildings/stacker";
import { enumTrashVariants, MetaTrashBuilding } from "./buildings/trash";
import { enumUndergroundBeltVariants, MetaUndergroundBeltBuilding } from "./buildings/underground_belt";
import { MetaWireBaseBuilding } from "./buildings/wire_base";
import { enumWireCrossingVariants, MetaWireCrossingsBuilding } from "./buildings/wire_crossings";
import { gBuildingVariants, registerBuildingVariant } from "./building_codes";
import { defaultBuildingVariant } from "./meta_building";
import { allCustomBuildingData } from "./custom/modBuildings";

const logger = createLogger("building_registry");

export function initMetaBuildingRegistry() {
    gMetaBuildingRegistry.register(MetaToolbarSwapperBuilding);
    gMetaBuildingRegistry.register(MetaSplitterBuilding);
    gMetaBuildingRegistry.register(MetaMinerBuilding);
    gMetaBuildingRegistry.register(MetaCutterBuilding);
    gMetaBuildingRegistry.register(MetaRotaterBuilding);
    gMetaBuildingRegistry.register(MetaStackerBuilding);
    gMetaBuildingRegistry.register(MetaMixerBuilding);
    gMetaBuildingRegistry.register(MetaPainterBuilding);
    gMetaBuildingRegistry.register(MetaTrashBuilding);
    gMetaBuildingRegistry.register(MetaBeltBuilding);
    gMetaBuildingRegistry.register(MetaUndergroundBeltBuilding);
    gMetaBuildingRegistry.register(MetaHubBuilding);
    gMetaBuildingRegistry.register(MetaEnergyGenerator);
    gMetaBuildingRegistry.register(MetaWireBaseBuilding);
    gMetaBuildingRegistry.register(MetaAdvancedProcessorBuilding);
    gMetaBuildingRegistry.register(MetaWireCrossingsBuilding);

    for (let custom of allCustomBuildingData) {
        if (custom.meta && !custom.meta._registered) {
            gMetaBuildingRegistry.register(custom.meta);
            custom.meta._registered = true;
        }
    }

    // Hub
    registerBuildingVariant(1, MetaHubBuilding);

    // Belt
    registerBuildingVariant(11, MetaBeltBaseBuilding, defaultBuildingVariant, 0);
    registerBuildingVariant(12, MetaBeltBaseBuilding, defaultBuildingVariant, 1);
    registerBuildingVariant(13, MetaBeltBaseBuilding, defaultBuildingVariant, 2);

    // Splitter
    registerBuildingVariant(21, MetaSplitterBuilding);
    registerBuildingVariant(22, MetaSplitterBuilding, enumSplitterVariants.compact);
    registerBuildingVariant(23, MetaSplitterBuilding, enumSplitterVariants.compactInverse);

    // Underground belt
    registerBuildingVariant(31, MetaUndergroundBeltBuilding, defaultBuildingVariant, 0);
    registerBuildingVariant(32, MetaUndergroundBeltBuilding, defaultBuildingVariant, 1);
    registerBuildingVariant(33, MetaUndergroundBeltBuilding, enumUndergroundBeltVariants.tier2, 0);
    registerBuildingVariant(34, MetaUndergroundBeltBuilding, enumUndergroundBeltVariants.tier2, 1);

    // Miner
    registerBuildingVariant(41, MetaMinerBuilding);
    registerBuildingVariant(42, MetaMinerBuilding, enumMinerVariants.chainable);

    // Cutter
    registerBuildingVariant(51, MetaCutterBuilding);
    registerBuildingVariant(52, MetaCutterBuilding, enumCutterVariants.quad);

    // Rotater
    registerBuildingVariant(61, MetaRotaterBuilding);
    registerBuildingVariant(62, MetaRotaterBuilding, enumRotaterVariants.ccw);
    registerBuildingVariant(63, MetaRotaterBuilding, enumRotaterVariants.fl);

    // Stacker
    registerBuildingVariant(71, MetaStackerBuilding);

    // Mixer
    registerBuildingVariant(81, MetaMixerBuilding);

    // Painter
    registerBuildingVariant(91, MetaPainterBuilding);
    registerBuildingVariant(92, MetaPainterBuilding, enumPainterVariants.mirrored);
    registerBuildingVariant(93, MetaPainterBuilding, enumPainterVariants.double);
    registerBuildingVariant(94, MetaPainterBuilding, enumPainterVariants.quad);

    // Trash
    registerBuildingVariant(101, MetaTrashBuilding);
    registerBuildingVariant(102, MetaTrashBuilding, enumTrashVariants.storage);

    // Energy generator
    registerBuildingVariant(111, MetaEnergyGenerator);
    // Advanced processor
    registerBuildingVariant(121, MetaAdvancedProcessorBuilding);

    // Wire
    registerBuildingVariant(16, MetaWireBaseBuilding, defaultBuildingVariant, 0);
    registerBuildingVariant(17, MetaWireBaseBuilding, defaultBuildingVariant, 1);
    registerBuildingVariant(18, MetaWireBaseBuilding, defaultBuildingVariant, 2);

    // Wire crossing
    registerBuildingVariant(26, MetaWireCrossingsBuilding);
    registerBuildingVariant(27, MetaWireCrossingsBuilding, enumWireCrossingVariants.merger);

    for (let custom of allCustomBuildingData) {
        if (custom.meta && custom.variantId) {
            registerBuildingVariant(
                custom.variantId,
                custom.meta,
                custom.variant || defaultBuildingVariant,
                custom.rotationVariant || 0
            );
        }
    }

    // Propagate instances
    for (const key in gBuildingVariants) {
        gBuildingVariants[key].metaInstance = gMetaBuildingRegistry.findByClass(
            gBuildingVariants[key].metaClass
        );
    }

    for (const key in gBuildingVariants) {
        const variant = gBuildingVariants[key];
        assert(variant.metaClass, "Variant has no meta: " + key);

        if (typeof variant.rotationVariant === "undefined") {
            variant.rotationVariant = 0;
        }
        if (typeof variant.variant === "undefined") {
            variant.variant = defaultBuildingVariant;
        }
    }

    logger.log("Registered", gMetaBuildingRegistry.getNumEntries(), "buildings");
    logger.log("Registered", Object.keys(gBuildingVariants).length, "building codes");
}

/**
 * Once all sprites are loaded, propagates the cache
 */
export function initBuildingCodesAfterResourcesLoaded() {
    logger.log("Propagating sprite cache");
    for (const key in gBuildingVariants) {
        const variant = gBuildingVariants[key];

        variant.sprite = variant.metaInstance.getSprite(variant.rotationVariant, variant.variant);
        variant.blueprintSprite = variant.metaInstance.getBlueprintSprite(
            variant.rotationVariant,
            variant.variant
        );
        variant.silhouetteColor = variant.metaInstance.getSilhouetteColor();
    }
}
