function initTimes(times, defValue) {
  if (!(defValue && typeof defValue === "number" && defValue > 0)) {
    defValue = 2;
  }
  return parseInt(times) > 0 ? parseInt(times) : defValue;
}

function emitClickLimitedByTimes(UiObject, times) {
  if (!(UiObject && (UiObject.click || UiObject.bounds))) {
    toastLog("未知控件");
    console.log(UiObject);
    return;
  }
  times = initTimes(times);
  let clicked = false;
  while (!clicked && times > 0) {
    if (UiObject.clickable && UiObject.clickable()) {
      clicked = UiObject.click();
    }
    if (!clicked) {
      if (UiObject.bounds) {
        const rect = UiObject.bounds();
        clicked = click(rect.centerX(), rect.centerY());
      }
    }
    times--;
    sleep(200);
  }
  return clicked;
}

function getPackageNameByName(name) {
  const pkgRegExp = /^(\w+\.)+\w$/;
  let pkgName = "";
  if (name && typeof name === "string") {
    pkgName = pkgRegExp.test(name) ? name : app.getPackageName(name) || "";
  }
  return pkgName;
}

function launchAppByName(name, packageName, times) {
  let isSuccess = false;
  const pkgName = getPackageNameByName(packageName || name);
  if (!pkgName) {
    toastLog("找不到应用：" + (packageName || name));
    return isSuccess;
  }
  times = initTimes(times);
  while (!isSuccess && times > 0) {
    app.launchPackage(pkgName);
    sleep(1000);
    isSuccess = pkgName === currentPackage();
    times--;
  }
  if (isSuccess) {
    click(device.width / 2, device.height / 2);
  }
  return isSuccess;
}

function stopAppByName(name, packageName) {
  let isSuccess = false;
  const pkgName = utils.getPackageNameByName(packageName || name);
  if (!(pkgName && app.openAppSetting(pkgName))) {
    toastLog("找不到应用：" + (packageName || name));
    return isSuccess;
  }
  const forceStop = text("强行停止").findOne(500);
  if (forceStop) {
    if (emitClickLimitedByTimes(forceStop)) {
      sleep(500);
      const cfmForceStop = text("强行停止").findOne(500);
      if (cfmForceStop) {
        isSuccess = emitClickLimitedByTimes(cfmForceStop);
      }
    }
  }
  sleep(200);
  back();
  if (!isSuccess) {
    toastLog("停止应用失败：" + (packageName || name));
    sleep(200);
  }
  return isSuccess;
}

function parseTime(time) {
  const ts = Date.parse('1970/01/01 ' + time);
  if (/^(\d+:?)+(\.\d+)?$/g.test(time) && ts) {
    return ts - Date.parse('1970/01/01');
  }
  return 0;
}

const utils = {
  initTimes,
  emitClickLimitedByTimes,
  getPackageNameByName,
  launchAppByName,
  stopAppByName,
  parseTime,
};

function tiktokCheck(type) {
  if (type === "installed") {
    return !!utils.getPackageNameByName("抖音");
  }
  if (type === "actived") {
    return currentPackage() === utils.getPackageNameByName();
  }
  if (type === "isFocused") {
    return /^com\.ss\.android\.ugc\.aweme\.main/.test(currentActivity());
  }
  if (type === "isIndex") {
    let flag = false,
      i = 5;
    while (!flag && i > 0) {
      flag =
        tiktokCheck("isPaused") ||
        ["首页", "朋友", "消息", "我"]
          .map((t) => {
            return text(t).findOnce();
          })
          .every((item) => item);
      i--;
    }
    return flag;
  }
  if (type === "isPicture") {
    return Boolean(visibleToUser().className("android.widget.TextView").text("图文").findOnce());
  }
  if (type === "isLive") {
    return Boolean(!tiktokCheck("isPicture") && visibleToUser().className("android.widget.TextView").text("点击进入直播间").findOnce());
  }
  if (type === "isPaused") {
    return Boolean(visibleToUser().className("android.widget.ImageView").enabled(true).depth(11).indexInParent(4).findOne(100));
  }
  return false;
}

function tiktokIndex(times, exceedThenRelaunch) {
  times = Math.min(utils.initTimes(times), 50);
  let isSuccess = false;
  while (!isSuccess && times > 0) {
    console.log("tiktokIndex", isSuccess, times);
    if (!tiktokCheck("isFocused")) {
      utils.launchAppByName("抖音");
    }
    sleep(1000);
    times--;
    isSuccess = tiktokCheck("isIndex");
    back();
  }
  if (!isSuccess && exceedThenRelaunch) {
    utils.stopAppByName("抖音");
    sleep(1000);
    return tiktokIndex(times, exceedThenRelaunch);
  }
  return isSuccess;
}

