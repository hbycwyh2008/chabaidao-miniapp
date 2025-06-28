'use strict';

const Controller = require('egg').Controller;

class ChatController extends Controller {
    // 接收用户端传来的消息
    async userMessage() {
        const { ctx, app } = this
        const message = ctx.args[0]
        console.log('用户发来消息' + JSON.stringify(message));
        // 发送给后台管理
        app.io.to('adminRoom').emit('adminchat', message)
    }
    // 接收后台管理发来的消息
    async adminMessage() {
        const { ctx, app } = this
        const message = ctx.args[0]
        console.log('后台管理发来消息' + JSON.stringify(message));
        // 发送给小程序端用户
        app.io.to(message.userid).emit('wxchat', message)
    }
}

module.exports = ChatController;