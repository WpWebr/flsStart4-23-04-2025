import path from 'path';
const projectName = path.basename(path.resolve()).toLowerCase()

export default {
  lang: 'ua', // язык сообщений
  vscode: { // настройка редактора (не меняет настройки по умолчанию - только для этой сборки)
    settings: true,
    snippets: true
  },
  navpanel: { // навигация по страницам
    dev: true,
    build: false,
    position: 'left',
    color: '#ffffff',
    background: 'rgba(51, 51, 51, 0.5)',
    transition: '300'
  },
  server: { // сервер
    path: './', // путь
    copyfiles: true, // сопии файлов с files
    version: true, // версия файлов
    hostname: 'localhost',
    port: '1111'
  },
  html: {
    beautify: { // форматирование
      enable: true,
      indent: "tab"
    }
  },
  styles: {
    tailwindcss: false, // вкл.tailwind(стандартный reset отключается)
    pxtorem: true, // перевод пикселей (px) в rem при сборке
    critical: false, // в проде стили видимой части экрана доюавляются в html
    codesplit: true, // розбивание файлов по страницам ( https://vite.dev/ )
    devfiles: true, // + не сжатые файлы
  },
  fonts: { // шрифт
    iconsfont: false, // создание иконочного шрифта (src\assets\svgicons)
    download: false // загрузка шрифтов в локальную папку при проде
  },
  images: {
    svgsprite: true, // создание спрайта
    optimize: { // оптимизация изображений
      enable: true, // вкл
      edithtml: true,
      sizes: [600, 1200], // размеры изображений которые нужно создать
      dpi: [], // множитель для Retina (x2,x3 - [2,3])
      attrignore: 'data-fls-image-ignore', // еси добавлен атрибут, оптимизации нет
      modernformat: {
        enable: true, // использовать webp/avif
        type: 'webp', // webp/avif
        only: true, // удаление исходника
        quality: 80 // качество изображения
      },
      jpeg: { // если modernformat.enable.false
        quality: 80
      },
      png: { // если modernformat.enable.false
        quality: 80
      }
    }
  },
  js: {
    hotmodules: true, // вкл. компонентов. Напр.: снипет tab и автоматом подключает js,css (src\components\layout\tabs)
    devfiles: true, // копии не сжатых js-файлов
    bundle: {
      // Собирает в один JS и один CSS файлы
      // независимо от настройки
      // styles -> codesplit,
      enable: false,
    },
    react: false, // подкл. React
    vue: false // подкл. Vue
  },
  php: { // локальный сервер PHP
    enable: false,
    base: "./src/php/",
    hostname: 'localhost',
    port: '1110',
    binary: 'C:\\php\\php.exe', // путь к php
    ini: 'template_modules/assets/php.ini',
  },
  pug: { // src\pug
    enable: false,
  },
  ftp: { // прод на сервер
    host: '127.0.0.1',
    port: 21,
    remoteDir: `/www/.../${projectName}`, // projectName -имя проекта
    user: 'root',
    password: '123456',
  },
  logger: {
    // Логи работы сборки в терминале
    terminal: true,
    // Логи работы модулей в консоли
    console: {
      enable: true,
      removeonbuild: true // удаляется в прод
    }
  },
  projectpage: { // Шаблог страницы проэкта
    enable: false,
    projectname: '',
    template: "src/components/templates/projectpage/projectpage.html",
    outfilename: '',
  },
  aliases: {
    // HTML/SCSS/JS components
    '@components': 'src/components',
    // Scripts
    '@js': 'src/js',
    // Styles
    '@styles': 'src/styles',
    // Media & files
    '@fonts': 'src/assets/fonts',
    '@img': 'src/assets/img',
    '@video': 'src/assets/video',
    '@files': 'src/files',
    // Other
    '@pug': 'src/pug'
  },
  coffee: {
    enable: true,
    text: `(!!)Хватит работать, сделай перерыв ☕️`,
    interval: 45
  },
  novaposhta: { // Новая почта
    enable: false,
    key: ''
  }
}
