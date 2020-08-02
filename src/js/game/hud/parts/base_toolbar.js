import { gMetaBuildingRegistry } from "../../../core/global_registries";
import { Signal, STOP_PROPAGATION } from "../../../core/signal";
import { makeDiv } from "../../../core/utils";
import { KEYMAPPINGS } from "../../key_action_mapper";
import { MetaBuilding } from "../../meta_building";
import { GameRoot } from "../../root";
import { BaseHUDPart } from "../base_hud_part";
import { DynamicDomAttach } from "../dynamic_dom_attach";
import { globalConfig } from "../../../core/config";
import { MetaToolbarSwapperBuilding } from "../../buildings/toolbar_swapper";

export class HUDBaseToolbar extends BaseHUDPart {
    /**
     * @param {GameRoot} root
     * @param {object} param0
     * @param {Array<typeof MetaBuilding>} param0.supportedBuildings
     * @param {function} param0.visibilityCondition
     * @param {string} param0.htmlElementId
     */
    constructor(root, { supportedBuildings, visibilityCondition, htmlElementId }) {
        super(root);

        this.supportedBuildings = supportedBuildings;
        this.visibilityCondition = visibilityCondition;
        this.htmlElementId = htmlElementId;

        /** @type {Object.<string, {
         * metaBuilding: MetaBuilding,
         * unlocked: boolean,
         * selected: boolean,
         * element: HTMLElement,
         * index: number
         * }>} */
        this.buildingHandles = {};
    }

    /**
     * Should create all require elements
     * @param {HTMLElement} parent
     */
    createElements(parent) {
        this.element = makeDiv(parent, this.htmlElementId, ["ingame_buildingsToolbar"], "");
    }

    initialize() {
        const actionMapper = this.root.keyMapper;

        const items = makeDiv(this.element, null, ["buildings"]);

        for (let i = 0; i < this.supportedBuildings.length; ++i) {
            const metaBuilding = gMetaBuildingRegistry.findByClass(this.supportedBuildings[i]);
            const mapping = KEYMAPPINGS.buildings[metaBuilding.getId()];
            const binding = mapping && actionMapper.getBinding(mapping);

            const itemContainer = makeDiv(items, null, ["building"]);
            itemContainer.style.backgroundImage =
                "url(./res/ui/building_icons/" + metaBuilding.getId() + ".png)";
            itemContainer.setAttribute("data-icon", "building_icons/" + metaBuilding.getId() + ".png");

            if (binding) {
                binding.add(() => this.selectBuildingForPlacement(metaBuilding));
            } else {
                console.warn(`${metaBuilding.getId()} has no keybinding`);
            }

            this.trackClicks(itemContainer, () => this.selectBuildingForPlacement(metaBuilding), {
                clickSound: null,
            });

            this.buildingHandles[metaBuilding.id] = {
                metaBuilding,
                element: itemContainer,
                unlocked: false,
                selected: false,
                index: i,
            };
        }

        this.root.hud.signals.selectedPlacementBuildingChanged.add(
            this.onSelectedPlacementBuildingChanged,
            this
        );
        // Probably not the best location, but the one which makes most sense
        this.root.keyMapper.getBinding(KEYMAPPINGS.ingame.switchToolbar).add(this.switchToolbar, this);

        this.domAttach = new DynamicDomAttach(this.root, this.element, {
            timeToKeepSeconds: 0.12,
            attachClass: "visible",
        });
        this.lastSelectedIndex = 0;
        actionMapper.getBinding(KEYMAPPINGS.placement.cycleBuildings).add(this.cycleBuildings, this);
    }

    switchToolbar() {
        this.root.currentToolbar = (this.root.currentToolbar + 1) % 2;
    }

    /**
     * Updates the toolbar
     */
    update() {
        const visible = this.visibilityCondition();
        this.domAttach.update(visible);

        if (visible) {
            for (const buildingId in this.buildingHandles) {
                const handle = this.buildingHandles[buildingId];
                let newStatus = handle.metaBuilding.getIsUnlocked(this.root);
                if (G_IS_DEV && globalConfig.debug.allBuildingsUnlocked) {
                    newStatus = true;
                }
                if (handle.unlocked !== newStatus) {
                    handle.unlocked = newStatus;
                    handle.element.classList.toggle("unlocked", newStatus);
                }
            }
        }
    }

    /**
     * Cycles through all buildings
     */
    cycleBuildings() {
        const visible = this.visibilityCondition();
        if (!visible) {
            return;
        }

        let newBuildingFound = false;
        let newIndex = this.lastSelectedIndex;
        for (let i = 0; i < this.supportedBuildings.length; ++i, ++newIndex) {
            newIndex %= this.supportedBuildings.length;
            const metaBuilding = gMetaBuildingRegistry.findByClass(this.supportedBuildings[newIndex]);
            const handle = this.buildingHandles[metaBuilding.id];
            if (!handle.selected && handle.unlocked) {
                newBuildingFound = true;
                break;
            }
        }
        if (!newBuildingFound) {
            return;
        }
        const metaBuildingClass = this.supportedBuildings[newIndex];
        const metaBuilding = gMetaBuildingRegistry.findByClass(metaBuildingClass);
        this.selectBuildingForPlacement(metaBuilding);
    }

    /**
     * Called when the selected building got changed
     * @param {MetaBuilding} metaBuilding
     */
    onSelectedPlacementBuildingChanged(metaBuilding) {
        for (const buildingId in this.buildingHandles) {
            const handle = this.buildingHandles[buildingId];
            const newStatus = handle.metaBuilding === metaBuilding;
            if (handle.selected !== newStatus) {
                handle.selected = newStatus;
                handle.element.classList.toggle("selected", newStatus);
            }
            if (handle.selected) {
                this.lastSelectedIndex = handle.index;
            }
        }

        this.element.classList.toggle("buildingSelected", !!metaBuilding);
    }

    /**
     * @param {MetaBuilding} metaBuilding
     */
    selectBuildingForPlacement(metaBuilding) {
        if (!this.visibilityCondition()) {
            // Not active
            return;
        }

        if (!metaBuilding.getIsUnlocked(this.root)) {
            if (!G_IS_DEV || !globalConfig.debug.allBuildingsUnlocked) {
                this.root.soundProxy.playUiError();
                return STOP_PROPAGATION;
            }
        }

        // Allow clicking an item again to deselect it
        for (const buildingId in this.buildingHandles) {
            const handle = this.buildingHandles[buildingId];
            if (handle.selected && handle.metaBuilding === metaBuilding) {
                metaBuilding = null;
                break;
            }
        }

        if (metaBuilding && metaBuilding.id == "toolbar_swapper") {
            this.switchToolbar();
            metaBuilding = null;
        }

        this.root.soundProxy.playUiClick();
        this.root.hud.signals.buildingSelectedForPlacement.dispatch(metaBuilding);
        this.onSelectedPlacementBuildingChanged(metaBuilding);
    }
}
