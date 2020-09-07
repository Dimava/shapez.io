export default {
    // You can set any debug options here!
    /* dev:start */
    // -----------------------------------------------------------------------------------
    _fastGameEnter:
        "Quickly enters the game and skips the main menu - good for fast iterating",
    fastGameEnter: true,
    // -----------------------------------------------------------------------------------
    _noArtificialDelays:
        "Skips any delays like transitions between states and such",
    noArtificialDelays: true,
    // -----------------------------------------------------------------------------------
    _disableSavegameWrite:
        "Disables writing of savegames, useful for testing the same savegame over and over",
    disableSavegameWrite: true,
    // -----------------------------------------------------------------------------------
    _showEntityBounds:
        "Shows bounds of all entities",
    showEntityBounds: true,
    // -----------------------------------------------------------------------------------
    _showAcceptorEjectors:
        "Shows arrows for every ejector / acceptor",
    showAcceptorEjectors: true,
    // -----------------------------------------------------------------------------------
    _disableMusic:
        "Disables the music (Overrides any setting, can cause weird behaviour)",
    disableMusic: true,
    // -----------------------------------------------------------------------------------
    _doNotRenderStatics:
        "Do not render static map entities (=most buildings)",
    doNotRenderStatics: true,
    // -----------------------------------------------------------------------------------
    _disableZoomLimits:
        "Allow to zoom freely without limits",
    disableZoomLimits: true,
    // -----------------------------------------------------------------------------------
    _showChunkBorders:
        "Shows a border arround every chunk",
    showChunkBorders: true,
    // -----------------------------------------------------------------------------------
    _rewardsInstant:
        "All rewards can be unlocked by passing just 1 of any shape",
    rewardsInstant: true,
    // -----------------------------------------------------------------------------------
    _allBuildingsUnlocked:
        "Unlocks all buildings",
    allBuildingsUnlocked: true,
    // -----------------------------------------------------------------------------------
    _blueprintsNoCost:
        "Disables cost of blueprints",
    blueprintsNoCost: true,
    // -----------------------------------------------------------------------------------
    _upgradesNoCost:
        "Disables cost of upgrades",
    upgradesNoCost: true,
    // -----------------------------------------------------------------------------------
    _disableUnlockDialog:
        "Disables the dialog when completing a level",
    disableUnlockDialog: true,
    // -----------------------------------------------------------------------------------
    _disableLogicTicks:
        "Disables the simulation - This effectively pauses the game.",
    disableLogicTicks: true,
    // -----------------------------------------------------------------------------------
    _testClipping:
        "Test the rendering if everything is clipped out properly",
    testClipping: true,
    // -----------------------------------------------------------------------------------
    // _framePausesBetweenTicks:
    //     "Allows to render slower, useful for recording at half speed to avoid stuttering",
    // framePausesBetweenTicks: 250,
    // -----------------------------------------------------------------------------------
    _testTranslations:
        "Replace all translations with emojis to see which texts are translateable",
    testTranslations: true,
    // -----------------------------------------------------------------------------------
    _enableEntityInspector:
        "Enables an inspector which shows information about the entity below the curosr",
    enableEntityInspector: true,
    // -----------------------------------------------------------------------------------
    _testAds:
        "Enables ads in the local build (normally they are deactivated there)",
    testAds: true,
    // -----------------------------------------------------------------------------------
    _disableMapOverview:
        "Disables the automatic switch to an overview when zooming out",
    disableMapOverview: true,
    // -----------------------------------------------------------------------------------
    _disableUpgradeNotification:
        "Disables the notification when there are new entries in the changelog since last played",
    disableUpgradeNotification: true,
    // -----------------------------------------------------------------------------------
    _instantBelts:
        "Makes belts almost infinitely fast",
    instantBelts: true,
    // -----------------------------------------------------------------------------------
    _instantProcessors:
        "Makes item processors almost infinitely fast",
    instantProcessors: true,
    // -----------------------------------------------------------------------------------
    _instantMiners:
        "Makes miners almost infinitely fast",
    instantMiners: true,
    // -----------------------------------------------------------------------------------
    _resumeGameOnFastEnter:
        "When using fastGameEnter, controls whether a new game is started or the last one is resumed",
    resumeGameOnFastEnter: true,
    // -----------------------------------------------------------------------------------
    _renderForTrailer:
        "Special option used to render the trailer",
    renderForTrailer: true,
    // -----------------------------------------------------------------------------------
    _renderChanges:
        "Whether to render changes",
    renderChanges: true,
    // -----------------------------------------------------------------------------------
    _renderBeltPaths:
        "Whether to render belt paths",
    renderBeltPaths: true,
    // -----------------------------------------------------------------------------------
    _checkBeltPaths:
        "Whether to check belt paths",
    checkBeltPaths: true,
    // -----------------------------------------------------------------------------------
    _detailedStatistics:
        "Whether to items / s instead of items / m in stats",
    detailedStatistics: true,
    // -----------------------------------------------------------------------------------
    _showAtlasInfo:
        "Shows detailed information about which atlas is used",
    showAtlasInfo: true,
    // -----------------------------------------------------------------------------------
    _renderWireRotations:
        "Renders the rotation of all wires",
    renderWireRotations: true,
    // -----------------------------------------------------------------------------------
    _renderWireNetworkInfos:
        "Renders information about wire networks",
    renderWireNetworkInfos: true,
    // -----------------------------------------------------------------------------------
    _disableEjectorProcessing:
        "Disables ejector animations and processing",
    disableEjectorProcessing: true,
    // -----------------------------------------------------------------------------------
    _manualTickOnly:
        "Allows manual ticking",
    manualTickOnly: true,
    // -----------------------------------------------------------------------------------
    /* dev:end */
};
