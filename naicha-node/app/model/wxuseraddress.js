module.exports = app => {
    const mongoose = app.mongoose;
    mongoose.pluralize(null)//去掉集合后面的s
    const Schema = mongoose.Schema;
    const WxuseraddressSchema = new Schema({
        userOpenid: {//关联用户的openid
            type: String,
            required: true,
            ref: 'Wxuserinfo',
            localField: 'userOpenid',
            foreignField: 'openid'
        },
        name: {//姓名
            type: String,
            required: true
        },
        mobile: {//手机号码
            type: String,
            required: true
        },
        address: {//省市区地址
            type: String,
            required: true
        },
        detailedAddress: {//详细地址
            type: String,
            required: true
        },
        defaultAddress: {//默认收货地址
            type: Boolean,
            default: false
        }
    }, { versionKey: false })
    return mongoose.model('Wxuseraddress', WxuseraddressSchema)
}