function tiktokTabbarSwitch(tabbarTextOrIndex, times) {
  times = utils.initTimes(times);
  let isSuccess = false;
  while (!isSuccess && times > 0) {
    if (!tiktokCheck("isIndex")) {
      tiktokIndex();
    }
    sleep(1000);
    times--;
    if (typeof tabbarTextOrIndex === "number") {
      index = index >= 0 && index <= 4 ? index : 0;
      const btn = className("android.widget.FrameLayout")
        .clickable()
        .depth(9)
        .indexInParent(tabbarTextOrIndex)
        .findOne(1000);
      if (btn && btn.bounds().bottom > device.height - 100) {
        isSuccess = utils.emitClickLimitedByTimes(btn);
      }
    }
    if (typeof tabbarTextOrIndex === "string") {
      const txt = text(tabbarTextOrIndex).visibleToUser().findOne(1000);
      if (txt) {
        isSuccess = utils.emitClickLimitedByTimes(txt);
      }
    }
  }
  return isSuccess;
}

function enterGroup(name, times) {
  times = utils.initTimes(times, 5);
  const sleeptime = Math.max(times * 100, 500);
  tiktokTabbarSwitch("消息");
  sleep(sleeptime);
  desc("搜索").clickable().findOne().click();
  sleep(sleeptime);
  setText(name);
  sleep(sleeptime);
  let group
  while (!group && times > 0) {
    group = className("android.widget.TextView").indexInParent(3).textContains(name).findOne(sleeptime);
    times--;
    sleep(sleeptime);
  }
  console.log(group);
  return Boolean(group && utils.emitClickLimitedByTimes(group));
}

function swipeToLastRunedOrYesterday(times) {
  times = utils.initTimes(times, 40);
  const sleeptime = Math.max(times * 20, 200); // 每次滑动最少等待 300 毫秒
  let yesterdayTag;
  while (!yesterdayTag && times > 0) {
    // 向上滚动 y1 < y2
    swipe(device.width / 2, 600, device.width / 2, 2600, sleeptime);
    sleep(sleeptime);
    yesterdayTag = className("android.widget.TextView").descStartsWith("昨天").textStartsWith("昨天").findOnce();
    times--;
  }
  return Boolean(yesterdayTag);
}

function recursionFindUserAvatar(lastRoundUserName) {
  let finallyFlag = "昨天";
  if (!(lastRoundUserName && Array.isArray(lastRoundUserName) && lastRoundUserName.length)) {
    lastRoundUserName = [];
  }
  const currRound = className("android.widget.Button").descEndsWith("头像").visibleToUser().find();
  let { length } = currRound || { length: 0 };
  const currentRoundUserName = [];
  if (currRound && length) {
    let isRecursed = lastRoundUserName.filter((userName) => {
      return currRound.filter((u) => String(u.contentDescription || "").slice(0, -3) === userName).length > 0;
    }).length > 3;
    if (!isRecursed) {
      toastLog(`本轮有 ${length} 个用户`);
      for (let index = 0; index < currRound.length; index++) {
        sleep(200);
        let userAvatar = currRound[index];
        let userName = String(userAvatar.contentDescription || "").slice(0, -3);
        toastLog(`处理第${index + 1}个用户：[${userName}]`);
        currentRoundUserName.push(userName);
        let isEnterdUserSpace = utils.emitClickLimitedByTimes(userAvatar);
        if (isEnterdUserSpace) {
          sleep(1000);
          playFirstVideo();
          sleep(1000);
          toastLog("返回群聊");
          back();
          sleep(1000);
        }
      }
      sleep(500);
      click(device.width / 4 * 3, device.height / 2);
      swipe(device.width / 4 * 3, 2600, device.width / 4 * 3, 600, 500);
      sleep(500);
      finallyFlag = recursionFindUserAvatar(currentRoundUserName) || finallyFlag;
    } else {
      toastLog("完成本次群聊用户消息");
      finallyFlag = lastRoundUserName.pop() || (currRound[0] && String(currRound[0].contentDescription || "").slice(0, -3)) || finallyFlag;
    }
  } else {
    finallyFlag = lastRoundUserName.pop() || finallyFlag;
  }
  return finallyFlag || "昨天";
}

// 播放第一个作品
function playFirstVideo() {
  const videos = className("android.view.View").clickable(true).visibleToUser().findOne(300);
  if (videos) {
    const isPlayed = utils.emitClickLimitedByTimes(videos);
    if (isPlayed) {
      sleep(300);
      lightHeart();
      toastLog("返回用户主页");
      back();
    }
  }
}

