'use strict';

const Controller = require('egg').Controller;

class GoodsController extends Controller {
    // 新增商品
    async addGoods() {
        const { ctx, service } = this
        const {
            category_id,
            goods_image,
            goods_name,
            goods_describe,
            goods_stats,
            goods_sku
        } = ctx.request.body
        // 校验
        ctx.validate({
            category_id: { type: 'nullValue', tips: '请选择商品分类' },
            goods_image: { type: 'nullValue', tips: '请上传商品图片' },
            goods_name: { type: 'nullValue', tips: '请填写商品名称' },
            goods_describe: { type: 'nullValue', tips: '请填写商品描述' },
            goods_stats: { type: 'goodsStatsIsArray' },
            goods_sku: { type: 'goodsSkuVal', tips: '价格和库存不能为空' }
        }, ctx.request.body)
        await service.goods.addGoods(
            {
                category_id,
                goods_image,
                goods_name,
                goods_describe,
                goods_stats,
                goods_sku
            }
        )
        ctx.send()
    }
    // 获取商品，每次10条数据
    async getGoods() {
        const { ctx, service } = this
        const { page } = ctx.query
        ctx.validate({ page: { type: 'nullValue', tips: '分页值不能为空' } }, ctx.query)
        const res = await service.goods.getGoods(page)
        ctx.send(res)
    }
    // 删除单个商品
    async deleteGoods() {
        const { ctx, service } = this
        const { _id } = ctx.query
        ctx.validate({ _id: { type: 'nullValue', tips: '商品_id值不能为空' } }, ctx.query)
        const db = ctx.model.Goods
        await db.findByIdAndDelete({ _id })
        // 删sku
        const sku = ctx.model.Skulist
        await sku.deleteMany({ goods_id: _id })
        ctx.send()
    }
}

module.exports = GoodsController;