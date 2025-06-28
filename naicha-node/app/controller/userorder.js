"use strict";

const Controller = require("egg").Controller;
const crypto = require("crypto");

class UserorderController extends Controller {
  // 获取默认的收货地址
  async defaultAddress() {
    const { ctx } = this;
    const db = ctx.model.Wxuseraddress;
    const res = await db.find({ userOpenid: ctx.auth.uid, defaultAddress: true }, { userOpenid: false, defaultAddress: false });
    ctx.send(res);
  }
  // 自提订单
  async selfPickupOrder() {
    const { ctx, service } = this;
    const { orderType, userMobile, productOrder } = ctx.request.body;
    ctx.validate(
      {
        orderType: { type: "nullValue", tips: "订单类型必传" },
        userMobile: { type: "nullValue", tips: "请填写手机号码" },
        productOrder: { type: "goodsStatsIsArray" },
      },
      ctx.request.body
    );
    const orderData = {
      userOpenid: ctx.auth.uid,
      orderType,
      userMobile,
      productOrder,
    };
    const res = await service.userorder.wxUserPay(orderData);
    ctx.send(res.data, res.code, res.msg);
  }
  // 外卖订单
  async outdoorOrder() {
    const { ctx, service } = this;
    const { orderType, receiverAddress, productOrder } = ctx.request.body;
    ctx.validate(
      {
        orderType: { type: "nullValue", tips: "订单类型必传" },
        receiverAddress: { type: "receiverAddressVal", tips: "请选择收货地址" },
        productOrder: { type: "goodsStatsIsArray" },
      },
      ctx.request.body
    );
    const orderData = {
      userOpenid: ctx.auth.uid,
      orderType,
      receiverAddress,
      productOrder,
    };
    const res = await service.userorder.wxUserPay(orderData);
    ctx.send(res.data, res.code, res.msg);
  }
  // 支付成功微信服务器调用该接口传来数据；支付成功回调
  async notifyUrl() {
    const { ctx, app } = this;
    // console.log(ctx.request.body);
    const { event_type, resource } = ctx.request.body;
    if (event_type === "TRANSACTION.SUCCESS") {
      ctx.send();
      const key = Buffer.from(app.config.wxAppid.wxKeyV3, "utf8");
      const nonce = Buffer.from(resource.nonce, "utf8");
      const associatedData = Buffer.from(resource.associated_data, "utf8");
      const ciphertextBuffer = Buffer.from(resource.ciphertext, "base64");
      // 创建AEAD_AES_256_GCM解密器对象
      const decipher = crypto.createDecipheriv("aes-256-gcm", key, nonce);
      // 设置关联数据，与密文进行身份验证
      decipher.setAAD(associatedData);
      // associated_data长度小于16个字节，取最后16和字节作为认证标签
      const authTag = Buffer.from(ciphertextBuffer.subarray(ciphertextBuffer.length - 16));
      // 使用setAuthTag方法设置认证标签
      decipher.setAuthTag(authTag);
      // 取除去最后16个字节以外的所有字节作为加密数据
      const encryptedData = Buffer.from(ciphertextBuffer.subarray(0, ciphertextBuffer.length - 16));
      // 调用update方法对加密数据进行解密
      let decrypted = decipher.update(encryptedData);
      // 调用final方法指定编码格式为utf8
      decrypted += decipher.final("utf8");
      // console.log(decrypted);
      const paySucData = JSON.parse(decrypted);
      // 判断该订单在数据库是否支付成功，如果成功就不在走下面的下面
      const db = ctx.model.Userorder;
      const orderData = await db.find({ _id: paySucData.attach }).lean();
      if (orderData[0].paymentStatus === "001") {
        await db.findByIdAndUpdate({ _id: paySucData.attach }, { paymentStatus: "002" });
        // 生成取餐码
        if (orderData[0].orderType === "001") {
          const lastOrder = await db.find({ orderType: "001" }).sort("-takeMealCode").limit(1);
          const newCode = lastOrder[0].takeMealCode + 1;
          await db.findByIdAndUpdate({ _id: paySucData.attach }, { takeMealCode: newCode });
        }
        // 库存自减，销量自增
        const Skulist = ctx.model.Skulist;
        const Goods = ctx.model.Goods;
        for (const item of orderData[0].productOrder) {
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
      }
    }
  }
  // 待付款再次付款
  async pendingPayment() {
    const { ctx, app, service } = this;
    const { orderId } = ctx.query;
    const db = ctx.model.Userorder;
    // const orderData = await db.find({ _id: paySucData.attach }).lean();
    const out_trade_no = ctx.outTradeNo();
    await db.findByIdAndUpdate({ _id: orderId }, { out_trade_no });
    // 查询该订单获取需要的值
    const orderData = await db.find({ _id: orderId }, { userOpenid: true, paymentPrice: true }).lean();
    const wxPayObject = await service.userorder.callPayment(out_trade_no, orderId, orderData[0].paymentPrice, orderData[0].userOpenid);
    ctx.send(wxPayObject.data, wxPayObject.code, wxPayObject.msg);
  }

  // 获取小程序端用户自己的订单，一次10条
  async allOrderList() {
    const { ctx, service } = this;
    const { page } = ctx.query;
    ctx.validate(
      {
        page: { type: "nullValue", tips: "分页值不能为空" },
      },
      ctx.query
    );
    const res = await service.userorder.allOrderList(page, ctx.auth.uid);
    ctx.send(res);
  }
  // 查询订单详情数据
  async orderDetails() {
    const { ctx, service } = this;
    const { id } = ctx.query;
    ctx.validate(
      {
        id: { type: "nullValue", tips: "id值不能为空" },
      },
      ctx.query
    );
    const db = ctx.model.Userorder;
    const res = await db.find(
      { _id: id, userOpenid: ctx.auth.uid },
      {
        userOpenid: false,
        timestamp: false,
        userMobile: false,
      }
    );
    ctx.send(res);
  }
  // 后台管理获取用户订单列表
  async receiveOrderList() {
    const { ctx, service } = this;
    const { page } = ctx.query;
    ctx.validate(
      {
        page: { type: "nullValue", tips: "分页值不能为空" },
      },
      ctx.query
    );
    const res = await service.userorder.receiveOrderList(page);
    ctx.send(res);
  }
  // 后台管理获取单个订单详情
  async receiveOrderDetails() {
    const { ctx, service } = this;
    const { id } = ctx.query;
    ctx.validate(
      {
        id: { type: "nullValue", tips: "id值不能为空" },
      },
      ctx.query
    );
    const db = ctx.model.Userorder;
    const res = await db.find(
      { _id: id },
      {
        timestamp: false,
      }
    );
    ctx.send(res);
  }
}

module.exports = UserorderController;
