/* eslint-disable */
function initWebviewProxy(webview, options) {
  if (!webview) {
    throw new Error("webview is required");
  }
  options = Object.assign({
    showLog: false,
    logFun: console.log,
    protocol: "AutojsWebviewJSBridge://",
    injectModuleName: "_autojs_",
    local: false,
  }, options || {});

  function innerLog() {
    if (options && options.showLog && typeof options.logFun === "function") {
      options.logFun.apply(null, arguments);
    }
  }
  innerLog("⚙初始化 " + JSON.stringify(options));

  function proxyHandler(command, args) {
    if (!(command && typeof command === "string")) {
      throw new Error("❗: command is unvalid, it's must be a string.");
    }
    let result;
    if ("_evaluate_" === args) {
      result = eval(command);
    } else {
      /**
       * @type {Function} fun
       */
      let fun = (this && this[command]) || (global && global[command]);
      if (!fun) {
        throw new Error("Unkown Command: " + command + " . Ensure it defineded.");
      }
      result = fun.apply(this || global, [].concat(args));
    }
    return result;
  }

  function reflectHandler(script, callback) {
    try {
      if (!(script && typeof script === "string")) {
        throw new Error("❗: script is unvalid, it's must be a string.");
      }
      webview.evaluateJavascript(
        "javascript:" + script,
        new JavaAdapter(android.webkit.ValueCallback, {
          /**
           * @param {string} value 
           */
          onReceiveValue: (value) => {
            callback && callback(value);
          },
        })
      );
    } catch (error) {
      console.error("evaluate javascript error:" + String(script));
      console.trace(error);
    }
  }

  function injectHandler() {
    innerLog("📲注入中...");
    reflectHandler(
      `
      ; (function (scope, factory, moduleName) {
        scope[moduleName || factory.name] = factory();
        return typeof scope[moduleName || factory.name] === "undefined";
      })(
        this || globalThis || window,
        function () {
          function AutoJS() {
            if (AutoJS._singleton_ || window["${options.injectModuleName}"]) {
              return AutoJS._singleton_ || window["${options.injectModuleName}"];
            }
            this._callbackStore_ = {};
            this._callbackIndex_ = 0;
          }
          AutoJS.prototype._setCallback_ = function (callback) {
            this._callbackStore_[++this._callbackIndex_] = callback;
            return this._callbackIndex_;
          }
          AutoJS.prototype._getCallback_ = function (callbackIndex) {
            let callback = this._callbackStore_[callbackIndex];
            if (callback) {
              delete this._callbackStore_[callbackIndex];
            }
            return callback;
          }
          AutoJS.prototype.invoke = function (command, args, callback) {
            if (!(command && typeof command === "string")) {
              throw new Error("The 'command' must be a string");
            }
            let callbackIndex = this._setCallback_(callback);
            try {
              console.log("${options.protocol}" + encodeURIComponent(JSON.stringify({
                command: command,
                args: args,
                callbackIndex: callbackIndex,
              })))
            } catch (error) {
              delete this._callbackStore_[callbackIndex];
              console.error("invoke error:", error);
              console.trace(error);
            }
          }
          AutoJS.prototype.evaluate = function (command, callback) {
            this.invoke(command, "_evaluate_", callback);
          }
          AutoJS.prototype.callback = function (data) {
            if (data && data.callbackIndex) {
              let callback = this._getCallback_(data.callbackIndex);
              if (typeof callback === "function") {
                callback(data.args);
              }
            }
          }
          AutoJS._singleton_ = new AutoJS();
          return AutoJS._singleton_;
        },
        "${options.injectModuleName}"
      );
      `,
      function (injectResult) {
        if (typeof injectResult === "string") {
          try { injectResult = true } catch (error) { injectResult = false; };
        }
        if (injectResult) {
          innerLog("📱注入成功✅");
          if (options && options.showLog) {
            reflectHandler(
              `
                window[\"${options.injectModuleName}\"].evaluate(\'toastLog(\"🔗通讯链接成功\")\');
              `
            );
          }
        } else {
          innerLog("📱注入失败❌");
        }
      }
    )
  }


  let webviewSettings = webview.getSettings();
  //使webview控件支持JavaScript
  webviewSettings.setJavaScriptEnabled(true);
  if (options.local) {
    //表示允许加载本地的文件
    webviewSettings.setAllowFileAccess(true);
    //设置是否允许通过 file url 加载的 Js代码读取其他的本地文件
    webviewSettings.setAllowFileAccessFromFileURLs(true);
    //设置是否允许通过 file url 加载的 Javascript 可以访问其他的源(包括http、https等源)
    webviewSettings.setAllowUniversalAccessFromFileURLs(true);
  }


  webview.webViewClient = new JavaAdapter(android.webkit.WebViewClient, {
    /**
     * @see https://www.jianshu.com/p/7a237e7f055c
     * @see https://www.apiref.com/android-zh/android/webkit/WebViewClient.html
     * @param {	android.webkit.WebView} webView 
     * @param {android.webkit.WebResourceRequest} request 
     */
    shouldInterceptRequest: (webView, request) => {
      try {
        /** @type {java.lang.String} */
        let url = request.getUrl().toString();
        if (url && /^((file:\/\/)|http:\/\/127.0.0.1:8080)/.test(url) && options.local) {
          let cwd = files.cwd();
          const relativePath = url.replace("file://" + cwd, ".").replace("http://127.0.0.1:8080", ".");
          if (relativePath) {
            let filePath = files.path(relativePath);
            if (filePath && files.isFile(filePath)) {
              importClass(java.net.URLConnection);
              importClass(java.io.ByteArrayInputStream);
              importClass(android.webkit.WebResourceResponse);
              if (URLConnection && ByteArrayInputStream && WebResourceResponse) {
                let byteArrIptStm = new ByteArrayInputStream(files.readBytes(filePath));
                let mimeType = URLConnection.guessContentTypeFromName(filePath);
                if (!mimeType) {
                  mimeType = URLConnection.guessContentTypeFromStream(byteArrIptStm);
                }
                return new WebResourceResponse(mimeType, "UTF-8", byteArrIptStm);
              }
            }
          }
        } else {
          console.log(url);
        }
      } catch (error) {
        console.error(error);
        return null;
      }
    },
    shouldOverrideUrlLoading: (webview, request) => {

    },
    // 网页加载网页各种资源的回调
    onLoadResource: (webView, url) => {
    },
    /** 页面开始加载, 此时还没有加载 index.html 中的代码 */
    onPageStarted: (webView, url, favicon) => {
    },
    /** 页面加载完成, 在 window.onload 之后触发 */
    onPageFinished: (webView, curUrl) => {
    },
    onReceivedError: (webView, webResourceRequest, webResourceError) => {
      let url = webResourceRequest.getUrl();
      let errorCode = webResourceError.getErrorCode();
      let description = webResourceError.getDescription();
      console.trace(errorCode + ' ' + description + ' ' + url);
    },
  });

  webview.webChromeClient = new JavaAdapter(android.webkit.WebChromeClient, {
    /** 拦截 web console 消息 */
    onConsoleMessage: (consoleMessage) => {
      /** @type {string} */
      let msg = consoleMessage.message();
      if (msg.indexOf(options.protocol) !== 0) {
        let sourceId = consoleMessage.sourceId().split('/');
        let sourceIdStr = sourceId[sourceId.length - 1];
        let lineNumber = consoleMessage.lineNumber();
        let msgLevel = consoleMessage.messageLevel();
        options.showLog && console.log("🌏: %s [%s:%s] %s", msgLevel, sourceIdStr, lineNumber, msg);
        return;
      }

      let uris = msg.split('/');
      if (!(uris && uris[2])) {
        options.showLog && console.log("❗: nothing code received.");
        return;
      }
      let callbackIndex, callbackResult;
      try {
        let data = JSON.parse(java.net.URLDecoder.decode(uris[2], 'UTF-8'));
        innerLog('📥:', JSON.stringify(data));
        let command = data.command;
        let args = data.args;
        callbackIndex = data.callbackIndex;
        callbackResult = proxyHandler(command, args);
      } catch (error) {
        console.error(error);
        console.trace(error);
        callbackResult = { message: error.message };
      }
      if (callbackIndex) {
        let callbackArgs = JSON.stringify({
          callbackIndex: callbackIndex,
          args: callbackResult,
        });
        reflectHandler([options.injectModuleName, '.callback(', callbackArgs, ')'].join(''));
        innerLog('📤:', callbackArgs);
      }
    },
  });

  injectHandler();
}

module.exports = {
  initWebviewProxy: initWebviewProxy,
};
