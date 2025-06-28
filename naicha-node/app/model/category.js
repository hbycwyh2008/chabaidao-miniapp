module.exports = app => {
    const mongoose = app.mongoose;
    mongoose.pluralize(null)//去掉集合后面的s
    const Schema = mongoose.Schema;
    const CategorySchema = new Schema({
        categoryName: {//分类名
            type: String,
            required: true
        },
        icon: {//图标
            type: String,
            required: true
        }
    }, { versionKey: false })
    return mongoose.model('Category', CategorySchema)
}