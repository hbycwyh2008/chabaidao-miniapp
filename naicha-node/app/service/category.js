'use strict';

const Service = require('egg').Service;

class CategoryService extends Service {
    // 获取后台管理的分类，连表查询分类下的商品数量
    async getCategory(page) {
        const db = this.ctx.model.Category
        const res = await db.aggregate([
            { $skip: (page - 1) * 10 },
            { $limit: 10 },
            {//连接商品集合
                $lookup: {
                    from: 'Goods',
                    localField: '_id',
                    foreignField: 'category_id',
                    as: 'quantity'
                }
            },
            {
                $project: {
                    '_id': 1,
                    'categoryName': 1,
                    'icon': 1,
                    'quantity': { $size: '$quantity' }
                }
            }
        ])
        // 获取数据库里分类有多少条数据
        const total = await db.countDocuments()
        return { categoryData: res, total }
    }
}

module.exports = CategoryService;