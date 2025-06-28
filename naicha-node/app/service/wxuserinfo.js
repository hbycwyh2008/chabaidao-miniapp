'use strict';

const Service = require('egg').Service;
const qs = require('querystring')
const axios = require('axios')

class WxuserinfoService extends Service {
    // 小程序用户登录
    async wxLogin(code) {
        const jscode2session = 'https://api.weixin.qq.com/sns/jscode2session?'
        const param = qs.stringify({
            appid: this.app.config.wxAppid.appid,
            secret: this.app.config.wxAppid.secret,
            js_code: code,
            grant_type: 'authorization_code'
        })
        const res = await axios.get(jscode2session + param)
        const db = this.ctx.model.Wxuserinfo
        const userInfo = await db.find({ openid: res.data.openid }, { openid: false }).lean()
        if (userInfo.length > 0) {//已有用户信息
            const token = { user_Token: this.ctx.generateToken(res.data.openid) }
            return { ...userInfo[0], ...token }
        } else {
            const uploadUser = await db.create({ openid: res.data.openid })
            return {
                avatar: uploadUser.avatar,
                nickname: uploadUser.nickname,
                user_Token: this.ctx.generateToken(res.data.openid),
                _id: uploadUser._id
            }
        }
    }
}

module.exports = WxuserinfoService;