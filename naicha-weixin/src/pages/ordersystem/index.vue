<template>
    <!-- // 顶部区域子组件 -->
  <Toparea :distance="merchantDistance.distance" />
  <!-- 点单界面 -->
  <view class="order-menu">
    <!-- 左边 -->
    <scroll-view class="scroll-height-left" scroll-y enhanced enable-passive :show-scrollbar="false">
      <view class="left-goods" v-for="(item,index) in allGoods" :key="index" :class="{activeStyle:index === dynamiIndex}" @click="anchorConnection(item._id,index)">
        <image :src="item.icon" mode="widthFix"/>
        <text>{{ item.categoryName }}</text>
      </view>
    </scroll-view>
    <!-- 右边 -->
    <scroll-view scroll-y enhanced enable-passive :show-scrollbar="false" class="scroll-height-right" :scroll-into-view="subElementId" @scroll="scrollHeight">
      <view class="item-goods" v-for="(item,index) in allGoods" :key="index" :id="`A${item._id}`">
        <text class="category-title">{{ item.categoryName }}</text>
        <view class="goods-infor" v-for="(item_a,index_a) in item.category" :key="index_a" @click="selectGoods(index,index_a,item._id,item_a._id)">
          <image :src="item_a.goods_image" mode="aspectFill" />
          <view class="product-name">
            <text class="googs-name">{{ item_a.goods_name }}</text>
            <text class="googs-intro overflow-text">{{ item_a.goods_describe }}</text>
            <view class="select-goods">
              <view class="goods-price">
                <text>¥{{ item_a.goods_price }}</text>
                <text>起</text>
              </view>
              <block v-if="item_a.goods_stock > 0">
                <view class="select-quantity" v-if="item_a.goods_stats.length > 0">
                  <button>选规格</button>
                  <text v-if="item_a.quantity > 0">{{ item_a.quantity }}</text>
                </view>
                <view v-else class="select-goods single-goods">
                  <image src="/static/jian-goods.png" mode="widthFix" v-if="item_a.quantity > 0" @click.stop="addSingleProduct(index,index_a,item._id,item_a._id,'001')"/>
                  <text v-if="item_a.quantity > 0">{{ item_a.quantity }}</text>
                  <image src="/static/jia-goods.png" mode="widthFix" @click.stop="addSingleProduct(index,index_a,item._id,item_a._id,'002')"/>
                </view>
              </block>
              <view v-else>
                <button disabled>已售罄</button>
              </view>
            </view>
          </view>
        </view>
      </view>
      <view style="height: 400rpx;"></view>
    </scroll-view>
  </view>
  <!-- 购物车子组件 -->
  <ShoppingCart />
</template>

