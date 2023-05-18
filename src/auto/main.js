/* eslint-disable */
'ui';

initUI("./index.html");
// initUI("https://www.baidu.com");

/**
 * @see https://www.jianshu.com/p/6e69332cf946
 * @see https://www.apiref.com/android-zh/android/webkit/WebView.html#loadDataWithBaseURL
 * @see https://www.apiref.com/android-zh/android/text/Html.html
 * @param {string} href
 * @returns
 */
function initUI(href) {
  ui.layout('<webview id="webview" h="*" w="*" />');
  let SDK = require(files.path("./modules/AutoXjsWebviewJSBridge"));
  let local = !(/^http(s):\/\//i.test(href));
  let SDKInstance = SDK.initWebviewProxy(ui.webview, { debug: true, showLog: true, local: Boolean(href && local) });
  SDKInstance.sdkemitter.on("ready", () => {
    if (href) {
      if (local && /\.(xml|html?s?)$/i.test(href)) {
        let htmlPath = files.path(href);
        if (htmlPath && files.exists(htmlPath)) {
          let htmlContent = files.read(htmlPath);
          ui.webview.loadDataWithBaseURL("http://127.0.0.1:8080", htmlContent, 'text/html', 'UTF-8', 'http://127.0.0.1:8080')
        }
      } else {
        ui.webview.loadUrl(href);
      }
    }
  });
  return ui.webview;
}

let threadPool = {};

if (!threadPool.back) {
  threadPool.back = threads.start(
    function () {
      let _t, _i;
      ui.emitter.on("back_pressed", function (ev) {
        console.log("back_pressed");
        if (ui && ui.webview) {
          if (ui.webview.canGoBack()) {
            ui.webview.goBack();
            ev.consumed = true;
            return;
          }
          if (++_i > 1) {
            threads.shutDownAll();
            ev.consumed = false;
            exit();
          }
          _t && clearTimeout(_t);
          _t = setTimeout(() => {
            toast("连按两次返回键退出");
            _i = 0;
          }, 500);
          ev.consumed = true;
        }
      });
    }
  )
}

function uninstallApp() {
  let AppPackageName = "";
  const projectJson = files.exists("./project.json") && files.read("./project.json");
  if (projectJson) {
    let project;
    try {
      project = JSON.parse(projectJson);
      AppPackageName = project.packageName || "";
    } catch (error) {}
  }
  if (AppPackageName) {
    app.uninstall(AppPackageName);
  } else {
    toastLog("未找到软件包名，请手动卸载");
  }
}
