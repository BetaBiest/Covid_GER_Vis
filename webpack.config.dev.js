const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    entry: {
        app: "./src/index.tsx",
    },
    resolve: {
        extensions: [".tsx", ".ts", ".scss", ".js"],
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                use: "ts-loader",
            },
            {
                test: /\.scss$/,
                use: ["style-loader", "css-loader", "sass-loader"],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index.html",
        }),
    ],
    devServer: {
        stats: "errors-only",
        overlay: true,
        open: true,
        contentBase: path.resolve(__dirname, "assets")
    },
};