function getVideoTimes(times) {
  times = utils.initTimes(times, 4);
  let current = 0, duration = 0;
  const bottom = visibleToUser().id("com.ss.android.ugc.aweme:id/bottom_space").findOnce();
  if (bottom) {
    const bounds = bottom.bounds();
    if (bounds) {
      const isP = tiktokCheck("isPicture");
      let currentTime = "", durationTime = "";
      const assertThread = threads.start(function () {
        let videoTimes = [];
        while (!(currentTime && durationTime)) {
          videoTimes = visibleToUser().className("android.widget.TextView").textMatches(isP ? /\d{1,2}/ : /\d+:\d+/).find();
          if (videoTimes && videoTimes.length === 2) {
            currentTime = videoTimes[0].text();
            durationTime = videoTimes[1].text();
            console.log("times found", currentTime, durationTime);
          }
        }
        assertThread.interrupt();
      });
      assertThread.waitFor();
      while (times > 0 && !(currentTime && durationTime)) {
        swipe(device.width / 2, bounds.top - 40, 40, bounds.top - 40, 1000);
        times--;
        console.log("getVideoTimes", times, currentTime, durationTime);
      }
      sleep(500);
      if (isP) {
        current = parseInt(currentTime) || 0;
        duration = parseInt(durationTime) || 0;
        if (duration) {
          click(device.width / 2, device.height / 2);
          sleep(300);
          click(device.width / 2, device.height / 2);
        }
      } else {
        current = (parseTime("00:" + currentTime) / 1000) || 0;
        duration = (parseTime("00:" + durationTime) / 1000) || 0;
      }
    }
  }
  toastLog(`${current} / ${duration}`);
  return {
    current,
    duration,
  }
}

function speedUp() {
  gestures(
    [0, 1000, [100, device.height / 2], [100, device.height / 2]],
    [500, 500, [device.width / 2, device.height - 100]]
  )
  sleep(500);
  let speed = 1;
  const btnSpeed = visibleToUser().className("android.widget.ImageView").descEndsWith("倍速").findOnce();
  if (btnSpeed) {
    speed = parseInt(btnSpeed.desc()) || 2;
  }
  toastLog(`${speed}倍数播放`);
  return speed;
}

// 点赞
function lightHeart() {
  let isSuccess = false;
  const heart = className("android.widget.LinearLayout")
    .clickable(true)
    .visibleToUser()
    .descContains("点赞")
    .findOne(1000);
  if (heart && String(heart.contentDescription).startsWith("未点赞")) {
    const videoTimes = getVideoTimes();
    toastLog(`视频时长 ${videoTimes.duration} 秒`);
    let speed = 1;
    if (!(tiktokCheck("isPicture") && true)) {
      speed = speedUp();
    }
    sleep(videoTimes.duration * 1000 / speed);
    if (speed !== 1) {
      back();
      sleep(300);
    }
    toastLog("已看完");
    isSuccess = utils.emitClickLimitedByTimes(heart);
    sleep(1000);
    comment();
  }
  toastLog(isSuccess ? "点赞成功" : "点赞失败或已经赞过");
  return isSuccess;
}

// 评论
function comment() {
  let isSuccess = false;
  const btnComment = className("android.widget.LinearLayout")
    .clickable(true)
    .visibleToUser()
    .descContains("评论")
    .findOne(1000);
  if (btnComment) {
    toastLog("打开评论区");
    const showComment = utils.emitClickLimitedByTimes(btnComment);
    const btnHideCommit = desc("关闭").clickable(true).findOne(300);
    if (showComment && btnHideCommit) {
      sleep(300);
      const firstComment = id("content").className("android.widget.TextView").visibleToUser().findOnce();
      let myComment = Array(Math.ceil(Math.random() * 3 + 2)).join("[比心]");
      if (firstComment) {
        myComment += "[来看我]" + firstComment.text() + "[来看我]";
        toastLog("复制第一条评论");
      } else {
        // 随机评论
        myComment += "[比心][送心][赞][鼓掌][来看我][爱心][捂脸]";
        toastLog("产生随机评论");
      }
      setText(myComment);
      sleep(300);
      const btnSend = text("发送").findOne(300);
      if (btnSend) {
        isSuccess = utils.emitClickLimitedByTimes(btnSend);
        sleep(1000);
      }
      toastLog("关闭评论区");
      back();
    }
  }
  return isSuccess;
}

function main() {
  device.setMusicVolume(0);
  utils.stopAppByName("抖音");
  sleep(500);
  utils.launchAppByName("抖音");
  sleep(500);
  const { width, height } = device;
  setScreenMetrics(width, height);
  const groups = ["真真粉丝1群", "阿梦吖～的粉丝1群"].reverse();
  for (let index = 0; index < groups.length; index++) {
    let g = groups[index]
    let entered = enterGroup(g);
    if (!entered) {
      toastLog(`进入群聊[${g}]失败`);
      back();
      continue;
    }
    swipeToLastRunedOrYesterday();
    let finallyFlag = recursionFindUserAvatar();
    console.log(finallyFlag);
  }
  return;
}

console.time("main");
main();
console.timeEnd("main");
exit();

// recursionFindUserAvatar();
