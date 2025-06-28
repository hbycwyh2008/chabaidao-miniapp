'use strict';

const Service = require('egg').Service;
const crypto = require('crypto')

class AdmininfoService extends Service {
    // 注册商家账号
    async adminRegister(account, password) {
        // 判断是否已存在商家账号
        const db = this.ctx.model.Admininfo
        const res = await db.find({ account })
        if (res.length > 0) {
            return { msg: '账号已经存在', code: 202 }
        } else {
            //创建哈希对象
            const hash = crypto.createHash('sha256').update(password)
            // 生成哈希值
            const passwordHash = hash.digest('hex')
            await db.create({ account, password: passwordHash })
            return { msg: 'SUCCESS', code: 200 }
        }
    }
    // 登录管理员账号
    async adminLogin(account, password) {
        //创建哈希对象
        const hash = crypto.createHash('sha256').update(password)
        // 生成哈希值
        const passwordHash = hash.digest('hex')
        const db = this.ctx.model.Admininfo
        const res = await db.find({ account, password: passwordHash },
            { account: false, location: false }
        ).lean()
        if (res.length > 0) {
            const token = { admin_Token: this.ctx.generateToken(res[0].adminUid) }
            return {
                data: { ...res[0], ...token },
                msg: 'SUCCESS',
                code: 200
            }
        } else {
            return { data: [], msg: '账号或者密码错误', code: 422 }
        }
    }
}

module.exports = AdmininfoService;