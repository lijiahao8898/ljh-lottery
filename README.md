# selfplugin-lottery

基于的GB-canvas-turntable的抽奖插件

感谢GB,原代码地址[https://github.com/givebest/GB-canvas-turntable](https://github.com/givebest/GB-canvas-turntable)

> 大专盘样式计算

因为大转盘的效果使用canvas画的.为了避免出现锯齿现象.将canvas的画布大小设置为`1200`
并且将转盘`gb-turntable`设置为画布的1/2也就是`600px`.
其中有些样式是要根据相关计算所得:
以`gb-turntable = 600px`为例:

1. 将`.gb-turntable-item .gb-turntable-block`的`transform-origin`设置为原来的1/2

```css
.gb-turntable-item .gb-turntable-block{
    -webkit-transform-origin: 50% 300px;
    -ms-transform-origin: 50% 300px;
    transform-origin: 50% 300px
}
```
transform-origin: 设置旋转元素的基点位置

语法: transform-origin: x-axis y-axis z-axis;

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

2. 设置指针的位置. 指针的位置为转盘的大小`600px` - 指针的大小`80px` / 2 = 260px

```
.gb-turntable-btn {
       left: 110px;
       top: 110px;
}
```

3. 在gbturntable.js 里面设置画的canvas的大小为原来的1/2.
```
  // 位移到圆心，下面需要围绕圆心旋转
  ctx.translate(600, 600);

  // 绘制圆弧
  ctx.arc(0, 0, 600, 0, 2 * Math.PI / num, false);
```


### 功能

### 需要实现的功能
* 自定义转盘的大小
* 自定义转盘指正的图片
* 自定义转盘的背景色
* 自定义转盘的先调颜色
* 转盘转动的方式：转盘转动还是指针转动
* 自定义转盘的速度
