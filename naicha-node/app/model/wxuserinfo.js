module.exports = app => {
    const mongoose = app.mongoose;
    mongoose.pluralize(null)//去掉集合后面的s
    const Schema = mongoose.Schema;
    const WxuserinfoSchema = new Schema({
        avatar: {//头像
            type: String,
            default: 'https://kecheng-chabaidao.oss-cn-hangzhou.aliyuncs.com/kecheng/therr/logo.png'
        },
        nickname: {//昵称
            type: String,
            default: '茶百道用户'
        },
        openid: String//用户唯一标识openid
    }, { versionKey: false })
    return mongoose.model('Wxuserinfo', WxuserinfoSchema)
}