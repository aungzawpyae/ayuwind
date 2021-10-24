const { src, dest, series, watch, parallel } = require("gulp");
const del = require("del");
const njk = require("gulp-nunjucks-render");
const postcss = require("gulp-postcss");
const browserSync = require("browser-sync").create();

function serve(cb) {
  browserSync.init({
    server: {
      baseDir: "./dist",
    },
    startPath: "index.html",
    port: 9999,
  });

  cb();
}

function reload() {
  browserSync.reload();
}

function cleanDistTask() {
  return del(["dist"]);
}

var manageEnvironment = function (environment) {
  environment.addFilter("is_active", function (str, reg, page) {
    reg = new RegExp(reg, "gm");
    reg = reg.exec(page);
    if (reg != null) {
      return str;
    }
  });
};

function buildHtmlTask() {
  return src("./src/views/*.*")
    .pipe(
      njk({
        path: ["./src/views/"],
        ext: ".html",
        manageEnv: manageEnvironment,
      })
    )
    .pipe(dest("dist"));
}

function buildPageTask() {
  return src("./src/views/pages/*.*")
    .pipe(
      njk({
        path: ["./src/views"],
      })
    )
    .pipe(dest("dist/pages"));
}

function buildCssTask() {
  return src(`./src/assets/css/*.css`)
    .pipe(postcss())
    .pipe(dest("./dist/assets/css"));
}

function buildJavascriptTask() {
  return src([`./src/assets/js/*.js`]).pipe(dest("./dist/assets/js"));
}

function buildImageTask() {
  return src(`./src/assets/img/*`).pipe(dest("./dist/assets/images"));
}

function watchFiles() {
  watch(`./src/views`, buildHtmlTask).on("change", reload);
  watch(`./src/views/pages`, buildPageTask).on("change", reload);

  watch(["./tailwind.config.js", `./src/assets/css/*.css`], buildCssTask).on(
    "change",
    reload
  );
  watch(`./src/assets/js/**/*.js`, buildJavascriptTask).on("change", reload);
  watch(`./src/assets/images/**/*`, buildImageTask).on("chnage", reload);
}

exports.default = series(
  cleanDistTask,
  parallel(
    buildCssTask,
    buildJavascriptTask,
    buildImageTask,
    buildHtmlTask,
    buildPageTask
  ),
  serve,
  watchFiles
);

exports.build = series(
  cleanDistTask,
  parallel(
    buildCssTask,
    buildJavascriptTask,
    buildImageTask,
    buildHtmlTask,
    buildPageTask
  ),
);
