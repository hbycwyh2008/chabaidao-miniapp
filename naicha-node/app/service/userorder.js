"use strict";

const Service = require("egg").Service;
const axios = require("axios");

class UserorderService extends Service {
  // 提交订单到数据库
  async submitOrder(orderData) {
    const db = this.ctx.model.Userorder;
    const res = await db.create(orderData);
    // 生成取餐码
    if (orderData.orderType === "001") {
      const lastOrder = await db.find({ orderType: "001" }).sort("-takeMealCode").limit(1);
      const newCode = lastOrder[0].takeMealCode + 1;
      await db.findByIdAndUpdate({ _id: res._id }, { takeMealCode: newCode });
    }
    // 库存自减，销量自增
    const Skulist = this.ctx.model.Skulist;
    const Goods = this.ctx.model.Goods;
    for (const item of orderData.productOrder) {
      if (item.sku.length > 0) {
        // 对有规格的商品库存自减
        await Skulist.updateOne({ _id: item.sku_id }, { $inc: { stock: -item.goodsQuantity } });
      }
      // 对商品的总库存自减
      await Goods.updateOne({ _id: item.goods_id }, { $inc: { goods_stock: -item.goodsQuantity } });
      // 对商品销量自增
      await Goods.updateOne({ _id: item.goods_id }, { $inc: { sales_valume: item.goodsQuantity } });
    }
    // 推送订单通知
    this.app.io.emit("orderinform", 0);
    return;
  }

  // 用户对商品下单发起支付
  async wxUserPay(orderData) {
    const { ctx } = this;
    // 先存储订单到数据库
    const db = ctx.model.Userorder;
    const createData = await db.create(orderData);
    // 生成商户订单号更新数据库集合
    const out_trade_no = ctx.outTradeNo();
    await db.findByIdAndUpdate({ _id: createData._id }, { out_trade_no });
    // 0.1块钱暂时用来测试
    return await this.callPayment(out_trade_no, createData._id, createData.paymentPrice, createData.userOpenid);
  }
  // 返回给小程序发起支付需要的数据
  async callPayment(out_trade_no, orderId, price, openid) {
    const { app, ctx } = this;
    const url = "https://api.mch.weixin.qq.com/v3/pay/transactions/jsapi";
    const data = {
      appid: app.config.wxAppid.appid,
      mchid: app.config.wxAppid.mchid,
      description: "茶百道小程序下单",
      out_trade_no,
      attach: orderId, //携带订单id，支付成功后需要通过该id来更新订单状态
      notify_url: "http://8xg7v2.natappfree.cc/api/wx/notify-url",
      amount: {
        total: price * 100,
      },
      payer: {
        openid,
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
      return { data: paySign, msg: "SUCCESS", code: 200 };
    } else {
      return { data: [], msg: res.data.message ? res.data.message : "出错，请检查接口调用", code: 400 };
    }
  }

  // 获取小程序端用户自己的订单，一次10条
  async allOrderList(page, userOpenid) {
    const db = this.ctx.model.Userorder;
    const res = await db.aggregate([
      { $match: { userOpenid } },
      { $sort: { timestamp: -1 } },
      { $skip: (page - 1) * 10 },
      { $limit: 10 },
      {
        $project: {
          orderType: true,
          productOrder: { $slice: ["$productOrder", 1] },
          paymentPrice: true,
          productOrderCount: { $size: "$productOrder" },
          paymentStatus: true,
        },
      },
    ]);
    return res;
  }
  // 后台管理获取用户订单列表
  async receiveOrderList(page) {
    const db = this.ctx.model.Userorder;
    const res = await db.aggregate([
      { $sort: { timestamp: -1 } },
      { $skip: (page - 1) * 10 },
      { $limit: 10 },
      {
        $project: {
          _id: true,
          orderTime: true,
          orderType: true,
          paymentPrice: true,
          productOrderCount: { $size: "$productOrder" },
          paymentStatus: true,
        },
      },
    ]);
    const total = await db.countDocuments();
    return { order: res, total };
  }
}

module.exports = UserorderService;
