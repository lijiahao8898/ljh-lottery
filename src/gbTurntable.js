/**
 * GB-canvas-turntable.js
 * @class gbTurntable
 * @see https://github.com/givebest/GB-canvas-turntable
 * @author givenlovs@msn.com
 * @(c) 2016
 **/


(function () {
    var $,
        ele,
        container,
        canvas,
        num,
        prizes,
        btn,
        deg = 0,
        fnGetPrize,
        fnGotBack,
        optsPrize;

    var cssPrefix,
        eventPrefix,
        vendors = {
            '': '',
            Webkit: 'webkit',
            Moz: '',
            O: 'o',
            ms: 'ms'
        },
        testEle = document.createElement('p'),
        cssSupport = {};

    // 嗅探特性
    Object.keys(vendors).some(function (vendor) {
        if (testEle.style[vendor + (vendor ? 'T' : 't') + 'ransitionProperty'] !== undefined) {
            cssPrefix = vendor ? '-' + vendor.toLowerCase() + '-' : '';
            eventPrefix = vendors[vendor];
            return true;
        }
    });

    /**
     * [兼容事件前缀]
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    function normalizeEvent(name) {
        return eventPrefix ? eventPrefix + name : name.toLowerCase();
    }

    /**
     * [兼容CSS前缀]
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    function normalizeCss(name) {
        name = name.toLowerCase();
        return cssPrefix ? cssPrefix + name : name;
    }

    cssSupport = {
        cssPrefix: cssPrefix,
        transform: normalizeCss('Transform'),
        transitionEnd: normalizeEvent('TransitionEnd'),
        webkitTransform: normalizeCss('-webkit-transform')
    };
    var transformStyle;
    var transitionEnd = cssSupport.transitionEnd;

    var Android = /android/i.test(navigator.userAgent);
    var ios = /ios/i.test(navigator.userAgent);
    // 兼容游览器嗅探不正确的问题
    if (Android) {
        // 安卓兼容
        transformStyle = cssSupport.webkitTransform;
    } else {
        transformStyle = cssSupport.transform;
    }

    // alert(transform);
    // alert(transitionEnd);

    function init(opts) {
        fnGetPrize = opts.getPrize;
        fnGotBack = opts.gotBack;

        opts.config(function (data) {
            prizes = opts.prizes = data;
            num = prizes.length;
            draw(opts);
        });

        events();
    }

    /**
     * @param  {String} id
     * @return {Object} HTML element
     */
    $ = function (id) {
        return document.getElementById(id);
    };

    /**
     * [绘制转盘]
     * @param  {String} id
     * @param  {Number} 奖品份数
     */
    function draw(opts) {
        opts = opts || {};
        if (!opts.id || num >>> 0 === 0) return;

        var id = opts.id,
            rotateDeg = 360 / num / 2 + 90,  // 扇形回转角度
            ctx,
            prizeItems = document.createElement('ul'), // 奖项容器
            turnNum = 1 / num,  // 文字旋转 turn 值
            html = [];  // 奖项

        ele = $(id);
        canvas = ele.querySelector('.gb-turntable-canvas');
        container = ele.querySelector('.gb-turntable-container');
        btn = ele.querySelector('.gb-turntable-btn');

        if (!canvas.getContext) {
            showMsg('抱歉！浏览器不支持。');
            return;
        }
        // 获取绘图上下文
        ctx = canvas.getContext('2d');

        for (var i = 0; i < num; i++) {
            // 保存当前状态
            ctx.save();
            // 开始一条新路径
            ctx.beginPath();
            // 位移到圆心，下面需要围绕圆心旋转
            ctx.translate(600, 600);
            // 从(0, 0)坐标开始定义一条新的子路径
            ctx.moveTo(0, 0);
            // 旋转弧度,需将角度转换为弧度,使用 degrees * Math.PI/180 公式进行计算。
            ctx.rotate((360 / num * i - rotateDeg) * Math.PI / 180);
            // 绘制圆弧
            ctx.arc(0, 0, 600, 0, 2 * Math.PI / num, false);
            //
            //var getRandomColor = function(){
            //
            //    return  '#' +
            //
            //        (function(color){
            //
            //            return (color +=  '0123456789abcdef'[Math.floor(Math.random()*16)])
            //
            //            && (color.length == 6) ?  color : arguments.callee(color);
            //
            //        })('');
            //
            //};
            //
            //ctx.fillStyle = getRandomColor();

            // 颜色间隔
            if (i % 2 == 0) {
                ctx.fillStyle = '#fe6869';
            } else {
                ctx.fillStyle = '#ff8a88';
            }

            // 填充扇形
            ctx.fill();
            // 绘制边框
            //ctx.lineWidth = 1;
            //ctx.strokeStyle = '#e4370e';
            //ctx.stroke();

            // 恢复前一个状态
            ctx.restore();

            // 奖项列表
            switch (opts.prizes[i].type) {
                case 1:
                    // 积分
                    html.push('<li class="gb-turntable-item">' +
                        '<div class="gb-turntable-block" style="' + transformStyle + ': rotate(' + i * turnNum + 'turn);transform: rotate(' + i * turnNum + 'turn);-webkit-transform: rotate(' + i * turnNum + 'turn)">' +
                        '<span>' + opts.prizes[i].prize_value + '积分</span>' +
                        '<img src="http://img.mockuai.com/tms/2017/4/20/upload_099474c1a35b4d522f715f2d671af1c0.png">' +
                        '</div>' +
                        '</li>');
                    break;
                case 2:
                    // 余额
                    html.push('<li class="gb-turntable-item">' +
                        '<div class="gb-turntable-block" style="' + transformStyle + ': rotate(' + i * turnNum + 'turn);transform: rotate(' + i * turnNum + 'turn);-webkit-transform: rotate(' + i * turnNum + 'turn)">' +
                        '<span>' + (opts.prizes[i].prize_value / 100).toFixed(2) + '元</span>' +
                        '<img src="http://img.mockuai.com/tms/2017/4/10/upload_0cf9e4de7e1d88874a3cc23997aa4347.png">' +
                        '</div>' +
                        '</li>');
                    break;
                case 3:
                    // 优惠券
                    html.push('<li class="gb-turntable-item">' +
                        '<div class="gb-turntable-block" style="' + transformStyle + ': rotate(' + i * turnNum + 'turn);transform: rotate(' + i * turnNum + 'turn);-webkit-transform: rotate(' + i * turnNum + 'turn)">' +
                        '<span>' + (opts.prizes[i].prize_value / 100).toFixed(2) + '元</span>' +
                        '<img src="http://img.mockuai.com/tms/2017/4/10/upload_01686a17e5948d64da7cee3c5c84cd3f.png">' +
                        '</div>' +
                        '</li>');
                    break;
                case 4:
                    // 现金
                    html.push('<li class="gb-turntable-item">' +
                        '<div class="gb-turntable-block" style="' + transformStyle + ': rotate(' + i * turnNum + 'turn);transform: rotate(' + i * turnNum + 'turn);-webkit-transform: rotate(' + i * turnNum + 'turn)">' +
                        '<span>' + (opts.prizes[i].prize_value / 100).toFixed(2) + '元</span>' +
                        '<img src="http://img.mockuai.com/tms/2017/4/20/upload_2a1cb4d92c032f2beceb2068f538f1ed.png">' +
                        '</div>' +
                        '</li>');
                    break;
                case 5:
                    // 商品
                    html.push('<li class="gb-turntable-item">' +
                        '<div class="gb-turntable-block" style="' + transformStyle + ': rotate(' + i * turnNum + 'turn);transform: rotate(' + i * turnNum + 'turn);-webkit-transform: rotate(' + i * turnNum + 'turn)">' +
                        '<span>' + (opts.prizes[i].item_short_name || opts.prizes[i].item_name) + '</span>' +
                        '<img src="' + opts.prizes[i].item_image_url + '">' +
                        '</div>' +
                        '</li>');
                    break;
                case 6:
                    // 未中奖
                    html.push('<li class="gb-turntable-item">' +
                        '<div class="gb-turntable-block" style="' + transformStyle + ': rotate(' + i * turnNum + 'turn);transform: rotate(' + i * turnNum + 'turn);-webkit-transform: rotate(' + i * turnNum + 'turn)">' +
                        '</span><span class="no-image">谢谢参与</span>' +
                        '<img src="http://img.mockuai.com/tms/2017/4/20/upload_9b73f3df2c0fcf25f96c77baf45b40c0.png">' +
                        '</div>' +
                        '</li>');
                    break
            }
            //html.push('<li class="gb-turntable-item"> <p style="' + transform + ': rotate(' + i * turnNum + 'turn)">' + opts.prizes[i] + '</p><img src="http://img.mockuai.com/tms/2017/3/31/upload_f94f81e85b3427ccaa2ef63f3c20ef01.png"> </li>');
            if ((i + 1) === num) {
                prizeItems.className = 'gb-turntalbe-list';
                container.appendChild(prizeItems);
                prizeItems.innerHTML = html.join('');
            }

            // 电灯泡
            var bulb = document.getElementById('draw-cycle');
            var li = document.querySelector('.gb-turntable-container');
            var div = document.createElement('div');
            if (!bulb) {
                insertAfter('div', li);
            }

        }

    }

    function insertAfter(newElement, targetElement) {
        var parent = targetElement.parentNode; // 找到指定元素的父节点
        if (parent.lastChild == targetElement) { // 判断指定元素的是否是节点中的最后一个位置 如果是的话就直接使用appendChild方法
            parent.appendChild(newElement, targetElement);
        } else {
            parent.insertBefore(newElement, targetElement.nextSibling);
        }
    }

    /**
     * [提示]
     * @param  {String} msg [description]
     */
    function showMsg(msg) {
        alert(msg);
    }

    /**
     * [初始化转盘]
     * @return {[type]} [description]
     */
    /*  function runInit() {
     removeClass(container, 'gb-run');
     container.style[transform] = 'rotate(0deg)';
     container.style[transform] = '';
     }*/

    /**
     * 旋转转盘
     * @param  {[type]} deg [description]
     * @return {[type]}     [description]
     */
    function runRotate(deg) {
        // runInit();

        // setTimeout(function() {
        // addClass(container, 'gb-run');transform
        container.style[transformStyle] = 'rotate(' + deg + 'deg)';
        container.style.webkitTransform = 'rotate(' + deg + 'deg)';
        container.style.transform = 'rotate(' + deg + 'deg)';
        // }, 10);
    }

    /**
     * 抽奖事件
     * @return {[type]} [description]
     */
    function events() {
        bind(btn, 'click', function () {
            /*      var prizeId,
             chances;*/

            addClass(btn, 'disabled');

            fnGetPrize(function (data) {
                optsPrize = {
                    prizeId: data[0],
                    chances: data[1]
                };
                // 计算旋转角度
                var parity = Math.round(10 * Math.random());
                deg = deg || 0;
                deg = deg + (360 - deg % 360) + (360 * 10 - data[0] * (360 / num));


                if (parity % 2 == 0) {
                    deg = (deg + (180 / num) * Math.random()) - ((180 / num) * 0.01);
                } else {
                    deg = (deg - (180 / num) * Math.random()) + ((180 / num) * 0.01);
                }
                console.log(num, deg);
                runRotate(deg);
            });

            // 中奖提示
            bind(container, transitionEnd, eGot);
        });
    }

    function eGot() {
        //if (optsPrize.chances && optsPrize.chances !== 0) removeClass(btn, 'disabled');
        removeClass(btn, 'disabled');
        fnGotBack(prizes[optsPrize.prizeId]);
    }


    /**
     * Bind events to elements
     * @param {Object}    ele    HTML Object
     * @param {Event}     event  Event to detach
     * @param {Function}  fn     Callback function
     */
    function bind(ele, event, fn) {
        if (typeof addEventListener === 'function') {
            ele.addEventListener(event, fn, false);
        } else if (ele.attachEvent) {
            ele.attachEvent('on' + event, fn);
        }
    }

    /**
     * Unbind events to elements
     * @param {Object}    ele    HTML Object
     * @param {Event}     event  Event to detach
     * @param {Function}  fn     Callback function
     */
    /*  function unbind(ele, event, fn) {
     if (typeof removeEventListener === 'function') {
     ele.removeEventListener(event, fn, false);
     } else if (ele.detachEvent) {
     ele.detach('on' + event, fn);
     }
     }*/

    /**
     * hasClass
     * @param {Object} ele   HTML Object
     * @param {String} cls   className
     * @return {Boolean}
     */
    function hasClass(ele, cls) {
        if (!ele || !cls) return false;
        if (ele.classList) {
            return ele.classList.contains(cls);
        } else {
            return ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
        }
    }

    // addClass
    function addClass(ele, cls) {
        if (ele.classList) {
            ele.classList.add(cls);
        } else {
            if (!hasClass(ele, cls)) ele.className += '' + cls;
        }
    }

    // removeClass
    function removeClass(ele, cls) {
        if (ele.classList) {
            ele.classList.remove(cls);
        } else {
            ele.className = ele.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    }

    var gbTurntable = {
        init: function (opts) {
            return init(opts);
        }
    }

    // (@see https://github.com/madrobby/zepto/blob/master/src/zepto.js)
    window.gbTurntable === undefined && (window.gbTurntable = gbTurntable);

    // AMD (@see https://github.com/jashkenas/underscore/blob/master/underscore.js)
    if (typeof define == 'function' && define.amd) {
        define('GB-canvas-turntable', [], function () {
            return gbTurntable;
        });
    }

}());