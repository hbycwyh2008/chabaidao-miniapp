/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app) => {
  const { router, controller, io } = app;

  // --------------后台管理API接口-------------------------

  // 商家注册账号
  router.post("/api/admin/register", controller.admininfo.adminRegister);
  // 商家登录账号
  router.post("/api/admin/login", controller.admininfo.adminLogin);
  // 文件上传
  router.post("/api/admin/uploadFile", controller.upload.uploadFile);
  // 更新logo
  router.post("/api/admin/upload-logo", app.middleware.jwt(), controller.admininfo.uploadLogo);
  // 更新店铺名称
  router.post("/api/admin/upload-tradeName", app.middleware.jwt(), controller.admininfo.uploadTradeName);
  // 更新店铺介绍
  router.post("/api/admin/upload-shopintroduction", app.middleware.jwt(), controller.admininfo.uploadShopIntroduction);
  // 更新营业时间
  router.post("/api/admin/upload-businesshours", app.middleware.jwt(), controller.admininfo.uploadBusinessHours);
  // 更新外卖起送价
  router.post("/api/admin/upload-initialprice", app.middleware.jwt(), controller.admininfo.uploadInitialprice);
  // 更新店铺地址
  router.post("/api/admin/upload-address", app.middleware.jwt(), controller.admininfo.uploadAddress);
  // 新增商品类目
  router.post("/api/admin/add-category", app.middleware.jwt(), controller.category.addCategory);
  // 获取商品类目
  router.get("/api/admin/get-category", app.middleware.jwt(), controller.category.getCategory);
  // 删除单个商品类目
  router.get("/api/admin/delete-category", app.middleware.jwt(), controller.category.deleteCategory);
  // 获取所有商品类目
  router.get("/api/admin/all-category", app.middleware.jwt(), controller.category.allCategory);
  // 提交新增商品
  router.post("/api/admin/add-goods", app.middleware.jwt(), controller.goods.addGoods);
  // 获取商品数据
  router.get("/api/admin/get-goods", app.middleware.jwt(), controller.goods.getGoods);
  // 删除单个商品数据
  router.get("/api/admin/delete-goods", app.middleware.jwt(), controller.goods.deleteGoods);
  // 提交推荐商品
  router.post("/api/admin/add-recommend", app.middleware.jwt(), controller.recommendGoods.addRecommend);
  // 获取推荐商品列表
  router.get("/api/admin/get-recommend", app.middleware.jwt(), controller.recommendGoods.getRecommend);
  // 删除推荐商品
  router.get("/api/admin/delete-recommend", app.middleware.jwt(), controller.recommendGoods.deleteRecommend);
  // 后台管理获取用户订单列表
  router.get("/api/admin/receive-order-list", app.middleware.jwt(), controller.userorder.receiveOrderList);
  // 后台管理获取单个订单详情
  router.get("/api/admin/receive-order-details", app.middleware.jwt(), controller.userorder.receiveOrderDetails);
  // 测试支付
  // router.post("/api/wxpay", controller.wxpay.wxPay);

  // ---------------小程序端API接口------------------

  // 获取小程序首页轮播数据
  router.get("/api/wx/get-swiper", controller.wxHomepage.getSwiper);
  // 小程序获取商家信息
  router.get("/api/wx/get-merchantinfo", controller.wxChooseAmenu.getMerchantInfo);
  //  计算用户和商家之间的距离
  router.get("/api/wx/distance-calculator", controller.wxChooseAmenu.distanceCalculator);
  //  获取分类和所有商品数据
  router.get("/api/wx/all-goods", controller.wxChooseAmenu.allGoods);
  //  获取某个商品的sku列表
  router.get("/api/wx/goods-sku-list", controller.wxChooseAmenu.goodsSkuList);
  //  搜索商品
  router.get("/api/wx/search-goods", controller.wxChooseAmenu.searchGoods);
  //  小程序用户登录
  router.get("/api/wx/wxlogin", controller.wxuserinfo.wxLogin);
  //  小程序用户修改头像昵称
  router.post("/api/wx/uploadWxUser", app.middleware.jwt(), controller.wxuserinfo.uploadWxUser);
  //  小程序用户创建收货地址
  router.post("/api/wx/upload-address", app.middleware.jwt(), controller.wxuserinfo.uploadAddress);
  //  小程序用户设置默认收货地址
  router.get("/api/wx/set-default-address", app.middleware.jwt(), controller.wxuserinfo.setDefaultAddress);
  //  小程序用户删除收货地址
  router.get("/api/wx/delete-user-address", app.middleware.jwt(), controller.wxuserinfo.deleteUserAddress);
  //  小程序用户获取收货地址
  router.get("/api/wx/get-user-address", app.middleware.jwt(), controller.wxuserinfo.getUserAddress);
  //  小程序用户获取默认收货地址
  router.get("/api/wx/default-address", app.middleware.jwt(), controller.userorder.defaultAddress);
  //  小程序用户提交到店自取订单
  router.post("/api/wx/selfpickup-order", app.middleware.jwt(), controller.userorder.selfPickupOrder);
  //  小程序用户提交外卖订单
  router.post("/api/wx/outdoor-order", app.middleware.jwt(), controller.userorder.outdoorOrder);
  //  小程序用户获取订单列表
  router.get("/api/wx/all-order-list", app.middleware.jwt(), controller.userorder.allOrderList);
  //  小程序用户查询订单详情数据
  router.get("/api/wx/order-details", app.middleware.jwt(), controller.userorder.orderDetails);
  // 支付回调通知
  router.post("/api/wx/notify-url", controller.userorder.notifyUrl);
  // 待付款再次付款
  router.get("/api/wx/pending-payment", app.middleware.jwt(), controller.userorder.pendingPayment);

  // ---------即时通讯----------

  // 用户发来消息
  io.route("userMessage", io.controller.chat.userMessage);
  // 后台管理发来消息
  io.route("adminMessage", io.controller.chat.adminMessage);
};
