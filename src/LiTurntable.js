(function () {
    /**
     * @param  {String} id
     * @return {Object} HTML element
     */
    var $ = function (id) {
        return document.getElementById(id);
    };

    var ele;

    var LiTurntable = {
        options: {
            getPrize: null,
            gotBack: null,
            bgBlock: null, // 转盘间隔色
            bulb: null, // 灯泡间隔色 
            line: null, // 边框
            auto: null, // 自动出结果  
            circleWidth: null, // 圆的大小       
            prizes: [], // 奖品的数组
            canvasItem: '.li-turntable-canvas',
            containerItem: '.li-turntable-container',
            btnItem: '.li-turntable-btn'
        },

        canvas: null,
        container: null,
        btn: null,

        num: null, // 奖品的数量

        deg: 0,

        bgBlockLength: 0,
        turntableUl: 'li-turntalbe-list',

        optsPrize: null,
        cssPrefix: null,
        eventPrefix: null,
        cssSupport: {},
        Android: /android/i.test(navigator.userAgent),
        IOS: /ios/i.test(navigator.userAgent),
        init: function (opts) {
            // 游览器嗅探
            this.testEnv();
            this.cssSupport = {
                cssPrefix: this.cssPrefix,
                transform: this.normalizeCss('Transform'),
                transitionEnd: this.normalizeEvent('TransitionEnd'),
                // 兼容安卓
                webkitTransform: this.normalizeCss('-webkit-transform'),
                transformStyle: null
            };
            // 兼容游览器嗅探不正确的问题
            // 安卓兼容
            this.cssSupport.transformStyle = this.Android ? this.cssSupport.webkitTransform : this.cssSupport.transform;

            for(key in opts) {
                if(opts[key] && opts.hasOwnProperty(key)) {
                    this.options[key] = opts[key];
                }
            }
            
            var that = this;
            opts.config(function (data) {
                that.options.prizes = opts.prizes = data;
                that.num = data.length;
                that.draw(opts);
            });

            this.setStyle();
            this.events(opts);
        },
        setStyle: function () {
            ele.style.width = this.options.circleWidth + 'px';
            ele.style.height = this.options.circleWidth + 'px';
        },
        // 嗅探特性
        testEnv: function () {
            var that = this;
            var vendors = {
                '': '',
                Webkit: 'webkit',
                Moz: '',
                O: 'o',
                ms: 'ms'
            };
            // 嗅探特性测试标签
            var testEle = document.createElement('p');
            Object.keys(vendors).some(function (vendor) {
                if (testEle.style[vendor + (vendor ? 'T' : 't') + 'ransitionProperty'] !== undefined) {
                    that.cssPrefix = vendor ? '-' + vendor.toLowerCase() + '-' : '';
                    that.eventPrefix = vendors[vendor];
                    return true;
                }
            });
        },
        /**
         * [兼容事件前缀]
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        normalizeEvent: function (name) {
            name = name.toLowerCase();
            return this.eventPrefix ? this.eventPrefix + name : name;
        },
        /**
         * [兼容CSS前缀]
         * @param  {[type]} name [description]
         * @return {[type]}      [description]
         */
        normalizeCss: function (name) {
            name = name.toLowerCase();
            return this.cssPrefix ? this.cssPrefix + name : name;
        },
        /**
         * [绘制转盘]
         * @param  {String} id
         * @param  {Number} 奖品份数
         */
        draw: function (opts) {
            var num = this.num;
            var bgBlockLength = this.bgBlockLength;
            var transformStyle = this.cssSupport.transformStyle;
            var circleWidth = opts.circleWidth;
            var bgBlock = opts.bgBlock;
            var line = opts.line;

            if (!opts.id || num >>> 0 === 0) return;

            var id = opts.id,
                rotateDeg = 360 / num / 2 + 90, // 扇形回转角度
                ctx,
                prizeItems = document.createElement('ul'), // 奖项容器
                turnNum = 1 / num, // 文字旋转 turn 值
                canvasItem = opts.canvasItem ? opts.canvasItem : this.options.canvasItem,
                containerItem = opts.containerItem ? opts.containerItem : this.options.containerItem,
                btnItem = opts.btnItem ? opts.btnItem : this.options.btnItem,
                html = []; // 奖项

            ele = $(id);
            this.canvas = ele.querySelector(canvasItem);
            this.container = ele.querySelector(containerItem);
            this.btn = ele.querySelector(btnItem);

            if (!this.canvas.getContext) {
                showMsg('抱歉！浏览器不支持。');
                return;
            }
            // 获取绘图上下文
            ctx = this.canvas.getContext('2d');

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

                // 根据 bgBlock的长度分成不同区段的颜色
                var bgBlockList = bgBlock.split('/');
                ctx.fillStyle = bgBlockList[bgBlockLength];
                if (bgBlockLength === (bgBlockList.length - 1)) {
                    bgBlockLength = 0
                } else {
                    bgBlockLength = bgBlockLength + 1;
                }

                // 填充扇形
                ctx.fill();

                // 绘制边框
                if (line && line.needLineWidth) {
                    ctx.lineWidth = line.width || 1;
                    ctx.strokeStyle = line.color || '#fff';
                    ctx.stroke();
                }

                // 恢复前一个状态
                ctx.restore();

                var trans = transformStyle + ': rotate(' + i * turnNum + 'turn);transform: rotate(' + i * turnNum + 'turn);-webkit-transform: rotate(' + i * turnNum + 'turn)';
                var currentPrize = opts.prizes[i];
                var imageUrl = currentPrize.imageUrl;
                var name = currentPrize.shortName || currentPrize.name;
                var imageUrlWrapper = currentPrize.imageUrlWrapper;
                var prizeValue = (currentPrize.prizeValue / 100).toFixed(2) + '元';
                var prizeIntegral = currentPrize.prizeValue;

                switch (currentPrize.type) {
                    case 1:
                        // 积分
                        html.push('<li class="li-turntable-item" style="' + trans + '">' +
                            '<div class="li-turntable-block">' +
                            '<span>' + prizeIntegral + '积分</span>' +
                            '<img src="' + imageUrl + '">' +
                            '</div>' +
                            '</li>');
                        break;
                    case 2:
                    case 3:
                    case 4:
                        // 余额 or 现金 or 优惠券
                        html.push('<li class="li-turntable-item" style="' + trans + '">' +
                            '<div class="li-turntable-block">' +
                            '<span>' + prizeValue + '</span>' +
                            '<img src="' + imageUrl + '">' +
                            '</div>' +
                            '</li>');
                        break;
                    case 5:
                        // 商品
                        html.push('<li class="li-turntable-item" style="' + trans + '">' +
                            '<div class="li-turntable-block">' +
                            '<span>' + name + '</span>' +
                            '<img src="' + imageUrl + '">' +
                            '</div>' +
                            '</li>');
                        break;
                    case 6:
                        // 未中奖
                        html.push('<li class="li-turntable-item" style="' + trans + '">' +
                            '<div class="li-turntable-block">' +
                            '<span class="no-image">' + name + '</span>' +
                            '</div>' +
                            '</li>');
                        break;
                    case 7:
                        // 带动画的效果商品
                        html.push('<li class="li-turntable-item" style="' + trans + '">' +
                            '<div class="li-turntable-block">' +
                            '<span></span>' +
                            '<div class="li-turntable-prize-img-wrapper">' +
                            '<img class="li-turntable-prize-img" src="' + imageUrl + '">' +
                            '<img class="li-turntable-prize-default-img" src="' + imageUrlWrapper + '">' +
                            '</div>' +
                            '</div>' +
                            '</li>');
                        break;
                }
                if ((i + 1) === num) {
                    // 将内容添加到html
                    prizeItems.className = this.turntableUl;
                    this.container.appendChild(prizeItems);
                    prizeItems.innerHTML = html.join('');
                }
            }
            this.getBulb();
        },
        /**
         * [提示]
         * @param  {String} msg [description]
         */
        showMsg: function (msg) {
            alert(msg);
        },
        getBulb: function () {
            var bulb = this.options.bulb;
            var num = this.num;
            var container = this.container;
            var cycleId = 'draw-cycle';

            if (bulb && bulb.needBulb) {
                var bulbItem = $(cycleId);
                var div = document.createElement('div');
                if (!bulbItem) {
                    // 塞灯泡
                    div.id = cycleId;
                    var bulbItemArr = [];
                    for (var n = 0; n < (num * 2); n++) {
                        bulbItemArr.push('<div class="draw-cycle-item">' +
                            '<div class="block" style="transform: rotate(' + n * (1 / (num * 2)) + 'turn);-webkit-transform: rotate(' + n * (1 / (num * 2)) + 'turn)">' +
                            '<span style="top: -' + (n * (1 / (num * 2)) + 20) + 'px"></span>' +
                            '</div>' +
                            '</div>')
                    }
                    container.appendChild(div);
                    div.innerHTML = bulbItemArr.join('');

                    // 小电灯泡 闪闪发光~
                    if (!bulb.color) {
                        bulb.color = '#f9ffe3/#ffe176'
                    }
                    var t = 0;
                    var item = document.getElementsByClassName('draw-cycle-item');
                    setInterval(function () {
                        t += 1;
                        if (t % 2 == 0) {
                            for (var m = 0; m < item.length; m++) {
                                var bgm = item[m].firstElementChild.firstElementChild
                                m % 2 === 0 ? bgm.style.background = bulb.color.split('/')[0] : bgm.style.background = bulb.color.split('/')[1]
                            }
                        } else {
                            for (var z = 0; z < item.length; z++) {
                                var bgz = item[z].firstElementChild.firstElementChild
                                z % 2 === 0 ? bgz.style.background = bulb.color.split('/')[1] : bgz.style.background = bulb.color.split('/')[0]
                            }
                        }
                    }, bulb.interval || 300);
                }
            }
        },
        /**
        * 抽奖事件
        * @return {[type]} [description]
        */
        events: function (opts) {
            var that = this;
            var auto = this.options.auto;
            var btn = this.btn;
            var container = this.container;
            var transitionEnd = this.cssSupport.transitionEnd;
            var prizeList = ele.querySelector('.' + this.turntableUl);

            if (!auto) {
                this.bind(prizeList, 'click', function (e) {
                    if (e.target.className.indexOf('animation-end') !== -1) {
                        var prizeImg = ele.querySelectorAll('.li-turntable-prize-img');
                        var tablewareImg = ele.querySelectorAll('.li-turntable-prize-default-img');
                        for (var i = 0; i < prizeImg.length; i++) {
                            that.removeClass(prizeImg[i], 'animation-hide');
                            that.removeClass(tablewareImg[i], 'animation-close');
                            that.removeClass(tablewareImg[i], 'animation-end');
                            that.removeClass(tablewareImg[i], 'animation-shake');
                        }
                        that.eGot();
                    }
                });
            }

            that.bind(btn, 'click', function () {
                that.options.getPrize(function (data) {
                    if (!auto) {
                        // 先经过一个动画
                        that.addClass(btn, 'disabled');
                        var prizeImg = ele.querySelectorAll('.li-turntable-prize-img');
                        var tablewareImg = ele.querySelectorAll('.li-turntable-prize-default-img');
                        for (var i = 0; i < prizeImg.length; i++) {
                            that.addClass(prizeImg[i], 'animation-hide');
                            that.addClass(tablewareImg[i], 'animation-close');
                        }

                        setTimeout(function () {
                            that.getDeg(data);
                        }, 3000);
                    } else {
                        that.getDeg(data);
                    }
                });
            });

            // 中奖提示
            that.bind(container, transitionEnd, function () {
                var tablewareImg = ele.querySelectorAll('.li-turntable-prize-default-img');
                for (var i = 0; i < tablewareImg.length; i++) {
                    that.removeClass(tablewareImg[i], 'animation-close');
                    that.addClass(tablewareImg[i], 'animation-end');
                    that.addClass(tablewareImg[i], 'animation-shake');
                }
                auto && that.eGot()
            });
        },
        /**
        * 旋转转盘
        * @param  {[type]} deg [description]
        * @return {[type]}     [description]
        */
        runRotate: function (deg) {
            var container = this.container;
            var transformStyle = this.cssSupport.transformStyle;

            // setTimeout(function() {
            // addClass(container, 'li-run');transform
            // 兼容安卓
            container.style[transformStyle] = 'rotate(' + deg + 'deg)';
            container.style.webkitTransform = 'rotate(' + deg + 'deg)';
            container.style.transform = 'rotate(' + deg + 'deg)';
            // }, 10);
        },
        /**
         * 获取旋转角度
         * @param {[type]} data 
         */
        getDeg: function (data) {
            var num = this.num;

            this.optsPrize = {
                prizeId: data[0],
                chances: data[1]
            };

            // 计算旋转角度
            var parity = Math.round(10 * Math.random());
            this.deg = this.deg || 0;
            this.deg = this.deg + (360 - this.deg % 360) + (360 * 10 - data[0] * (360 / num));

            if (parity % 2 == 0) {
                this.deg = (this.deg + (180 / num) * Math.random()) - ((180 / num) * 0.01);
            } else {
                this.deg = (this.deg - (180 / num) * Math.random()) + ((180 / num) * 0.01);
            }
            this.runRotate(this.deg);
        },
        eGot: function () {
            var that = this;
            var btn = this.btn;
            //if (optsPrize.chances && optsPrize.chances !== 0) removeClass(btn, 'disabled');
            that.removeClass(btn, 'disabled');
            var prizeImg = ele.querySelectorAll('.li-turntable-prize-img');
            var tablewareImg = ele.querySelectorAll('.li-turntable-prize-default-img');
            for (var i = 0; i < prizeImg.length; i++) {
                that.removeClass(prizeImg[i], 'animation-hide');
                that.removeClass(tablewareImg[i], 'animation-close');
                that.removeClass(tablewareImg[i], 'animation-end');
                that.removeClass(tablewareImg[i], 'animation-shake');
            }
            that.options.gotBack(that.options.prizes[this.optsPrize.prizeId]);
        },
        /**
        * Bind events to elements
        * @param {Object}    ele    HTML Object
        * @param {Event}     event  Event to detach
        * @param {Function}  fn     Callback function
        */
        bind: function (ele, event, fn) {
            if (typeof addEventListener === 'function') {
                ele.addEventListener(event, fn, false);
            } else if (ele.attachEvent) {
                ele.attachEvent('on' + event, fn);
            }
        },
        /**
         * hasClass
         * @param {Object} ele   HTML Object
         * @param {String} cls   className
         * @return {Boolean}
         */
        hasClass: function (ele, cls) {
            if (!ele || !cls) return false;
            if (ele.classList) {
                return ele.classList.contains(cls);
            } else {
                return ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
            }
        },

        // addClass
        addClass: function (ele, cls) {
            if (ele.classList) {
                ele.classList.add(cls);
            } else {
                if (!this.hasClass(ele, cls)) ele.className += '' + cls;
            }
        },

        // removeClass
        removeClass: function (ele, cls) {
            if (ele.classList) {
                ele.classList.remove(cls);
            } else {
                ele.className = ele.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
            }
        }
    }

    window.LiTurntable === undefined && (window.LiTurntable = LiTurntable)
}());