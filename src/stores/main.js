import { defineStore } from "pinia";
import { durationFormat } from "@shihongxins/jsutils";
import { localStorageKeys } from ".";

export const useMainStore = defineStore("main", {
  state: () => {
    return {
      globalLoading: false,
      appInfo: null,
      appNoticeType: "hidden", // unlink, unusable, update, intro, error, hidden
      restTime: 0,
    };
  },
  getters: {
    appReady() {
      return Boolean(!this.globalLoading && this.appNoticeType === "hidden" && this.appInfo?.enable);
    },
    unlock() {
      let unlock = {
        status: false,
        desc: "未解锁",
      };
      if (this.restTime !== 0) {
        if (this.restTime > 0) {
          let expire = Date.now() + this.restTime;
          unlock.status = true;
          unlock.desc = durationFormat(Date.now(), expire, "已解锁（剩余 d 天 HH 小时 mm 分钟）");
        } else {
          unlock.desc = "已过期";
        }
      }
      return unlock;
    },
  },
  actions: {
    async validateApp() {
      this.appInfo = null;
      try {
        const info = await fetch("https://www.fastmock.site/mock/088917568e7b1f345f029ab96c254d54/autoxjs/application")
          .then((response) => {
            return response.ok ? response.json() : response.text() || response.statusText;
          })
          .catch((error) => error);
        this.appInfo = info;
        if (!(info && info.enable)) {
          this.appNoticeType = "unusable";
          return;
        }
        const version = await new Promise((resolve) => {
          if (typeof projectVersion === "string") {
            // eslint-disable-next-line no-undef
            resolve(projectVersion);
          } else {
            window._autoxjs_.evaluate(`getVersion()`, resolve);
          }
        }).catch(() => false);
        if (version !== info.version) {
          this.appNoticeType = "update";
          return;
        }
        this.appNoticeType = "intro";
      } catch (error) {
        this.appNoticeType = "error";
      }
    },
    async validateExpires(unlockCode = "", showLoading = false) {
      let status = "waiting";
      if (!unlockCode) {
        try {
          unlockCode = localStorage.getItem(localStorageKeys.UNLOCK) || "";
        } catch (error) {
          console.error(error);
        }
      }
      if (!unlockCode) {
        this.restTime = 0;
        status = "fail";
        return status;
      }
      localStorage.setItem(localStorageKeys.UNLOCK, unlockCode);
      if (showLoading) {
        this.globalLoading = true;
      }
      status = await new Promise((resolve) => {
        if (typeof window._autoxjs_?.evaluate === "function") {
          window._autoxjs_.evaluate(`validateExpires("${unlockCode}")`);
        } else {
          resolve("fail");
        }
        let times = 0;
        let timer = setInterval(() => {
          if (this.unlock.status || times < 4) {
            status = this.unlock.status ? "success" : "waiting";
          } else {
            status = times < 4 ? "waiting" : "fail";
          }
          if (status !== "waiting") {
            clearTimeout(timer);
            resolve(status);
          }
        }, 500);
      }).catch(() => "fail");
      this.globalLoading = false;
      return status;
    },
  },
});
