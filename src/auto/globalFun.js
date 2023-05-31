/* eslint-disable */
global.uninstallApp = function uninstallApp() {
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

global.downloadRemoteModule = function downloadRemoteModule(src, name) {
  let downloadThread;
  return new Promise((resolve, reject) => {
    if (!src) {
      throw new Error("unknown remote module path");
    }
    if (!name) {
      let reg = /^([^\s:]+:)?(\/\/)?([^:/&?%]+)(:(\d+))?(.*\/)?([^:/&?]*?\.\w+)?([^.]*?(\?.*)?)?$/gm;
      let matched = reg.exec(src);
      if (matched && matched[7]) {
        name = matched[7];
      }
      name = name || `temp${parseInt(Math.random()*100)}`;
    }
    let result = events.emitter(threads.currentThread());
    downloadThread = threads.start(() => {
      try {
        let dir = files.cwd() + "/remote/";
        files.ensureDir(dir);
        let content = http.get(src);
        files.write(dir + name + ".js", content.body.string());
        let module = require(dir + name + ".js");
        files.remove(dir + name + ".js");
        result.emit("done", module);
      } catch (error) {
        result.emit("error", error);
      }
    });
    result.on("done", (module) => resolve({ module }));
    result.on("error", (error) => reject({ error }));
  })
    .then((result) => {
      if (downloadThread && downloadThread.interrupt) {
        downloadThread.interrupt();
      }
      downloadThread = null;
      return result;
    })
    .catch((error) => {
      return { error };
    })
    .then((result) => {
      console.log("download result", result);
      return result;
    });
}

global.execRemoteFun = function execRemoteFun(src, attr, args) {
  return downloadRemoteModule(src)
    .then(({ module, error }) => {
      if (error) {
        throw new Error(error);
      }
      if (typeof module[attr] === "function") {
        args = [].concat(args).filter((arg) => typeof arg !== "undefined");
        return module[attr].apply(null, args);
      } else {
        return module[attr] || module;
      }
    })
    .catch((error) => {
      return { error };
    })
    .then((result) => {
      console.log("exec result", result);
      return result;
    });
}

global.unlockApp = function unlockApp(id, price) {
  if (!(id && price)) {
    return toastLog("解锁失败，应用或不可用");
  }
  execRemoteFun("https://shihongxins.surge.sh/alipay.coffee", "invokeTransfer", [
    id,
    price,
    "标识不可修改：" + device.getAndroidId(),
  ])
    .then((result) => {
      if (result && result.error) {
        throw new Error(error);
      }
      setTimeout(() => {
        toastLog("跳转支付，成功后查看私信");
      }, 1000);
      return result;
    })
    .catch((error) => {
      toastLog("解锁支付失败");
      return {error};
    }).finally(() => {
      global.SDKInstance.reflectHandler(
        `
          $pinia.state.value.main.globalLoading = false;
        `
      )
    });
}

global.validateExpires = function validateExpires(enc) {
  execRemoteFun("https://shihongxins.surge.sh/crypt.coffee", "dec", enc)
    .then((result) => result)
    .catch((error) => {
      toastLog("验证失败");
      return { error };
    })
    .then((result) => {
      let restTime = 0;
      if (!(result && result.error)) {
        let time = parseInt(String(result).slice(-13)) || (Date.now() - 10000);
        restTime = (time - Date.now()) || 0;
      }
      global.SDKInstance.reflectHandler(
        `
          $pinia.state.value.main.restTime = ${restTime};
        `
      );
    });
}

