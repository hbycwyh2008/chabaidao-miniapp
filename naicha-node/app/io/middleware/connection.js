const basiAuth = require('basic-auth')
const jwt = require('jsonwebtoken');

module.exports = (app) => {
    return async (ctx, next) => {
        const { socket } = ctx
        const socketQuery = socket.handshake.query
        // 验证
        const token = basiAuth({ headers: { authorization: socketQuery.authorization } })
        if (!token) {
            throw new Error(401)
        }
        try {
            jwt.verify(token.name, ctx.app.config.jwt.secret)
        } catch (error) {
            if (error.name == 'TokenExpiredError') {
                throw new Error(401)
            }
            throw new Error(401)
        }
        // 连接上给每个用户返回一段文本
        if (socketQuery.clientType === 'USER') {
            const db = ctx.model.Admininfo
            const res = await db.find().lean()
            const msg = {
                message: "请问有什么可以帮助你的",
                messagetype: '001',//001代表后台管理员，002表示用户
                avatar: res[0].logo,
                nickname: '',
                userid: ''//每个成员的唯一id
            }
            socket.emit('wxchat', msg)//emit:发送消息
        }
        // 根据角色加入不同的房间
        if (socketQuery.clientType === 'ADMIN') {
            socket.join('adminRoom')
        } else {
            socket.join(socketQuery.userid)
        }
        await next()
    }
}