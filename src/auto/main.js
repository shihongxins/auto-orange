/* eslint-disable */
'ui';
function initUI(href) {
  ui.layout('<webview id="webview" h="*" w="*" />');
  let SDK = require("AutojsWebviewJSBridge.js");
  let local = !(/^http(s):\/\//i.test(href));
  SDK.initWebviewProxy(ui.webview, { showLog: true, local: Boolean(href && local) });
  setTimeout(() => {
    if (href) {
      if (local) {
        let htmlPath = files.path(href);
        if (htmlPath && files.exists(htmlPath)) {
          let htmlContent = files.read(htmlPath);
          ui.webview.loadDataWithBaseURL("http://127.0.0.1:8080", htmlContent, 'text/html', 'UTF-8', 'http://127.0.0.1:8080')
        }
        return;
      } else {
        ui.webview.loadUrl(href);
      }
    }
  }, 500);
  return ui.webview;
}

initUI("./index.html");
// initUI("https://www.baidu.com");

let threadPool = {};

if (!threadPool.back) {
  threadPool.back = threads.start(
    function () {
      let _t, _i;
      ui.emitter.on("back_pressed", function (ev) {
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
