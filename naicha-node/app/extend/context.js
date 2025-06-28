var jwt = require("jsonwebtoken");
const crypto = require("crypto");
const fs = require("fs");
// 引入商户key
const privateKey = fs.readFileSync("./config/apiclient_key.pem");
module.exports = {
  get ctx() {
    return this;
  },
  // 自定义返回前端的接口数据结构
  send(data = [], status = 200, msg = "SUCCESS", error = null) {
    this.body = { msg, data, error };
    this.status = status;
  },
  // 加密生成token
  generateToken(uid) {
    const { secret, expiresIn } = this.app.config.jwt;
    return jwt.sign({ uid }, secret, { expiresIn });
  },
  // 商户订单号
  outTradeNo() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWabcdefghijk2345678";
    let res = "";
    for (let i = 0; i < 32; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  },
  // 小程序下单生成的http头部签名
  signString(body, url = "/v3/pay/transactions/jsapi") {
    const { app } = this;
    // 生成时间戳
    const timestamp = Math.floor(Date.now() / 1000);
    // 随机串
    const nonceStr = crypto.randomBytes(16).toString("hex");
    // 构造待签名的字符串
    const signString = `POST\n${url}\n${timestamp}\n${nonceStr}\n${body}\n`;
    // 进行签名
    const sign = crypto.createSign("RSA-SHA256"); //创建签名对象
    sign.update(signString);
    const signature = sign.sign(privateKey, "base64");
    return `WECHATPAY2-SHA256-RSA2048 mchid="${app.config.wxAppid.mchid}",nonce_str="${nonceStr}",signature="${signature}",timestamp="${timestamp}",serial_no="${app.config.wxAppid.serial_no}"`;
  },
  // 生成小程序发起支付需要的paySign参数
  paySignString(prepayId) {
    const { app } = this;
    // 生成时间戳
    const timestamp = Math.floor(Date.now() / 1000);
    // 随机串
    const nonceStr = crypto.randomBytes(16).toString("hex");
    // 构造待签名的字符串
    const signString = `${app.config.wxAppid.appid}\n${timestamp}\n${nonceStr}\nprepay_id=${prepayId}\n`;
    // 进行签名
    const sign = crypto.createSign("RSA-SHA256"); //创建签名对象
    sign.update(signString);
    const signature = sign.sign(privateKey, "base64");
    return {
      timeStamp: JSON.stringify(timestamp),
      nonceStr,
      package: `prepay_id=${prepayId}`,
      signType: "RSA",
      paySign: signature,
    };
  },
};
