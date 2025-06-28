"use strict";

const Controller = require("egg").Controller;
const axios = require("axios");

class WxpayController extends Controller {
  // 测试微信支付，签名之类的
  async wxPay() {
    const { app, ctx } = this;
    const url = "https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi";
    const data = {
      appid: app.config.wxAppid.appid,
      mchid: app.config.wxAppid.mchid,
      description: "茶百道小程序下单",
      out_trade_no: ctx.outTradeNo(),
      attach: "123456hmhmhk", //携带订单id，支付成功后需要通过该id来更新订单状态
      notify_url: "https://www.weixin.qq.com/wxpay/pay.php",
      amount: {
        total: 10 * 100,
      },
      payer: {
        openid: "oWScj5fXILxpsqL-E1ixFxsSfM3s",
      },
    };
    const signData = ctx.signString(JSON.stringify(data));
    const headers = {
      Authorization: signData,
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    const res = await axios.post(url, data, { headers });
    if (res.status === 200) {
      const paySign = ctx.paySignString(res.data.prepay_id);
      console.log(paySign);
    } else {
      return { data: [], msg: res.data.message ? res.data.message : "出错，请检查接口调用", code: 400 };
    }
  }
}

module.exports = WxpayController;
