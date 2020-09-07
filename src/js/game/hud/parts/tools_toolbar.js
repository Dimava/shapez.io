import { MetaCutterBuilding } from "../../buildings/cutter";
import { HUDBaseToolbar } from "./base_toolbar";
import { MetaBeltBaseBuilding } from "../../buildings/belt_base";
import { MetaSplitterBuilding } from "../../buildings/splitter";
import { MetaUndergroundBeltBuilding } from "../../buildings/underground_belt";

import { MetaToolbarSwapperBuilding } from "../../buildings/toolbar_swapper";

export const supportedBuildings = [
    MetaToolbarSwapperBuilding,

    MetaBeltBaseBuilding,
    MetaSplitterBuilding,
    MetaUndergroundBeltBuilding,
];

export class HUDToolsToolbar extends HUDBaseToolbar {
    constructor(root) {
        super(root, {
            supportedBuildings,
            visibilityCondition: () =>
                !this.root.camera.getIsMapOverlayActive() &&
                this.root.currentLayer === "regular" &&
                this.root.currentToolbar === 1,
            htmlElementId: "ingame_HUD_buildings_toolbar",
        });
    }
}
