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
        circleWidth,        // 圆的大小
        bgBlock,            // 转盘间隔色
        bgBlockLength = 0,
        bulb,               // 灯泡间隔色
        line,               // 边框
        auto,               // 自动出结果
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
        // 嗅探特性测试标签
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
    function normalizeEvent (name) {
        name = name.toLowerCase();
        return eventPrefix ? eventPrefix + name : name;
    }

    /**
     * [兼容CSS前缀]
     * @param  {[type]} name [description]
     * @return {[type]}      [description]
     */
    function normalizeCss (name) {
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
    var transform = cssSupport.transform;
    var transitionEnd = cssSupport.transitionEnd;

    var Android = /android/i.test(navigator.userAgent);
    var ios = /ios/i.test(navigator.userAgent);

    // 兼容游览器嗅探不正确的问题
    if (Android) {
        // 安卓兼容
        transformStyle = cssSupport.webkitTransform;
    } else {
        transformStyle = transform;
    }

    function init (opts) {
        fnGetPrize = opts.getPrize;
        fnGotBack = opts.gotBack;
        bgBlock = opts.bgBlock;
        bulb = opts.bulb;
        line = opts.line;
        circleWidth = opts.circleWidth;
        auto = opts.auto;

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
    function draw (opts) {
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
            ctx.translate(circleWidth, circleWidth);
            // 从(0, 0)坐标开始定义一条新的子路径
            ctx.moveTo(0, 0);
            // 旋转弧度,需将角度转换为弧度,使用 degrees * Math.PI/180 公式进行计算。
            ctx.rotate((360 / num * i - rotateDeg) * Math.PI / 180);
            // 绘制圆弧
            ctx.arc(0, 0, circleWidth, 0, 2 * Math.PI / num, false);

            var bgBlockList = bgBlock.split('/');
            ctx.fillStyle = bgBlockList[bgBlockLength];
            if(bgBlockLength === (bgBlockList.length - 1)) {
                bgBlockLength = 0
            } else {
                bgBlockLength = bgBlockLength + 1;
            }

            // 填充扇形
            ctx.fill();

            // 绘制边框
            if(line && line.needLineWidth) {
                ctx.lineWidth = line.width || 1;
                ctx.strokeStyle = line.color || '#fff';
                ctx.stroke();
            }

            // 恢复前一个状态
            ctx.restore();

            // 奖项列表
            console.log(opts.prizes[i]);
            var trans = transformStyle + ': rotate(' + i * turnNum + 'turn);transform: rotate(' + i * turnNum + 'turn);-webkit-transform: rotate(' + i * turnNum + 'turn)';
            var imageUrl = opts.prizes[i].imageUrl;
            //  shortName: 简称
            var name = opts.prizes[i].shortName || opts.prizes[i].name;
            var imageUrlWrapper = opts.prizes[i].imageUrlWrapper;
            var prizeValue = (opts.prizes[i].prizeValue / 100).toFixed(2) + '元';
            var prizeIntegral = opts.prizes[i].prizeValue;
            switch (opts.prizes[i].type) {
                case 1:
                    // 积分
                    html.push('<li class="gb-turntable-item">' +
                        '<div class="gb-turntable-block" style="'+ trans +'">' +
                        '<span>' + prizeIntegral + '积分</span>' +
                        '<img src="'+ imageUrl +'">' +
                        '</div>' +
                        '</li>');
                    break;
                case 2:
                    // 余额
                    html.push('<li class="gb-turntable-item">' +
                        '<div class="gb-turntable-block" style="'+ trans +'">' +
                        '<span>'+ prizeValue +'</span>' +
                        '<img src="'+ imageUrl +'">' +
                        '</div>' +
                        '</li>');
                    break;
                case 3:
                    // 优惠券
                    html.push('<li class="gb-turntable-item">' +
                                    '<div class="gb-turntable-block" style="'+ trans +'">' +
                                        '<span>'+ prizeValue +'</span>' +
                                        '<img src="'+ imageUrl +'">' +
                                    '</div>' +
                                '</li>');
                    break;
                case 4:
                    // 现金
                    html.push('<li class="gb-turntable-item">' +
                                    '<div class="gb-turntable-block" style="'+ trans +'">' +
                                        '<span>' + prizeValue + '</span>' +
                                        '<img src="'+ imageUrl +'">' +
                                    '</div>' +
                                '</li>');
                    break;
                case 5:
                    // 商品
                    html.push('<li class="gb-turntable-item">' +
                                    '<div class="gb-turntable-block" style="'+ trans +'">' +
                                        '<span>' + name + '</span>' +
                                        '<img src="' + imageUrl + '">' +
                                    '</div>' +
                                '</li>');
                    break;
                case 6:
                    // 未中奖
                    html.push('<li class="gb-turntable-item">' +
                                    '<div class="gb-turntable-block" style="'+ trans +'">' +
                                            '<span class="no-image">'+ name +'</span>' +
                                            '<img src="'+ imageUrl +'">' +
                                    '</div>' +
                                '</li>');
                    break;
                case 7:
                    // 带动画的效果商品
                    html.push('<li class="gb-turntable-item">' +
                                    '<div class="gb-turntable-block" style="'+ trans +'">' +
                                        '<span></span>' +
                                        '<div class="gb-turntable-prize-img-wrapper">' +
                                            '<img class="gb-turntable-prize-img" src="' + imageUrl + '">' +
                                            '<img class="gb-turntable-prize-default-img" src="'+ imageUrlWrapper +'">' +
                                        '</div>' +
                                    '</div>' +
                                '</li>');
                    break;
            }
            if ((i + 1) === num) {
                prizeItems.className = 'gb-turntalbe-list';
                container.appendChild(prizeItems);
                prizeItems.innerHTML = html.join('');
            }
        }
        getBulb();
    }

    // 电灯泡
    function getBulb () {
        if(bulb && bulb.needBulb) {
            var bulbItem = document.getElementById('draw-cycle');
            var div = document.createElement('div');
            if (!bulbItem) {
                // 塞灯泡
                div.id = 'draw-cycle';
                var bulbItemArr = [];
                for (var n = 0; n < (num * 2); n++) {
                    bulbItemArr.push('<div class="draw-cycle">' +
                        '<div class="block" style="transform: rotate(' + n * ( 1 / (num * 2) ) + 'turn);-webkit-transform: rotate(' + n * ( 1 / (num * 2) ) + 'turn)">' +
                        '<span style="top: -' + (n * ( 1 / (num * 2) ) + 20) + 'px"></span>' +
                        '</div>' +
                        '</div>')
                }
                container.appendChild(div);
                div.innerHTML = bulbItemArr.join('');

                // 小电灯泡 闪闪发光~
                if(!bulb.color) {
                    bulb.color = '#f9ffe3/#ffe176'
                }
                var t = 0;
                var even = document.getElementsByClassName('draw-cycle');
                var timer = setInterval(function () {
                    t += 1;
                    if (t % 2 == 0) {
                        for(var m = 0 ; m < even.length; m ++) {
                            if(m % 2 === 0) {
                                even[m].firstElementChild.firstElementChild.style.background = bulb.color.split('/')[0];
                            } else {
                                even[m].firstElementChild.firstElementChild.style.background = bulb.color.split('/')[1]
                            }
                        }
                    } else {
                        for(var z = 0; z < even.length; z ++) {
                            if(z % 2 === 0) {
                                even[z].firstElementChild.firstElementChild.style.background = bulb.color.split('/')[1]
                            } else {
                                even[z].firstElementChild.firstElementChild.style.background = bulb.color.split('/')[0]
                            }
                        }
                    }
                }, bulb.interval || 300);
            }
        }
    }

    /**
     * [提示]
     * @param  {String} msg [description]
     */
    function showMsg (msg) {
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
    function runRotate (deg) {
        // runInit();

        // setTimeout(function() {
        // addClass(container, 'gb-run');transform
        // 兼容安卓
        container.style[transformStyle] = 'rotate(' + deg + 'deg)';
        container.style.webkitTransform = 'rotate(' + deg + 'deg)';
        container.style.transform = 'rotate(' + deg + 'deg)';
        // }, 10);
    }

    /**
     * 抽奖事件
     * @return {[type]} [description]
     */
    function events () {
        var prizeList = ele.querySelector('.gb-turntalbe-list');
        if(!auto) {
            bind(prizeList, 'click', function (e) {
                if(e.target.className.indexOf('animation-end') !== -1) {
                    var prizeImg = ele.querySelectorAll('.gb-turntable-prize-img');
                    var tablewareImg = ele.querySelectorAll('.gb-turntable-prize-default-img');
                    for(var i = 0; i < prizeImg.length; i ++) {
                        removeClass(prizeImg[i], 'animation-hide');
                        removeClass(tablewareImg[i], 'animation-close');
                        removeClass(tablewareImg[i], 'animation-end');
                        removeClass(tablewareImg[i], 'animation-shake');
                    }
                    eGot();
                }
            });
        }

        bind(btn, 'click', function () {
            /*      var prizeId,
             chances;*/
            fnGetPrize(function (data) {
                if(!auto) {
                    // 先经过一个动画
                    addClass(btn, 'disabled');
                    var prizeImg = ele.querySelectorAll('.gb-turntable-prize-img');
                    var tablewareImg = ele.querySelectorAll('.gb-turntable-prize-default-img');
                    for (var i = 0; i < prizeImg.length; i++) {
                        addClass(prizeImg[i], 'animation-hide');
                        addClass(tablewareImg[i], 'animation-close');
                    }

                    setTimeout(function () {
                        getDeg(data);
                    }, 3000);
                } else {
                   getDeg(data);
                }
            });

            // 中奖提示
            bind(container, transitionEnd, function () {
                var tablewareImg = ele.querySelectorAll('.gb-turntable-prize-default-img');
                for(var i = 0; i < tablewareImg.length; i ++) {
                    removeClass(tablewareImg[i], 'animation-close');
                    addClass(tablewareImg[i], 'animation-end');
                    addClass(tablewareImg[i], 'animation-shake');
                }
                if(auto) {
                    eGot()
                }
            });
        });
    }

    function getDeg (data) {
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
        runRotate(deg);
    }

    function eGot () {
        //if (optsPrize.chances && optsPrize.chances !== 0) removeClass(btn, 'disabled');
        removeClass(btn, 'disabled');
        var prizeImg = ele.querySelectorAll('.gb-turntable-prize-img');
        var tablewareImg = ele.querySelectorAll('.gb-turntable-prize-default-img');
        for(var i = 0; i < prizeImg.length; i ++) {
            removeClass(prizeImg[i], 'animation-hide');
            removeClass(tablewareImg[i], 'animation-close');
            removeClass(tablewareImg[i], 'animation-end');
            removeClass(tablewareImg[i], 'animation-shake');
        }
        fnGotBack(prizes[optsPrize.prizeId]);
    }

    /**
     * Bind events to elements
     * @param {Object}    ele    HTML Object
     * @param {Event}     event  Event to detach
     * @param {Function}  fn     Callback function
     */
    function bind (ele, event, fn) {
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
    function hasClass (ele, cls) {
        if (!ele || !cls) return false;
        if (ele.classList) {
            return ele.classList.contains(cls);
        } else {
            return ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
        }
    }

    // addClass
    function addClass (ele, cls) {
        if (ele.classList) {
            ele.classList.add(cls);
        } else {
            if (!hasClass(ele, cls)) ele.className += '' + cls;
        }
    }

    // removeClass
    function removeClass (ele, cls) {
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
    };

    // (@see https://github.com/madrobby/zepto/blob/master/src/zepto.js)
    window.gbTurntable === undefined && (window.gbTurntable = gbTurntable);

    // AMD (@see https://github.com/jashkenas/underscore/blob/master/underscore.js)
    if (typeof define == 'function' && define.amd) {
        define('GB-canvas-turntable', [], function () {
            return gbTurntable;
        });
    }

}());
