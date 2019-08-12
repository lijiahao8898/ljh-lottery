# Lottery

基于的GB-canvas-turntable的抽奖插件再改造。

感谢GB，原代码地址 [https://github.com/givebest/GB-canvas-turntable](https://github.com/givebest/GB-canvas-turntable)

### 转盘样式计算

因为转盘的效果使用了canvas。为了避免出现锯齿现象，将canvas的画布大小设置为 `800` (双倍大小能解决在H5端的锯齿现象)
并且将转盘 `gb-turntable` 设置为画布的1/2也就是 `400px`。

其中有些样式是要根据相关计算所得:

以`gb-turntable = 400px`为例

1. 将`.gb-turntable-item .gb-turntable-block`的`transform-origin`设置为原来的1/2

```css
.gb-turntable-item .gb-turntable-block{
    -webkit-transform-origin: 50% 200px;
    -ms-transform-origin: 50% 200px;
    transform-origin: 50% 200px
}
```
`transform-origin`: 设置旋转元素的基点位置

语法: `transform-origin: x-axis y-axis z-axis`;

```
x-axis: 定义视图被置于 X 轴的何处。可能的值：
        left
        center
        right
        length
        %

y-axis: 定义视图被置于 Y 轴的何处。可能的值：
        top
        center
        bottom
        length
        %

z-axis: 定义视图被置于 Z 轴的何处。可能的值：
        length
```

2. 设置指针的位置. 指针的位置为(转盘的大小`400px` - 指针的大小`80px`) / 2 = 160px

```css
.gb-turntable-btn {
       left: 160px;
       top: 160px;
}
```

3. 在 `gbturntable.js` 里面设置画的canvas的大小为原来的1/2.

```js
  // 位移到圆心，下面需要围绕圆心旋转
  ctx.translate(400, 400);

  // 绘制圆弧
  ctx.arc(0, 0, 400, 0, 2 * Math.PI / num, false);
```

4. 使用代码
```js
document.addEventListener('DOMContentLoaded', function () {
        // 获取奖品信息
        var arr = [{
               name: '谢谢参与',
               type: 6,
               id: 1,
               imageUrl: 'http://img.mockuai.com/tms/2017/4/20/upload_9b73f3df2c0fcf25f96c77baf45b40c0.png'
           }, {
               name: 'KC Masterpiece烧烤酱 3瓶',
               imageUrl: 'http://img.haimibuy.com/uploads/images/2016/10/31/a5816acbfe010a.jpg',
               imageUrlWrapper: './images/tableware.png',
               type: 7,
               level: 7,
               id: 7,
               sku_uid: '38699_67540',
               item_uid: '38699_164711',
               item_type: 1
           }, {
               name: '积分',
               imageUrl: 'http://img.mockuai.com/tms/2017/4/10/upload_2375470d54275f27d23d6b4f91459ff0.png',
               type: 1,
               prizeValue: 300,
               id: 3
           }, {
               name: '现金',
               imageUrl: 'http://img.mockuai.com/tms/2017/4/20/upload_2a1cb4d92c032f2beceb2068f538f1ed.png',
               type: 4,
               prizeValue: 6,
               id: 4
           }, {
               name: '优惠券',
               imageUrl: 'http://img.mockuai.com/tms/2017/4/10/upload_01686a17e5948d64da7cee3c5c84cd3f.png',
               type: 3,
               prizeValue: 5,
               id: 5
           }, {
               name: '余额',
               imageUrl: 'http://img.mockuai.com/tms/2017/4/10/upload_0cf9e4de7e1d88874a3cc23997aa4347.png',
               type: 2,
               prizeValue: 6,
               id: 6
           }, {
               name: 'KC Masterpiece烧烤酱 2瓶',
               imageUrl: 'http://img.haimibuy.com/uploads/images/2016/10/31/a5816acbfe010a.jpg',
               imageUrlWrapper: './images/tableware.png',
               type: 5,
               level: 7,
               id: 7,
               sku_uid: '38699_67540',
               item_uid: '38699_164711',
               item_type: 1
           }, {
               name: '谢谢参与',
               type: 6,
               id: 8,
               imageUrl: 'http://img.mockuai.com/tms/2017/4/20/upload_9b73f3df2c0fcf25f96c77baf45b40c0.png'
           }];
        gbTurntable.init({
            id: 'turntable',
            circleWidth: 400,
            auto: true,                                 // 是否自动触发中奖结果 true 自动触发 false 需要手动点击奖品进行自行选择
            backgroundColor: '#fe6869/#ff8a88',         // 转盘间隔色
            bulb: {
                needBulb: true,                         // 开关
                color: '#f9ffe3/#ffe176',               // 灯泡间隔色
                interval: 300                           // 时间间隔
            },
            line: {                                     // 边框
                needLineWidth: true,                    // 开关
                width: 2,                               // 边框大小
                color: 'red'                            // 边框颜色
            },
            config: function (callback) {
                callback && callback(arr);
            },
            getPrize: function (callback) {
                // 获取中奖信息
                var num = Math.random() * 6 >>> 0,   //奖品ID
                    chances = num;  // 可抽奖次数
                callback && callback([num, chances]);
            },
            gotBack: function (data) {
                alert('恭喜抽中' + data.name || '未知奖品');
            }
        });
    }, false);
```

### options
```js
gbTurntable.init({
            id: 'turntable',                            // id
            circleWidth: 400,                           // canvas画的圆的大小
            auto: true,                                 // 是否自动触发中奖结果 true 自动触发 false 需要手动点击奖品进行自行选择
            backgroundColor: '#fe6869/#ff8a88',         // 转盘间隔色
            bulb: {
                needBulb: true,                         // 开关
                color: '#f9ffe3/#ffe176',               // 灯泡间隔色
                interval: 300                           // 时间间隔
            },
            line: {                                     // 边框
                needLineWidth: true,                    // 开关
                width: 2,                               // 边框大小
                color: 'red'                            // 边框颜色
            },
            config: function (callback) {
                callback && callback(arr);
            },
            getPrize: function (callback) {
                // 获取中奖信息
                var num = Math.random() * 6 >>> 0,   //奖品ID
                    chances = num;  // 可抽奖次数
                callback && callback([num, chances]);
            },
            gotBack: function (data) {
                alert('恭喜抽中' + data.name || '未知奖品');
            }
        });
```

### 需要实现的功能
* ~~自定义闪光小点点的问题~~
* 自定义转盘的大小
* 自定义转盘指正的图片
* ~~自定义转盘的背景色~~
* 自定义转盘的先调颜色
* 转盘转动的方式：转盘转动还是指针转动
* 自定义转盘的速度
* 同时生成多个转盘
* ~~触发结果可配置（自动触发、手动触发）~~

### 问题
1. 游览器嗅探不兼容 - Android原生的webView ( 暂时性处理代码不雅观 )
2. 游览器嗅探不兼容 - 抽奖的动画不兼容 低版本ios8.6以下 ( 暂时性处理代码不雅观 )
3. canvas锯齿状问题 - 2倍画布大小