<script setup lang='ts'>
    // 顶部区域子组件
    import Toparea from './components/top-area.vue'
    // 购物车子组件
    import ShoppingCart from './components/shopping-cart.vue'
    import {ref,watch} from 'vue'
    import {onLoad} from '@dcloudio/uni-app'
    import {request} from '@/api/request'
    import type {Distance,AllGoods} from '@/types/ordersystem'
    import type{CartItem} from '@/types/cart'
    import {getCartStatus,pageGoodsId} from '@/store/index'
    const cartStore = getCartStatus()
    //#region 
    onLoad(()=>{
      locate()
    })

    // 定位
    function locate(){
      uni.getLocation({
        type:'wgs84',
        success:res=>{
          rangeQuery(res.latitude,res.longitude)
          allGoodsData()
        },
        fail:err=>{
          console.log(err);
          locationHint()
        }
      })
    }
    // 提示必须定位
    function locationHint(){
      uni.showModal({
        title:'地址位置未授权',
        content:'请开启定位才可以下单',
        success:res=>{
          uni.openSetting({
            success:setRes=>{
              if(setRes.authSetting['scope.userLocation']){
                locate()
              }else{
                locationHint()
              }
            }
          })
        }
      })
    }
    // 计算距离
    const merchantDistance = ref({distance:''})
    async function rangeQuery(latitube:number,longitude:number){
      const res = await request<Distance>('/distance-calculator',{latitube,longitude})
      merchantDistance.value.distance = res.data.distance
    }

    // 获取所有分类和商品
    const allGoods = ref<AllGoods[]>([])
    async function allGoodsData(){
      const res = await request<AllGoods[]>('/all-goods')
      console.log(res)
      allGoods.value = res.data
      setTimeout(()=>{itemGoodsHeight()},900)
    }
    // 计算右边每个分类高度
    const itemHeight = ref<number[]>([])
    function itemGoodsHeight(){
      let totalHeight = 0
      const query = uni.createSelectorQuery()
      query.selectAll('.item-goods').boundingClientRect()
      query.exec((heightData:{height:number}[][])=>{
        heightData[0].forEach(item=>{
          totalHeight += item.height
          itemHeight.value.push(totalHeight)
        })
      })
    }
    // 点击左边分类滚动到指定的商品
    const dynamiIndex = ref(0)
    const subElementId = ref('')
    function anchorConnection(id:string,index:number){
      dynamiIndex.value = index
      subElementId.value = `A${id}`
      setTimeout(()=>{subElementId.value = ''},200)
    }
    // 右边商品滚动时触发
    function scrollHeight(event:{detail:{scrollTop:number}}){
      const scrollTop = event.detail.scrollTop
      if(scrollTop >= itemHeight.value[dynamiIndex.value]){
        dynamiIndex.value += 1
      }else if(scrollTop < itemHeight.value[dynamiIndex.value - 1]){
        dynamiIndex.value -= 1
      }
    }
    // 点击每一个商品进入详情页
    function selectGoods(index:number,index_a:number,fatherId:string,sonId:string){
      const theGoods = allGoods.value[index].category[index_a]
      const str = JSON.stringify({theGoods,fatherId,sonId})
      uni.navigateTo({
        url:'/pages/specifications/index?goods=' + str
      })
    }
    // 对没有规格的商品加减数量到购物车
    function addSingleProduct(index:number,index_a:number,fatherId:string,sonId:string,type:string){
      if(type == '001'){
        allGoods.value[index].category[index_a].quantity--
      }else{
        allGoods.value[index].category[index_a].quantity++
      }
      const theGoods = allGoods.value[index].category[index_a]
      const item:CartItem = {
          fatherId,
          sonId,
          goods_name:theGoods.goods_name,
          goods_image:theGoods.goods_image,
          goods_id:theGoods._id,
          goodsPrice:theGoods.goods_price,
          goodsQuantity:theGoods.quantity,
          totalPrice:0,
          sku:[],
          skuIdArr:[],
          sku_id:'',
          homePage:true
      }
      getCartStatus().addToCart(item)
    }
    // 监听购物车中发生变化的数据（加减了某一个商品），从而取出下标更新当前页面的商品数量
    watch(()=>cartStore.cartItems.map(item=>item.goodsQuantity),
      (newVal,oldVal):void=>{
        for(let i= 0; i<newVal.length; i++){
          if(newVal[i] !== oldVal[i]){
            var changedItem = cartStore.cartItems[i]
          }
        }
        // 这里找出相同的商品来，取出父级id和子级id，出现相同id不同sku的商品数量要合并
        if(cartStore.cartItems.length <= 0)return
        let goodsprice= 0
        let fatherId = ''
        let sonId = ''
        cartStore.cartItems.forEach(item=>{
          if(changedItem && item.goods_id === changedItem.goods_id){
            goodsprice += item.goodsQuantity
            fatherId = item.fatherId
            sonId = item.sonId
          }
        })
        // 根据当前点击的商品的父级id和子级id查找下标
        let parentIndex = allGoods.value.findIndex(item=>item._id === fatherId)
        if(parentIndex >= 0){
          const category = allGoods.value[parentIndex].category
          const childIndex = category.findIndex(item=>item._id === sonId)
          // 更新对应的商品数量
          // @ts-ignore
          allGoods.value[parentIndex].category[childIndex].quantity = goodsprice
        }
      }
    )
    // 监听如果清空购物车，那么将当前页面allGoods里的商品数量全部归零
    watch(()=>cartStore.cartItems,(newVal)=>{
      if(newVal.length <= 0){
        if(allGoods.value.length > 0){
          allGoods.value.forEach(item=>{
            item.category.forEach(item_a=>item_a.quantity = 0)
          })
        }
      }
    })
    //#endregion

    // 点击首页的轮播推荐商品跳转到点单页面，找到该商品去下单
    watch([()=>pageGoodsId().goodsId,itemHeight],([goodsId,itemHeight])=>{
      if(goodsId.length > 0 && itemHeight.length > 0){
        // 父级下标
        const parentIndex = allGoods.value.findIndex(item=>item._id === goodsId[0].categoryId)
        if(parentIndex >= 0){
          // 子级下标
          const category = allGoods.value[parentIndex].category
          const childIndex = category.findIndex(item=>item._id === goodsId[0].goodsId)
          selectGoods(parentIndex,childIndex,goodsId[0].categoryId,goodsId[0].goodsId)
        }
      }
    },{deep:true})
</script>

<style>
    /* 点餐区域 */
.order-menu{
  display: flex;
}
/* 左边商品分类滚动 */
.scroll-height-left{
  height: 100vh;
  width: 175rpx;
  background-color: #f8f8f8;
  position: fixed;
  left: 0;
}
.left-goods{
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 25rpx;
  padding: 15rpx 0;
}
.left-goods image{
  width: 65rpx;
}
.left-goods title{
  padding-top: 10rpx;
  color: #777777;
}
.activeStyle{
  background-color: antiquewhite;
}
/* 右边商品 */
.scroll-height-right{
  flex: 1;
  padding: 0 20rpx;
  height: 100vh;
  position: fixed;
  right: 0;
  left: 175rpx;
  width: auto;
}
.item-goods{
  padding-top: 35rpx;
}
.category-title{
  font-weight: bold;
}
.goods-infor{
  display: flex;
  align-items: center;
  padding-top: 35rpx;
}
.goods-infor image{
  width: 170rpx;
  height: 170rpx;
  border-radius: 15rpx;
}
.product-name{
  flex: 1;
  padding-left: 15rpx;
}
.googs-name{
  font-weight: bold;
  font-size: 29rpx;
}
.googs-intro{
  line-height: 1.4;
  color: #b8b8b8;
  font-size: 25rpx;
  margin: 13rpx 0;
}
.select-goods{
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.goods-price{
  display: flex;
  flex: 1;
}
.goods-price text:nth-child(1){
  font-size: 30rpx;
  font-weight: bold;
  padding-right: 10rpx;
}
.goods-price text:nth-child(2){
  font-size: 24rpx;
  color: #b8b8b8;
  align-self: flex-end;
}
.select-quantity{
  position: relative;
}
.select-quantity button{
  font-size: 28rpx;
  line-height: inherit;
  background-color: #214bd5;
  color: #ffffff;
  padding: 5rpx 20rpx;
  border-radius: 40rpx;
}
.select-quantity text{
  position: absolute;
  top: -7rpx;
  right: 0;
  background: bisque;
  border-radius: 50%;
  width: 30rpx;
  height: 30rpx;
  font-size: 18rpx;
  text-align: center;
  line-height: 30rpx;
}
.single-goods image{
  width: 45rpx;
}
.single-goods text{
  font-size: 26rpx;
  width: 63rpx;
  text-align: center;
}
</style>