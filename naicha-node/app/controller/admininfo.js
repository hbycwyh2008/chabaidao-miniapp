'use strict';

const Controller = require('egg').Controller;

class AdmininfoController extends Controller {
    // 注册商家账号post
    async adminRegister() {
        const { ctx, service } = this
        const { phone, password } = ctx.request.body
        ctx.validate({
            phone: { type: 'adminPhone', tips: '手机号码格式不正确' },
            password: { type: 'adminPassword', tips: '密码需要6-8位的子母和数字组成' }
        }, ctx.request.body)
        const res = await service.admininfo.adminRegister(phone, password)
        ctx.send([], res.code, res.msg)
    }
    // 登录管理员账号post
    async adminLogin() {
        const { ctx, service } = this
        const { phone, password } = ctx.request.body
        ctx.validate({
            phone: { type: 'adminPhone', tips: '手机号码格式不正确' },
            password: { type: 'adminPassword', tips: '密码需要6-8位的子母和数字组成' }
        }, ctx.request.body)
        const { data, msg, code } = await service.admininfo.adminLogin(phone, password)
        ctx.send(data, code, msg)
    }
    // 更新logo:post
    async uploadLogo() {
        const { ctx, service } = this
        const { value } = ctx.request.body
        ctx.validate({ value: { type: 'nullValue', tips: '请上传logo' } }, ctx.request.body)
        await ctx.model.Admininfo.findOneAndUpdate({ adminUid: ctx.auth.uid }, { logo: value })
        ctx.send()
    }
    // 更新店铺名称:post
    async uploadTradeName() {
        const { ctx, service } = this
        const { value } = ctx.request.body
        ctx.validate({ value: { type: 'nullValue', tips: '请上传店铺名称' } }, ctx.request.body)
        await ctx.model.Admininfo.findOneAndUpdate({ adminUid: ctx.auth.uid }, { tradeName: value })
        ctx.send()
    }
    // 更新店铺介绍:post
    async uploadShopIntroduction() {
        const { ctx, service } = this
        const { value } = ctx.request.body
        ctx.validate({ value: { type: 'nullValue', tips: '请上传店铺介绍' } }, ctx.request.body)
        await ctx.model.Admininfo.findOneAndUpdate({ adminUid: ctx.auth.uid }, { shopIntroduction: value })
        ctx.send()
    }
    // 更新店铺营业时间:post
    async uploadBusinessHours() {
        const { ctx, service } = this
        const { time } = ctx.request.body
        ctx.validate({ time: { type: 'isArray', tips: '请设置营业时间' } }, ctx.request.body)
        await ctx.model.Admininfo.findOneAndUpdate({ adminUid: ctx.auth.uid },
            { $set: { businessHours: time } })
        ctx.send()
    }
    // 更新外卖起送价:post
    async uploadInitialprice() {
        const { ctx, service } = this
        const { value } = ctx.request.body
        ctx.validate({ value: { type: 'nullValue', tips: '请设置起送价' } }, ctx.request.body)
        await ctx.model.Admininfo.findOneAndUpdate({ adminUid: ctx.auth.uid }, { initialPrice: value })
        ctx.send()
    }
    // 更新店铺地址:post
    async uploadAddress() {
        const { ctx, service } = this
        const { address, location } = ctx.request.body
        ctx.validate({
            address: { type: 'nullValue', tips: '请设置店铺地址' },
            location: { type: 'isArray', tips: '请设置店铺地址' }
        },
            ctx.request.body)
        await ctx.model.Admininfo.findOneAndUpdate({ adminUid: ctx.auth.uid },
            { address, $set: { location } })
        ctx.send()
    }

}

module.exports = AdmininfoController;
