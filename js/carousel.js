/**
 * ============================================
 * 连云港文旅展示网站 — 首页轮播组件
 * 纯原生 JavaScript，无外部依赖
 * 支持自动播放、箭头切换、圆点指示、触摸滑动
 * ============================================
 */

(function () {
  'use strict';

  /**
   * HeroCarousel 轮播图类
   * @param {string} selector - 轮播容器的 CSS 选择器
   * @param {Object} options - 配置选项
   */
  function HeroCarousel(selector, options) {
    // 默认配置
    var defaults = {
      autoplay: true,       // 是否自动播放
      interval: 5000,       // 自动播放间隔（毫秒）
      pauseOnHover: true,   // 鼠标悬停时暂停自动播放
      touchEnabled: true,    // 是否启用触摸滑动
      swipeThreshold: 50    // 触摸滑动阈值（像素）
    };

    // 合并配置
    this.options = extend(defaults, options || {});
    this.container = document.querySelector(selector);

    // 如果容器不存在则退出
    if (!this.container) return;

    // 初始化
    this.init();
  }

  /**
   * 对象合并工具函数（浅拷贝）
   * @param {Object} target - 目标对象
   * @param {Object} source - 源对象
   * @returns {Object} 合并后的对象
   */
  function extend(target, source) {
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        target[key] = source[key];
      }
    }
    return target;
  }

  /* ---------- 原型方法 ---------- */

  /**
   * 初始化轮播组件
   * 获取 DOM 元素、绑定事件、启动自动播放
   */
  HeroCarousel.prototype.init = function () {
    // 获取轮播幻灯片
    this.slides = this.container.querySelectorAll('.carousel-slide');
    this.slideCount = this.slides.length;

    // 至少需要两张幻灯片才能轮播
    if (this.slideCount < 2) {
      // 只有一张或没有，显示第一张并退出
      if (this.slides.length === 1) {
        this.slides[0].classList.add('active');
      }
      return;
    }

    // 当前幻灯片索引
    this.currentIndex = 0;

    // 自动播放定时器
    this.autoplayTimer = null;
    this.isTransitioning = false; // 防止快速点击

    // 触摸滑动相关变量
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchEndX = 0;
    this.isSwiping = false;

    // 获取或创建控制元素
    this.arrows = {
      prev: this.container.querySelector('.carousel-arrow.prev'),
      next: this.container.querySelector('.carousel-arrow.next')
    };

    this.dotsContainer = this.container.querySelector('.carousel-dots');

    // 如果没有圆点容器，自动创建
    if (!this.dotsContainer) {
      this.dotsContainer = document.createElement('div');
      this.dotsContainer.className = 'carousel-dots';
      this.container.appendChild(this.dotsContainer);
    }

    // 生成圆点指示器
    this.dots = [];
    this.createDots();

    // 绑定事件
    this.bindEvents();

    // 显示第一张幻灯片
    this.goTo(0);

    // 启动自动播放
    if (this.options.autoplay) {
      this.startAutoplay();
    }
  };

  /**
   * 创建圆点指示器
   */
  HeroCarousel.prototype.createDots = function () {
    var self = this;

    // 清空现有圆点
    this.dotsContainer.innerHTML = '';

    for (var i = 0; i < this.slideCount; i++) {
      var dot = document.createElement('span');
      dot.className = 'dot';
      dot.setAttribute('data-index', i);
      dot.setAttribute('aria-label', '切换到第 ' + (i + 1) + ' 张');

      // 使用闭包绑定点击事件
      (function (index) {
        dot.addEventListener('click', function () {
          self.goTo(index);
        });
      })(i);

      this.dotsContainer.appendChild(dot);
      this.dots.push(dot);
    }
  };

  /**
   * 绑定所有事件
   */
  HeroCarousel.prototype.bindEvents = function () {
    var self = this;

    // 左箭头点击
    if (this.arrows.prev) {
      this.arrows.prev.addEventListener('click', function (e) {
        e.preventDefault();
        self.prev();
        self.restartAutoplay();
      });
    }

    // 右箭头点击
    if (this.arrows.next) {
      this.arrows.next.addEventListener('click', function (e) {
        e.preventDefault();
        self.next();
        self.restartAutoplay();
      });
    }

    // 鼠标悬停暂停/恢复自动播放
    if (this.options.pauseOnHover && this.options.autoplay) {
      this.container.addEventListener('mouseenter', function () {
        self.stopAutoplay();
      });

      this.container.addEventListener('mouseleave', function () {
        self.startAutoplay();
      });
    }

    // 触摸滑动事件
    if (this.options.touchEnabled) {
      this.bindTouchEvents();
    }

    // 键盘方向键支持
    this.container.setAttribute('tabindex', '0');
    this.container.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        self.prev();
        self.restartAutoplay();
      } else if (e.key === 'ArrowRight') {
        self.next();
        self.restartAutoplay();
      }
    });

    // 页面不可见时暂停自动播放，可见时恢复
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        self.stopAutoplay();
      } else if (self.options.autoplay) {
        self.startAutoplay();
      }
    });
  };

  /**
   * 绑定触摸滑动事件
   */
  HeroCarousel.prototype.bindTouchEvents = function () {
    var self = this;

    // 触摸开始
    this.container.addEventListener('touchstart', function (e) {
      self.touchStartX = e.touches[0].clientX;
      self.touchStartY = e.touches[0].clientY;
      self.isSwiping = true;
      self.stopAutoplay(); // 触摸时暂停自动播放
    }, { passive: true });

    // 触摸移动
    this.container.addEventListener('touchmove', function (e) {
      if (!self.isSwiping) return;
      self.touchEndX = e.touches[0].clientX;
      self.touchEndY = e.touches[0].clientY;
    }, { passive: true });

    // 触摸结束
    this.container.addEventListener('touchend', function () {
      if (!self.isSwiping) return;
      self.isSwiping = false;

      var deltaX = self.touchEndX - self.touchStartX;
      var deltaY = Math.abs(self.touchEndY - self.touchStartY);

      // 判断是水平滑动还是垂直滚动（水平位移大于垂直位移时才触发）
      if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > self.options.swipeThreshold) {
        if (deltaX < 0) {
          // 向左滑动 → 下一张
          self.next();
        } else {
          // 向右滑动 → 上一张
          self.prev();
        }
      }

      // 恢复自动播放
      if (self.options.autoplay) {
        self.startAutoplay();
      }
    }, { passive: true });
  };

  /**
   * 切换到指定索引的幻灯片
   * @param {number} index - 目标幻灯片索引
   */
  HeroCarousel.prototype.goTo = function (index) {
    // 防止重复切换或快速点击
    if (this.isTransitioning || index === this.currentIndex) return;
    this.isTransitioning = true;

    // 移除当前幻灯片的 active 类
    this.slides[this.currentIndex].classList.remove('active');
    this.dots[this.currentIndex].classList.remove('active');

    // 更新索引（循环处理）
    this.currentIndex = index;

    // 处理循环
    if (this.currentIndex >= this.slideCount) {
      this.currentIndex = 0;
    }
    if (this.currentIndex < 0) {
      this.currentIndex = this.slideCount - 1;
    }

    // 为新幻灯片添加 active 类（触发淡入淡出）
    this.slides[this.currentIndex].classList.add('active');
    this.dots[this.currentIndex].classList.add('active');

    // 过渡完成后解除锁定
    var self = this;
    setTimeout(function () {
      self.isTransitioning = false;
    }, 500); // 与 CSS transition 时长一致
  };

  /**
   * 切换到下一张幻灯片
   */
  HeroCarousel.prototype.next = function () {
    this.goTo(this.currentIndex + 1);
  };

  /**
   * 切换到上一张幻灯片
   */
  HeroCarousel.prototype.prev = function () {
    this.goTo(this.currentIndex - 1);
  };

  /**
   * 启动自动播放
   */
  HeroCarousel.prototype.startAutoplay = function () {
    var self = this;

    // 清除已有的定时器，防止重复
    this.stopAutoplay();

    this.autoplayTimer = setInterval(function () {
      self.next();
    }, this.options.interval);
  };

  /**
   * 停止自动播放
   */
  HeroCarousel.prototype.stopAutoplay = function () {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
  };

  /**
   * 重启自动播放（用户操作后重新计时）
   */
  HeroCarousel.prototype.restartAutoplay = function () {
    if (this.options.autoplay) {
      this.stopAutoplay();
      this.startAutoplay();
    }
  };

  /**
   * 销毁轮播实例，释放资源
   */
  HeroCarousel.prototype.destroy = function () {
    this.stopAutoplay();
    // 移除所有事件（简化处理，实际场景可进一步清理）
    this.container.removeAttribute('tabindex');
  };

  /* ========================================
   * 自动初始化
   * 页面加载后自动查找 .hero-carousel 元素并初始化
   * 也可以手动调用：new HeroCarousel('.hero-carousel', { interval: 3000 })
   * ======================================== */
  document.addEventListener('DOMContentLoaded', function () {
    var carousels = document.querySelectorAll('.hero-carousel');

    carousels.forEach(function (carouselEl) {
      // 避免重复初始化
      if (carouselEl.getAttribute('data-carousel-initialized')) return;
      carouselEl.setAttribute('data-carousel-initialized', 'true');

      // 支持通过 data-* 属性自定义配置
      var config = {};

      var interval = carouselEl.getAttribute('data-interval');
      if (interval) config.interval = parseInt(interval, 10);

      var autoplay = carouselEl.getAttribute('data-autoplay');
      if (autoplay !== null) config.autoplay = autoplay !== 'false';

      new HeroCarousel('.hero-carousel', config);
    });
  });

  // 暴露构造函数到全局（支持手动调用）
  window.HeroCarousel = HeroCarousel;

})();
