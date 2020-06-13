// @ts-nocheck

const path = require("path");
const webpack = require("webpack");
const utils = require("./buildutils");
const lzString = require("lz-string");

const TerserPlugin = require("terser-webpack-plugin");
const StringReplacePlugin = require("string-replace-webpack-plugin");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const UnusedFilesPlugin = require("unused-files-webpack-plugin").UnusedFilesWebpackPlugin;
// const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");

module.exports = ({
    enableAssert = false,
    environment,
    es6 = false,
    standalone = false,
    isBrowser = true,
    mobileApp = false,
}) => {
    const globalDefs = {
        assert: enableAssert ? "window.assert" : "false && window.assert",
        assertAlways: "window.assert",
        abstract: "window.assert(false, 'abstract method called');",
        G_IS_DEV: "false",
        G_IS_PROD: "true",
        G_IS_RELEASE: environment === "prod" ? "true" : "false",
        G_IS_STANDALONE: standalone ? "true" : "false",
        G_IS_BROWSER: isBrowser ? "true" : "false",
        G_IS_MOBILE_APP: mobileApp ? "true" : "false",
        G_TRACKING_ENDPOINT: JSON.stringify(
            lzString.compressToEncodedURIComponent("https://tracking.shapez.io/v1")
        ),
        G_APP_ENVIRONMENT: JSON.stringify(environment),
        G_HAVE_ASSERT: enableAssert ? "true" : "false",
        G_BUILD_TIME: "" + new Date().getTime(),
        G_BUILD_COMMIT_HASH: JSON.stringify(utils.getRevision()),
        G_BUILD_VERSION: JSON.stringify(utils.getVersion()),
        G_ALL_UI_IMAGES: JSON.stringify(utils.getAllResourceImages()),
    };

    const minifyNames = environment === "prod";

    return {
        mode: "production",
        entry: {
            "bundle.js": [path.resolve(__dirname, "..", "src", "js", "main.js")],
        },
        node: {
            fs: "empty",
        },
        output: {
            filename: "bundle.js",
            path: path.resolve(__dirname, "..", "build"),
        },
        context: path.resolve(__dirname, ".."),
        stats: {
            // Examine all modules
            maxModules: Infinity,
            // Display bailout reasons
            optimizationBailout: true,
        },
        // devtool: "source-map",
        devtool: false,
        resolve: {
            alias: {
                "global-compression": path.resolve(__dirname, "..", "src", "js", "core", "lzstring.js"),
            },
        },
        optimization: {
            minimize: true,
            // namedModules: true,

            noEmitOnErrors: true,
            removeAvailableModules: true,
            removeEmptyChunks: true,
            mergeDuplicateChunks: true,
            flagIncludedChunks: true,
            occurrenceOrder: true,
            providedExports: true,
            usedExports: true,
            concatenateModules: true,
            sideEffects: true,

            minimizer: [
                new TerserPlugin({
                    parallel: true,
                    sourceMap: false,
                    cache: false,
                    terserOptions: {
                        ecma: es6 ? 6 : 5,
                        parse: {},
                        module: true,
                        toplevel: true,
                        keep_classnames: !minifyNames,
                        keep_fnames: !minifyNames,
                        keep_fargs: !minifyNames,
                        safari10: true,
                        compress: {
                            arguments: false, // breaks
                            drop_console: false,
                            global_defs: globalDefs,
                            keep_fargs: !minifyNames,
                            keep_infinity: true,
                            passes: 2,
                            module: true,
                            pure_funcs: [
                                "Math.round",
                                "Math.ceil",
                                "Math.floor",
                                "Math.sqrt",
                                "Math.hypot",
                                "Math.abs",
                                "Math.max",
                                "Math.min",
                                "Math.sin",
                                "Math.cos",
                                "Math.tan",
                                "Math.sign",
                                "Math.pow",
                                "Math.atan2",

                                "Math_round",
                                "Math_ceil",
                                "Math_floor",
                                "Math_sqrt",
                                "Math_hypot",
                                "Math_abs",
                                "Math_max",
                                "Math_min",
                                "Math_sin",
                                "Math_cos",
                                "Math_tan",
                                "Math_sign",
                                "Math_pow",
                                "Math_atan2",
                            ],
                            toplevel: true,
                            unsafe_math: true,
                            unsafe_arrows: false,
                            warnings: true,
                        },
                        mangle: {
                            eval: true,
                            keep_classnames: !minifyNames,
                            keep_fnames: !minifyNames,
                            module: true,
                            toplevel: true,
                            safari10: true,
                        },
                        output: {
                            comments: false,
                            ascii_only: true,
                            beautify: false,
                            braces: false,
                            ecma: es6 ? 6 : 5,
                            preamble:
                                "/* shapez.io Codebase - Copyright 2020 Tobias Springer - " +
                                utils.getVersion() +
                                " @ " +
                                utils.getRevision() +
                                " */",
                        },
                    },
                }),
            ],
        },
        performance: {
            maxEntrypointSize: 5120000,
            maxAssetSize: 5120000,
        },
        plugins: [
            new webpack.DefinePlugin(globalDefs),

            new UnusedFilesPlugin({
                failOnUnused: false,
                cwd: path.join(__dirname, "..", "src", "js"),
                patterns: ["../src/js/**/*.js"],
            }),

            // new webpack.SourceMapDevToolPlugin({
            //     filename: "[name].map",
            //     publicPath: "/v/" + utils.getRevision() + "/",
            // }),
            // new ReplaceCompressBlocks()
            // new webpack.optimize.ModuleConcatenationPlugin()
            // new WebpackDeepScopeAnalysisPlugin()
            // new BundleAnalyzerPlugin()
        ],
        module: {
            rules: [
                {
                    test: /\.json$/,
                    enforce: "pre",
                    use: ["./gulp/loader.compressjson"],
                    type: "javascript/auto",
                },
                { test: /\.(png|jpe?g|svg)$/, loader: "ignore-loader" },
                {
                    test: /\.js$/,
                    enforce: "pre",
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: "webpack-strip-block",
                            options: {
                                start: "typehints:start",
                                end: "typehints:end",
                            },
                        },
                        {
                            loader: "webpack-strip-block",
                            options: {
                                start: "dev:start",
                                end: "dev:end",
                            },
                        },
                    ],
                },
                {
                    test: /\.js$/,
                    use: [
                        // "thread-loader",
                        {
                            loader: "babel-loader?cacheDirectory",
                            options: {
                                configFile: require.resolve(
                                    es6 ? "./babel-es6.config.js" : "./babel.config.js"
                                ),
                            },
                        },
                        "uglify-template-string-loader", // Finally found this plugin
                        StringReplacePlugin.replace({
                            replacements: [
                                { pattern: /globalConfig\.tileSize/g, replacement: () => "32" },
                                { pattern: /globalConfig\.halfTileSize/g, replacement: () => "16" },
                                {
                                    pattern: /globalConfig\.beltSpeedItemsPerSecond/g,
                                    replacement: () => "2.0",
                                },
                                { pattern: /globalConfig\.itemSpacingOnBelts/g, replacement: () => "0.63" },
                                { pattern: /globalConfig\.debug/g, replacement: () => "''" },
                            ],
                        }),
                    ],
                },
                {
                    test: /\.worker\.js$/,
                    use: [
                        {
                            loader: "worker-loader",
                            options: {
                                fallback: false,
                                inline: true,
                            },
                        },
                        {
                            loader: "babel-loader?cacheDirectory",
                            options: {
                                configFile: require.resolve(
                                    es6 ? "./babel-es6.config.js" : "./babel.config.js"
                                ),
                            },
                        },
                    ],
                },
                {
                    test: /\.md$/,
                    use: ["html-loader", "markdown-loader"],
                },
                {
                    test: /\.ya?ml$/,
                    type: "json", // Required by Webpack v4
                    use: "yaml-loader",
                },
            ],
        },
    };
};
