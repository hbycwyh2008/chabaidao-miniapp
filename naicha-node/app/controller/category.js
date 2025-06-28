'use strict';

const Controller = require('egg').Controller;

class CategoryController extends Controller {
    // 新增类目
    async addCategory() {
        const { ctx } = this
        const { category, icon } = ctx.request.body
        ctx.validate({
            category: { type: 'nullValue', tips: '请填写类目' },
            icon: { type: 'nullValue', tips: '请上传图标' }
        },
            ctx.request.body)
        // 查询是否重复
        const db = ctx.model.Category
        const repeat = await db.find({ categoryName: category })
        if (repeat.length > 0) {
            ctx.send([], 422, '类目出现重复')
        } else {
            const res = await db.create({ categoryName: category, icon })
            ctx.send(res)
        }
    }
    // 获取类目，一次10条
    async getCategory() {
        const { ctx, service } = this
        const { page } = ctx.query//get请求接收参数
        ctx.validate({
            page: { type: 'nullValue', tips: '分页值不能为空' }
        },
            ctx.query)
        const db = ctx.model.Category
        const res = await service.category.getCategory(page)
        ctx.send(res)
    }
    // 删除指定分类，根据_id删除
    async deleteCategory() {
        const { ctx, service } = this
        const { _id } = ctx.query//get请求接收参数
        ctx.validate({
            _id: { type: 'nullValue', tips: '分类_id不能为空' }
        },
            ctx.query)
        const db = ctx.model.Category
        await db.findByIdAndDelete({ _id })
        ctx.send()
    }
    // 获取所有分类类目
    async allCategory() {
        const { ctx, service } = this
        const db = ctx.model.Category
        const res = await db.find({}, { icon: false })
        ctx.send(res)
    }
}

module.exports = CategoryController;