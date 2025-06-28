'use strict';

const Controller = require('egg').Controller;

class WxHomepageController extends Controller {
    // 获取小程序首页轮播数据
    async getSwiper() {
        const { ctx } = this
        const db = ctx.model.RecommendGoods
        const res = await db.find({})
        ctx.send(res)
    }
}

module.exports = WxHomepageController;