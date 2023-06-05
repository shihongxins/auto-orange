/* eslint-disable */
"ui";

global.SDKInstance = null;

// 本地开发
// initUI("http://192.168.1.46:5173/");

// 部署远程
// initUI("https://auto-orange.shihongxins.surge.sh");

// 部署本地
global.localOrigin = "http://127.0.0.1:8080";
initUI("./index.html", global.localOrigin);

/**
 * @see https://www.jianshu.com/p/6e69332cf946
 * @see https://www.apiref.com/android-zh/android/webkit/WebView.html#loadDataWithBaseURL
 * @see https://www.apiref.com/android-zh/android/text/Html.html
 * @param {string} href
 * @param {string} localOrigin
 * @returns
 */
function initUI(href, localOrigin) {
  ui.layout('<webview id="webview" h="*" w="*" />');
  let SDK = require(files.path("./modules/AutoXjsWebviewJSBridge"));
  let local = !/^http(s):\/\//i.test(href);
  global.SDKInstance = SDK.initWebviewProxy(ui.webview, {
    debug: false,
    showLog: false,
    OmitSSLError: true,
    MixedContentMode: 0,
    local: Boolean(href && local),
    localOrigin,
  });
  global.SDKInstance.sdkemitter.on("ready", () => {
    if (href) {
      if (local && /\.(xml|html?s?)$/i.test(href)) {
        let htmlPath = files.path(href);
        if (htmlPath && files.exists(htmlPath)) {
          let htmlContent = files.read(htmlPath);
          if (!localOrigin) {
            localOrigin = "http://127.0.0.1:8080";
          }
          ui.webview.loadDataWithBaseURL(localOrigin, htmlContent, "text/html", "UTF-8", localOrigin);
        }
      } else {
        ui.webview.loadUrl(href);
      }
    }
  });
  return ui.webview;
}

// 其他全局函数
require("./globalFun");

global.threadPool = {};

if (!global.threadPool.back) {
  threadPool.back = threads.start(function () {
    let _t = 0,
      _i = 0;
    ui.emitter.on("back_pressed", function (ev) {
      if (ui && ui.webview) {
        let url = ui.webview.getUrl();
        // 本地 html 模式，无法通过 webview.goBack() 返回，交由页面调用
        if (url.indexOf(localOrigin) === 0) {
          toastLog("无法响应返回/退出，请于应用内操作");
          ev.consumed = true;
          return;
        }
        if (ui.webview.canGoBack()) {
          ui.webview.goBack();
          ev.consumed = true;
          return;
        }

        toast("连按两次返回键退出");
        _t && clearTimeout(_t);
        _t = setTimeout(() => {
          _i = 0;
        }, 500);

        if (++_i > 1) {
          threads.shutDownAll();
          exit();
        }
        ev.consumed = true;
      }
    });
  });
}
