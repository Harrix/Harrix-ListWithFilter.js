import path from 'node:path';
import { fileURLToPath } from 'node:url';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const base = {
  entry: path.resolve(__dirname, 'src/ListWithFilter.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: false,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: 'harrix-list-with-filter.css' }),
  ],
};

const umdConfig = {
  ...base,
  name: 'umd',
  output: {
    ...base.output,
    filename: 'list-with-filter.umd.js',
    library: {
      name: 'ListWithFilter',
      type: 'umd',
    },
  },
  devServer: {
    static: { directory: __dirname },
    devMiddleware: { writeToDisk: true },
    port: 8080,
  },
};

const esmConfig = {
  ...base,
  name: 'esm',
  experiments: { outputModule: true },
  output: {
    ...base.output,
    filename: 'list-with-filter.es.js',
    library: { type: 'module' },
    module: true,
  },
};

export default [umdConfig, esmConfig];
