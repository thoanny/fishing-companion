const path = require('path');
const SpritesmithPlugin = require('webpack-spritesmith');

const spriteTemplate = function (data) {
    const shared = '@mixin sprite-icon { background-image: url(I); display: block; } .sprite-icon { @include sprite-icon; } '
        .replace('I', data.sprites[0].image);

    const perSprite = data.sprites.map(function (sprite) {
        return '@mixin icon-N { width: Wpx; height: Hpx; background-position: Xpx Ypx; } .icon-N { @include icon-N; } '
            .replace(/N/g, sprite.name)
            .replace('W', sprite.width)
            .replace('H', sprite.height)
            .replace('X', sprite.offset_x)
            .replace('Y', sprite.offset_y);
    }).join('\n');

    return shared + '\n' + perSprite;
};

module.exports = {
    entry: './src/js/script.js',
    output: {
        filename: 'script.min.js',
        path: path.resolve(__dirname, 'src'),
    },
    module: {
        rules: [
            {
                test: /\.s[ac]ss$/i,
                use: [
                    // Creates `style` nodes from JS strings
                    "style-loader",
                    // Translates CSS into CommonJS
                    "css-loader",
                    // Compiles Sass to CSS
                    "sass-loader",
                ],
            },
            // {test: /\.png$/, use: [
            //     'file-loader?name=i/[hash].[ext]'
            // ]}
        ],
    },
    resolve: {
        modules: ["node_modules", "spritesmith-generated"]
    },
    plugins: [
        new SpritesmithPlugin({
            src: {
                cwd: path.resolve(__dirname, 'src/img'),
                glob: '*.png'
            },
            target: {
                image: path.resolve(__dirname, 'src/sass/sprite.png'),
                css: [
                    [ path.resolve(__dirname, 'src/sass/_sprite.scss'), {format: 'function_based_template'} ]
                ]
            },
            apiOptions: {
                cssImageRef: "~sprite.png"
            },
            customTemplates: {
                'function_based_template': spriteTemplate,
            }
        })
    ]
};
