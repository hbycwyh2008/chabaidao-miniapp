import { defineStore } from 'pinia'
import type {CartItem,ReceiverAddress} from '@/types/cart'
import Decimal from 'decimal.js';

// 购物车的数据仓库
export const getCartStatus = defineStore('shoppingcart',{
    state:()=>({
        cartItems:[] as CartItem[]
    }),
    getters:{
        // 计算购物车里的合计总价
        paymentPrice():number{
            const res = this.cartItems.reduce((subtotal,goodsItem)=>subtotal + goodsItem.totalPrice,0)
            return Number(new Decimal(res).toFixed(2))
        },
        // 计算购物车里有多少商品
        getCartCount():number{
            const res = this.cartItems.reduce((subtotal,goodsItem)=>subtotal + goodsItem.goodsQuantity,0)
            return res
        }
    },
    actions:{
        // 商品详情页里提交商品到购物车
        addToCart(item:CartItem){
            // 判断是否有重复商品提交，如果是的话，那么只更新数量和总价
            const existingItem = this.cartItems.find((cartItem)=>{
                return cartItem.goods_id === item.goods_id && item.sku_id === cartItem.sku_id
            })
            if(existingItem){
                //商品重复，更新数量和总价，需要注意如果是首页提交的无规格商品不用+=
                if(item.homePage){
                    existingItem.goodsQuantity = item.goodsQuantity
                }else{
                    existingItem.goodsQuantity += item.goodsQuantity
                }
                const num1 = new Decimal(existingItem.goodsPrice)
                const num2 = new Decimal(existingItem.goodsQuantity)
                const totalPrice = Number(num1.times(num2).toString())
                existingItem.totalPrice =totalPrice
            }else{
                // 计算总价
                const num1 = new Decimal(item.goodsPrice)
                const num2 = new Decimal(item.goodsQuantity)
                const totalPrice = Number(num1.times(num2).toString())
                item.totalPrice = totalPrice
                this.cartItems.push(item)
            }
        },
        // 找出购物车里的数量为0的商品将它删除
        removeEmptyArrays(){
            this.cartItems.forEach((item,index)=>{
                if(item.goodsQuantity === 0){
                    this.cartItems.splice(index,1)
                }
            })
        }
    }
})

//点击首页的轮播推荐商品跳转到点单页面，找到该商品去下单
interface Goodsis{
    categoryId:string
    goodsId:string
}
export const pageGoodsId = defineStore('pageGoodsId',{
    state:()=>({
        goodsId:[] as Goodsis[]
    }),
    actions:{
        uploadGoodsId(item:Goodsis){
            this.goodsId = [item]
        }
    }
})

// 存储首页用户选择的下单类型
export const pagePlaceOrder = defineStore('pagePlaceOrder',{
    state:()=>({
        orderType:'002'//002默认外卖
    })
})

// 存储用户选中的收货地址
export const receiverAddress = defineStore('receiverAddress',{
    state:()=>({
        addressItems:[] as ReceiverAddress[]
    }),
    actions:{
        uploadAddress(item:ReceiverAddress){
            this.addressItems = [item]
        }
    }
})