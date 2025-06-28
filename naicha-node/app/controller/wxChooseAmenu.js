'use strict';

const Controller = require('egg').Controller;

class WxChooseAmenuController extends Controller {
    // 小程序获取商家信息
    async getMerchantInfo() {
        const { ctx } = this
        const db = ctx.model.Admininfo
        const res = await db.find({}).select('tradeName address initialPrice businessHours location')
        ctx.send(res)
    }
    // 计算用户和商家之间的距离
    async distanceCalculator() {
        const { ctx, app, service } = this
        const { latitube, longitude } = ctx.query
        ctx.validate({
            latitube: { type: 'nullValue', tips: '维度不能为空' },
            longitude: { type: 'nullValue', tips: '经度不能为空' }
        }, ctx.query)
        const { distance, status, msg, error } = await service.wxChooseAmenu.distanceCalculator(latitube, longitude)
        ctx.send({ distance }, status, msg, error)
    }
    // 获取分类和所有商品数据
    async allGoods() {
        const { ctx, service } = this
        const res = await service.wxChooseAmenu.allGoods()
        ctx.send(res)
    }
    // 获取某个商品的sku列表
    async goodsSkuList() {
        const { ctx, service } = this
        const { _id } = ctx.query
        const db = ctx.model.Skulist
        ctx.validate({
            _id: { type: 'nullValue', tips: '商品_id不能为空' }
        }, ctx.query)
        const res = await db.find({ goods_id: _id })
        ctx.send(res)
    }
    // 搜索商品
    async searchGoods() {
        const { ctx, service } = this
        const { keyword, page } = ctx.query
        ctx.validate({
            keyword: { type: 'nullValue', tips: '请输入搜索内容' },
            page: { type: 'nullValue', tips: '分页值不能为空' }
        }, ctx.query)
        const res = await service.wxChooseAmenu.searchGoods(keyword, page)
        ctx.send(res)
    }
}

module.exports = WxChooseAmenuController;