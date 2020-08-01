import { MetaCutterBuilding } from "../../buildings/cutter";
import { MetaEnergyGenerator } from "../../buildings/energy_generator";
import { enumLayer } from "../../root";
import { HUDBaseToolbar } from "./base_toolbar";
import { MetaAdvancedProcessorBuilding } from "../../buildings/advanced_processor";
import { MetaToolbarSwapperBuilding } from "../../buildings/toolbar_swapper";

export const supportedBuildings = [
    MetaToolbarSwapperBuilding,
    
    MetaEnergyGenerator,
    MetaAdvancedProcessorBuilding,
];

export class HUDToolsToolbar extends HUDBaseToolbar {
    constructor(root) {
        super(root, {
            supportedBuildings,
            visibilityCondition: () =>
                !this.root.camera.getIsMapOverlayActive() &&
                this.root.currentLayer === enumLayer.regular &&
                this.root.currentToolbar === 1,
            htmlElementId: "ingame_HUD_buildings_toolbar",
        });
    }
}
