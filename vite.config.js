import { createLogger, defineConfig } from "vite";
import { globSync } from 'glob'
import path from 'path'
import fs from 'fs'

// Удаление лишних сообщений в терминале
const viteLogger = createLogger()
const loggerWarn = viteLogger.warn
const loggerInfo = viteLogger.info
viteLogger.info = (msg, options) => {
  if (msg.includes('../')) return
  if (msg.includes('TypeError')) return
  if (msg.includes('Re-optimizing')) return
  if (msg.includes('modules transformed.')) return
  if (msg.includes('building for production')) return
  if (msg.includes('built in')) {
    msg = msg.replace('✓ built in ', '')
    return logger('_BUILD_IN', msg)
  }
  //if (msg.includes('computing')) return
  //console.log(msg);
  loggerInfo(msg, options)
}
// Настройка сборки
import templateConfig from './template.config.js'
// Импортированные модули
import templateImports from './template_modules/template.imports.js'
// Генерация настроек для редактора
templateConfig.vscode.settings ? templateImports.vscodeSettings() : null
// Генерация сниппетов для редактора
templateConfig.vscode.snippets ? templateImports.addSnippets() : null
// Язык сообщений
const lang = JSON.parse(fs.readFileSync(`./template_modules/languages/${templateConfig.lang}.json`, 'UTF-8'))
// Формирование псевдонимов для Vite
const makeAliases = (aliases) => {
  return Object.entries(aliases).reduce((acc, [key, value]) => {
    value = !value.startsWith(`./`) ? `./${value}` : value
    acc[key] = path.resolve(process.cwd(), value)
    return acc
  }, {})
}
const aliases = makeAliases(templateConfig.aliases)

const isProduction = process.env.NODE_ENV === 'production'
const isInspect = process.argv.includes('--inspect')
const isWp = process.argv.includes('--wp')

const ignoredDirs = ['backend', 'src/files', 'node_modules', 'dist', '.git']
const ignoredFiles = ['package.json']

import Inspect from 'vite-plugin-inspect'
import { getDev } from './template_modules/main.js'

import logger from "./template_modules/logger.js";

export default defineConfig(({ command, mode, ssrBuild }) => {
  return {
    define: {
      flsLogging: isProduction && templateConfig.logger.console.removeonbuild ? false : templateConfig.logger.console.enable,
      flsLang: isProduction && templateConfig.logger.console.removeonbuild ? false : lang,
      aliases: aliases
    },
    resolve: {
      alias: {
        vue: 'vue/dist/vue.esm-bundler.js',
        ...aliases
      },
    },
    base: templateConfig.server.path,
    assetsInclude: ['src/components/**/*.html'],
    clearScreen: false,
    root: path.join(__dirname, "src"),
    customLogger: viteLogger,
    logLevel: "silent",
    publicDir: false,
    server: {
      open: isWp ? 'http://localhost:8080' : true,
      host: templateConfig.server.hostname,
      port: templateConfig.server.port,
      proxy: {
        '/php': {
          target: `http://${templateConfig.php.hostname}:${templateConfig.php.port}`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/php/, ''),
          secure: false,
          ws: true,
          rewriteWsOrigin: true,
        },
      },
      watch: {
        ignored: [
          ...ignoredDirs.map(dir => `**/${dir}/**`),
          ...ignoredFiles.map(file => `**/${file}/**`),
        ],
      }
    },
    plugins: [
      // Работа с HTML
      ...templateImports.htmlPlugins,
      // Работа со скриптами
      ...templateImports.scriptsPlugins,
      // Работа со шрифтами
      ...templateImports.fontPlugins,
      // Работа со стилями
      ...templateImports.stylesPlugins,
      // Работа с изображениями
      ...templateImports.imagePlugins,
      // Работа с PHP
      ...templateImports.phpPlugins,
      // Работа с архивом
      ...templateImports.zipPlugin,
      // Работа с FTP
      ...templateImports.ftpPlugin,
      // Обработка React
      ...(templateConfig.js.react ? [templateImports.react()] : []),
      // Обработка Vue
      ...(templateConfig.js.vue ? [templateImports.vue()] : []),
      // NovaPoshta
      ...(templateConfig.novaposhta.enable ? [templateImports.novaPoshta()] : []),
      // Генерация страницы проекта
      ...(isProduction && templateConfig.projectpage.enable ? [templateImports.projectPage()] : []),
      // Время для кофе
      ...(!isProduction && templateConfig.coffee.enable ? [templateImports.coffeeTime()] : []),
      // Добавление QR-кода в терминал
      templateImports.qrcode(),
      // Добавление версии файлов
      ...(isProduction && templateConfig.server.version ? [templateImports.addVersion((new Date()).getTime())] : []),
      // Копирование файлов
      ...(isProduction && templateConfig.server.copyfiles ? [templateImports.viteStaticCopy({
        targets: [
          {
            src: 'files',
            dest: './',
          },
        ],
        silent: true
      })] : []),
      // Обновление браузера
      {
        name: 'custom-hmr',
        enforce: 'post',
        handleHotUpdate({ file, server }) {
          if (file.endsWith('.html') || file.endsWith('.json') || file.endsWith('.php') || file.includes('fls-theme')) {
            server.ws.send({ type: 'full-reload', path: '*' })
          }
        },
      },
      getDev(),
      ...(isInspect ? [Inspect()] : [])
    ],
    css: {
      devSourcemap: true,
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ["mixed-decls"],
          additionalData: '@use "@styles/includes/index.scss" as *;',
          sourceMap: true,
          quietDeps: true,
          api: 'modern-compiler'
        },
      },
    },
    build: {
      outDir: isWp ? path.join(__dirname, "src/components/wordpress/fls-theme/assets/build") : path.join(__dirname, "dist"),
      emptyOutDir: true,
      manifest: false,
      minify: !templateConfig.js.devfiles,
      cssMinify: !templateConfig.styles.devfiles,
      cssCodeSplit: templateConfig.styles.codesplit,
      rollupOptions: {
        input: isWp ? ['src/components/wordpress/fls-theme/assets/app.js'] : globSync('./src/*.html'),
        plugins: [
          templateImports.rollupPlugins
        ],
        output: [{
          manualChunks(id) {
            if (templateConfig.js.bundle.enable) {
              return 'app'
            }
          },
          // Настройка ассетов
          assetFileNames: (asset) => {
            let getPath = asset.originalFileNames[0] && asset.names && asset.names.length > 0 ? asset.originalFileNames[0].replace(`/${asset.names[0]}`, '') : ''
            let extType = asset.names && asset.names.length > 0 ? asset.names[0].split('.').pop() : ''
            if (/css/.test(extType)) {
              return templateConfig.js.bundle.enable ? `css/app.min[extname]` : `css/[name].min[extname]`
            } else {
              if (/eot|otf|ttf|woff|woff2/.test(extType)) {
                extType = "assets/fonts";
              } else {
                extType = getPath
              }
              return `${extType}/[name][extname]`; //-[hash]
            }
          },
          entryFileNames(name) {
            return templateConfig.js.bundle.enable ? 'js/app.min.js' : `js/[name].min.js`
          },
          chunkFileNames(name) {
            return templateConfig.js.bundle.enable ? 'js/app.min.js' : `js/[name].min.js`
          }
        }],
      }
    }
  }
})
