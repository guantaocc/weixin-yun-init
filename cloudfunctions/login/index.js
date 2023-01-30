// 云函数模板
const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database().collection('user')

exports.main = async (event, context) => {
  // 获取 WX Context (微信调用上下文)，包括 OPENID、APPID、及 UNIONID（需满足 UNIONID 获取条件）等信息
  const wxContext = cloud.getWXContext()
  const { OPENID } = wxContext
  let result = await db.where({
    openid: OPENID
  }).get()

  // 如果在数据库没找到该用户，则初始化数据后存入
  if(result.data.length === 0){
    Object.assign(event.user, event.userInfo, { openid: OPENID})
    event.user.isPut = false
    event.user.isHot = 0
    event.user.passCity = []
    await db.add({
      data:event.user
    })
  }
  return result
}

