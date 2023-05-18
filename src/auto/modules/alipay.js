function alipayIntent(data) {
  if (!app.getPackageName("支付宝")) {
    return toastLog("无法启动支付宝，用户未安装");
  }
  app.startActivity({
    action: "android.intent.action.VIEW",
    packageName: "com.eg.android.AlipayGphone",
    data: data,
  });
}

function showQRPayment() {
  alipayIntent("alipayqr://platformapi/startapp?saId=20000056");
}
// showQRPayment();

function invokeRichScan(content) {
  alipayIntent(`alipayqr://platformapi/startapp?saId=10000007&qrcode=${content || ""}`);
}

// invokeRichScan("https://qr.alipay.com/fkx199471lhnwhfigwjmh20");

function invokeTransfer(userId, amount, memo) {
  if (!(userId && String(userId).trim())) {
    return toastLog("未知支付宝账号");
  }
  alipayIntent(`alipayqr://platformapi/startapp?saId=09999988&actionType=toAccount&userId=${userId}&amount=${amount}&memo=${memo}&goBack=NO`);
}

// invokeTransfer(2088132669992344, 0.15, "标识不可修改：" + encodeURIComponent(device.getAndroidId()));

/**
 * me 2088702157429612 fkx170404v4owqwijbwmyf1
 * yd 2088132669992344 fkx199471lhnwhfigwjmh20
 */
