// 管理员商家信息
module.exports = app => {
    const mongoose = app.mongoose
    mongoose.pluralize(null)//去掉集合后面的s
    const Schema = mongoose.Schema;
    const AdminSchema = new Schema({
        logo: {//Logo
            type: String,
            default: ''
        },
        tradeName: {//店铺名称
            type: String,
            default: ''
        },
        account: {//账号
            type: String,
            required: true,
            trim: true,//去掉空格
        },
        password: {//密码，加密
            type: String,
            required: true,
            select: false,//私密
        },
        address: {//商家详细地址
            type: String,
            default: ''
        },
        location: {//经纬度
            type: [Number],
            default: []
        },
        adminUid: {//唯一标识uid
            type: String,
            unique: true,
            default: () => new Date().getTime()
        },
        shopIntroduction: {//店铺介绍
            type: String,
            default: ''
        },
        initialPrice: {//起送价
            type: Number,
            default: 0
        },
        businessHours: {//营业时间
            type: [String],
            default: []
        }
    }, { versionKey: false })
    return mongoose.model('Admininfo', AdminSchema)
}