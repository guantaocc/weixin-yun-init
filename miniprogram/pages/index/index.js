// echarts
import * as echarts from '../../components/ec-canvas/echarts'
import Dialog from '@vant/weapp/dialog/dialog';

import geoJson from '../../constants/china';
echarts.registerMap('china', geoJson);


function initOption(data) {
  return {
    tooltip: {
      trigger: 'item',
      formatter: '本校学生:{c0}'
    },
    position: 'bottom',
    visualMap: {
      show: true,
      type: 'piecewise',
      min: 0,
      max: 2000,
      align: 'left',
      top: '66%',
      left: 0,
      left: 'auto',
      inRange: {
        color: [
          '#ffc0b1',
          '#ff8c71',
          '#ef1717',
          '#9c0505'
        ]
      },
      pieces: [{
          min: 1000
        },
        {
          min: 500,
          max: 999
        },
        {
          min: 100,
          max: 499
        },
        {
          min: 10,
          max: 99
        },
        {
          min: 1,
          max: 9
        }
      ],
      orient: 'vertical',
      showLabel: true,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        fontSize: 10
      }
    },
    series: [{
      left: 'center',
      type: 'map',
      name: '人数',
      label: {
        show: true,
        position: 'inside',
        fontSize: 6
      },
      mapType: 'china',
      data: data.data,
      zoom: 1.2,
      roam: false,
      showLegendSymbol: false,
      emphasis: {},
      rippleEffect: {
        show: true,
        brushType: 'stroke',
        scale: 2.5,
        period: 4
      }
    }]
  }
}

Page({
  data: {
    active: 0,
    current: 0,
    cardCur: 0,
    rumors: ['../../images/1.jpg', '../../images/2.jpg', '../../images/3.jpg'],
    ec: {
      // 懒加载
      lazyload: true,
      // 页面滚动
      // disableTouch: true
    },
    ecLoading: true,
    // 弹窗切换 canvas层级
    echartsImg: '',
    showEchartsImg: false,
    mapData: []
  },
  onLoad() {
    const self = this
    wx.request({
      url: 'https://lab.isaaclin.cn/nCoV/api/rumors',
      success(res) {
        self.setData({
          rumors: res.data.results
        })
      }
    })
  },
  onReady() {
    wx.cloud.callFunction({
      name: 'getArea'
    }).then(res => {
      let result = res.result
      this.setData({
        mapData: result
      })
      this.initMap()
    })
  },
  initMap() {
    // 加载地图数据
    this.ecComponent = this.selectComponent('#mychart-dom-bar');
    let option = initOption(this.data.mapData)
    this.ecComponent.init((canvas, width, height) => {
      // 获取组件的 canvas、width、height 后的回调函数
      // 在这里初始化图表
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height
      });
      chart.setOption(option)
      canvas.setChart(chart);
      // 将图表实例绑定到 this 上，可以在其他成员函数（如 dispose）中访问
      this.chart = chart;
      if (!this.echartsImg) {
        this.save()
      }
      this.setData({
        ecLoading: false
      })
      return chart;
    });
  },
  save() {
    return new Promise((resolve) => {
      const ecComponent = this.selectComponent('#mychart-dom-bar');
      ecComponent.canvasToTempFilePath({
        success: res => {
          console.log(res)
          this.setData({
            echartsImg: res.tempFilePath
          })
          resolve()
        }
      })
    })
  },
  changeIndex(e) {
    this.setData({
      active: e.detail.current
    })
  },
  cardSwiper(e) {
    this.setData({
      cardCur: e.detail.current
    })
  },
  // 登录
  skipForm(e) {
    console.log('res', e)
    let userInfo = e.detail.userInfo || {}
    wx.cloud.callFunction({
      name: 'login',
      data: {
        user: {},
        userInfo: userInfo
      }
    }).then(res => {
      this.switchCanvasImage(true)
      Dialog.alert({
        title: '标题',
        message: JSON.stringify(res.result),
      }).then(() => {
        // on close
        this.switchCanvasImage(false)
      });
    })
  },
  // 切换canvas显示问题
  switchCanvasImage(bool) {
    this.setData({
      showEchartsImg: bool
    })
    if (!bool) {
      setTimeout(() => {
        this.initMap()
      }, 200);
    }
  }
})