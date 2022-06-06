import path from "path";
import SimpleProgressWebpackPlugin from "simple-progress-webpack-plugin";
import * as webpack from "webpack";

export default (_env: unknown, { mode = "production" }: webpack.WebpackOptionsNormalized): webpack.Configuration => {
    return {
        mode,
        target: "node",
        entry: path.join(__dirname, "../src/cli.ts"),
        module: {
            rules: [
                {
                    test: /\.js$/,
                    resolve: {
                        fullySpecified: false,
                    },
                },
                {
                    test: /\.ts$/,
                    loader: "ts-loader",
                    options: {
                        projectReferences: true,
                    },
                    exclude: /node_modules/,
                },
                // https://github.com/dsherret/ts-morph/issues/171#issuecomment-1107867732
                {
                    test: /node_modules[\\|/]code-block-writer[\\|/]umd[\\|/]/,
                    use: { loader: "umd-compat-loader" },
                },
            ],
            // https://github.com/dsherret/ts-morph/issues/171#issuecomment-1107867732
            noParse: [require.resolve("@ts-morph/common/dist/typescript.js")],
            parser: {
                javascript: {
                    // this is needed for dynamically loading helpers
                    commonjsMagicComments: true,
                },
            },
        },
        resolve: {
            extensions: [".ts", ".js"],
        },
        output: {
            path: __dirname,
            filename: "bundle.js",
        },
        plugins: [new SimpleProgressWebpackPlugin({})],
        optimization: {
            minimize: false,
        },
    };
};