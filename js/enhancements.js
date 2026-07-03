/**
 * enhancements.js — 网站增强交互组件
 * 包含：阅读进度条、暗黑模式、全站搜索、天气组件、图片懒加载
 * 在 DOMContentLoaded 中自动初始化所有模块
 */

;(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initReadingProgress();
    initDarkMode();
    initSiteSearch();
    initWeatherWidget();
    initLazyLoad();
  });

  /* ========================================
   * 模块1：阅读进度条
   * ======================================== */

  function initReadingProgress() {
    // 创建进度条容器
    var bar = document.createElement('div');
    bar.className = 'reading-progress';
    bar.style.cssText =
      'position:fixed;top:0;left:0;height:3px;width:0%;z-index:99999;' +
      'background:linear-gradient(90deg,#e84118,#f9ca24);transition:width .1s linear;pointer-events:none;';
    document.body.appendChild(bar);

    var ticking = false; // requestAnimationFrame 节流标记

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = Math.min(percent, 100) + '%';
        ticking = false;
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ========================================
   * 模块2：暗黑模式切换
   * ======================================== */

  function initDarkMode() {
    // 页面加载时恢复偏好
    var savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
    }

    // 创建切换按钮（固定右下角）
    var btn = document.createElement('button');
    btn.className = 'theme-toggle';
    btn.setAttribute('aria-label', '切换暗黑模式');
    btn.style.cssText =
      'position:fixed;bottom:30px;right:20px;z-index:99998;width:44px;height:44px;' +
      'border:none;border-radius:50%;cursor:pointer;font-size:22px;' +
      'background:#fff;color:#333;box-shadow:0 2px 10px rgba(0,0,0,.15);' +
      'display:flex;align-items:center;justify-content:center;transition:all .3s ease;';
    btn.textContent = isDark() ? '\uD83C\uDF19' : '\u2600\uFE0F';
    document.body.appendChild(btn);

    // 点击切换
    btn.addEventListener('click', function () {
      document.body.classList.toggle('dark-mode');
      var dark = isDark();
      localStorage.setItem('theme', dark ? 'dark' : 'light');
      btn.textContent = dark ? '\uD83C\uDF19' : '\u2600\uFE0F';
      btn.style.background = dark ? '#333' : '#fff';
      btn.style.color = dark ? '#f9ca24' : '#333';
    });

    function isDark() {
      return document.body.classList.contains('dark-mode');
    }
  }

  /* ========================================
   * 模块3：全站搜索
   * ======================================== */

  function initSiteSearch() {
    // 内置静态搜索数据
    var searchData = [
      { title: '首页', page: 'index.html', keywords: '连云港 文旅 首页 简介', desc: '连云港城市概况、热门景点推荐' },
      { title: '景点资源', page: 'attractions.html', keywords: '花果山 连岛 云台山 孔望山 渔湾 东海温泉 景点 门票', desc: '连云港八大景点详细介绍，含开放时间和门票信息' },
      { title: '民俗文化', page: 'culture.html', keywords: '淮海戏 水晶 非遗 民俗 美食 历史', desc: '非遗传承、地方民俗、美食文化、历史典故' },
      { title: '游玩攻略', page: 'guide.html', keywords: '路线 交通 住宿 攻略 出行 贴士', desc: '推荐游玩路线、交通指南、住宿推荐、出行贴士' },
      { title: '文旅资讯', page: 'news.html', keywords: '资讯 公告 活动 花果山 连岛 水晶节', desc: '最新文旅资讯、活动公告、景区动态' },
      { title: '景点地图', page: 'map.html', keywords: '地图 高德 景点位置 路线规划', desc: '高德地图标注连云港景点位置' }
    ];

    // 创建搜索覆盖层
    var overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    overlay.style.cssText =
      'position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.6);' +
      'display:none;align-items:flex-start;justify-content:center;padding-top:15vh;' +
      'backdrop-filter:blur(4px);';
    document.body.appendChild(overlay);

    // 搜索容器
    var box = document.createElement('div');
    box.className = 'search-box';
    box.style.cssText =
      'width:90%;max-width:560px;background:#fff;border-radius:12px;' +
      'box-shadow:0 20px 60px rgba(0,0,0,.3);overflow:hidden;';
    overlay.appendChild(box);

    // 搜索输入框
    var input = document.createElement('input');
    input.type = 'text';
    input.placeholder = '搜索景点、文化、攻略...';
    input.style.cssText =
      'width:100%;padding:16px 20px;font-size:18px;border:none;outline:none;' +
      'box-sizing:border-box;background:transparent;';
    box.appendChild(input);

    // 结果列表
    var resultWrap = document.createElement('div');
    resultWrap.style.cssText = 'max-height:360px;overflow-y:auto;border-top:1px solid #eee;';
    box.appendChild(resultWrap);

    // 结果计数
    var countInfo = document.createElement('div');
    countInfo.className = 'search-count';
    countInfo.style.cssText =
      'padding:8px 20px;font-size:13px;color:#999;border-bottom:1px solid #eee;display:none;';
    resultWrap.appendChild(countInfo);

    // 结果列表容器
    var resultList = document.createElement('div');
    resultList.className = 'search-results';
    resultWrap.appendChild(resultList);

    // 打开搜索
    function openSearch() {
      overlay.style.display = 'flex';
      input.value = '';
      resultList.innerHTML = '';
      countInfo.style.display = 'none';
      setTimeout(function () { input.focus(); }, 50);
    }

    // 关闭搜索
    function closeSearch() {
      overlay.style.display = 'none';
    }

    // 快捷键 Ctrl+K 打开，ESC 关闭
    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape') {
        closeSearch();
      }
    });

    // 点击遮罩关闭
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeSearch();
    });

    // 模糊匹配并按匹配度排序
    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      resultList.innerHTML = '';

      if (!query) {
        countInfo.style.display = 'none';
        return;
      }

      // 计算匹配度评分：标题匹配权重最高，关键词次之，描述最低
      var scored = searchData
        .map(function (item) {
          var score = 0;
          var titleLower = item.title.toLowerCase();
          var kwLower = item.keywords.toLowerCase();
          var descLower = item.desc.toLowerCase();

          // 标题完全匹配
          if (titleLower.indexOf(query) !== -1) score += 10;
          // 关键词逐字匹配
          kwLower.split(/\s+/).forEach(function (kw) {
            if (kw.indexOf(query) !== -1) score += 5;
          });
          // 关键词整体包含
          if (kwLower.indexOf(query) !== -1) score += 3;
          // 描述包含
          if (descLower.indexOf(query) !== -1) score += 1;

          return { item: item, score: score };
        })
        .filter(function (entry) { return entry.score > 0; })
        .sort(function (a, b) { return b.score - a.score; });

      // 显示结果计数
      countInfo.textContent = '找到 ' + scored.length + ' 个结果';
      countInfo.style.display = 'block';

      // 渲染结果列表
      scored.forEach(function (entry) {
        var item = entry.item;
        var link = document.createElement('a');
        link.href = item.page;
        link.style.cssText =
          'display:block;padding:14px 20px;text-decoration:none;color:#333;' +
          'border-bottom:1px solid #f0f0f0;transition:background .15s;';
        link.innerHTML =
          '<div style="font-size:16px;font-weight:600;margin-bottom:4px;">' + item.title + '</div>' +
          '<div style="font-size:13px;color:#888;">' + item.desc + '</div>';

        // 悬停效果
        link.addEventListener('mouseenter', function () {
          link.style.background = '#f5f5f5';
        });
        link.addEventListener('mouseleave', function () {
          link.style.background = 'transparent';
        });

        // 点击后关闭搜索并跳转
        link.addEventListener('click', function () {
          closeSearch();
        });

        resultList.appendChild(link);
      });

      // 无结果提示
      if (scored.length === 0) {
        var empty = document.createElement('div');
        empty.style.cssText = 'padding:30px 20px;text-align:center;color:#aaa;font-size:14px;';
        empty.textContent = '未找到匹配结果';
        resultList.appendChild(empty);
      }
    });
  }

  /* ========================================
   * 模块4：天气组件（模拟数据）
   * ======================================== */

  function initWeatherWidget() {
    // 模拟天气数据（根据月份简单变化）
    var month = new Date().getMonth() + 1;
    var weatherMap = {
      '1':  { temp: '4°C',  desc: '晴',     humidity: '45%', wind: '北风3级' },
      '2':  { temp: '7°C',  desc: '多云',   humidity: '50%', wind: '东北风3级' },
      '3':  { temp: '14°C', desc: '多云转晴', humidity: '55%', wind: '东南风2级' },
      '4':  { temp: '20°C', desc: '晴',     humidity: '60%', wind: '南风3级' },
      '5':  { temp: '25°C', desc: '晴转多云', humidity: '65%', wind: '东南风3级' },
      '6':  { temp: '28°C', desc: '多云',   humidity: '75%', wind: '南风3级' },
      '7':  { temp: '30°C', desc: '多云转晴', humidity: '80%', wind: '东南风3级' },
      '8':  { temp: '29°C', desc: '晴',     humidity: '78%', wind: '东风2级' },
      '9':  { temp: '25°C', desc: '多云',   humidity: '65%', wind: '东北风2级' },
      '10': { temp: '18°C', desc: '晴',     humidity: '55%', wind: '北风3级' },
      '11': { temp: '12°C', desc: '多云转晴', humidity: '50%', wind: '西北风3级' },
      '12': { temp: '6°C',  desc: '晴',     humidity: '42%', wind: '北风4级' }
    };
    var w = weatherMap[month] || { temp: '26°C', desc: '多云转晴', humidity: '65%', wind: '东南风3级' };

    // 判断是否为移动端（屏幕宽度 <= 768）
    var isMobile = window.innerWidth <= 768;

    // 天气图标映射
    function getWeatherIcon(desc) {
      if (desc.indexOf('晴') !== -1) return '\u2600\uFE0F';
      if (desc.indexOf('雨') !== -1) return '\uD83C\uDF27\uFE0F';
      if (desc.indexOf('雪') !== -1) return '\u2744\uFE0F';
      return '\u26C5';
    }

    var icon = getWeatherIcon(w.desc);

    // 创建天气组件
    var widget = document.createElement('div');
    widget.className = 'weather-widget';
    widget.style.cssText =
      'position:fixed;top:90px;right:20px;z-index:997;background:#fff;' +
      'border-radius:10px;box-shadow:0 4px 16px rgba(0,0,0,.12);' +
      'padding:10px 16px;font-size:13px;color:#333;' +
      'display:flex;align-items:center;gap:8px;' +
      'transition:all .3s ease;' + (isMobile ? 'display:none;' : '');

    widget.innerHTML =
      '<span class="weather-close" style="cursor:pointer;margin-left:6px;font-size:16px;' +
      'color:#999;line-height:1;flex-shrink:0;">\u2715</span>' +
      '<span style="font-size:20px;flex-shrink:0;">' + icon + '</span>' +
      '<div style="flex-shrink:0;">' +
        '<div style="font-weight:700;font-size:14px;">连云港 ' + w.temp + '</div>' +
        '<div style="color:#666;">' + w.desc + ' | 湿度' + w.humidity + ' | ' + w.wind + '</div>' +
      '</div>';

    document.body.appendChild(widget);

    // 创建折叠后的小按钮（移动端始终显示，桌面端隐藏）
    var toggleBtn = document.createElement('button');
    toggleBtn.className = 'weather-toggle-btn';
    toggleBtn.style.cssText =
      'position:fixed;top:90px;right:20px;z-index:997;width:36px;height:36px;' +
      'border:none;border-radius:50%;cursor:pointer;font-size:18px;' +
      'background:#fff;color:#333;box-shadow:0 2px 10px rgba(0,0,0,.12);' +
      'display:flex;align-items:center;justify-content:center;' +
      'transition:all .3s ease;' + (isMobile ? '' : 'display:none;');
    toggleBtn.textContent = icon;
    document.body.appendChild(toggleBtn);

    // 关闭按钮 — 隐藏组件，显示小按钮
    widget.querySelector('.weather-close').addEventListener('click', function () {
      widget.style.display = 'none';
      toggleBtn.style.display = 'flex';
    });

    // 小按钮 — 重新打开组件
    toggleBtn.addEventListener('click', function () {
      widget.style.display = 'flex';
      toggleBtn.style.display = 'none';
    });

    // 移动端默认显示小按钮，不显示完整组件
    if (isMobile) {
      toggleBtn.style.display = 'flex';
    }
  }

  /* ========================================
   * 模块5：图片懒加载
   * ======================================== */

  function initLazyLoad() {
    // 为所有懒加载图片添加占位样式
    var lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(function (img) {
      if (!img.src || img.src === '') {
        img.src = ''; // 确保初始为空，由 CSS 背景显示占位
      }
      img.classList.add('lazy-placeholder');
    });

    // 注入懒加载占位和渐入动画样式
    var style = document.createElement('style');
    style.textContent =
      'img.lazy-placeholder{' +
        'background:#f0f0f0;' +
        'min-height:120px;' +
        'transition:opacity .5s ease;' +
        'opacity:0;' +
      '}' +
      'img.loaded{' +
        'opacity:1;' +
      '}';
    document.head.appendChild(style);

    // 使用 IntersectionObserver 监听图片进入视口
    if (!('IntersectionObserver' in window)) {
      // 降级处理：直接加载所有图片
      lazyImages.forEach(function (img) {
        img.src = img.dataset.src;
        img.classList.remove('lazy-placeholder');
        img.classList.add('loaded');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          img.src = img.dataset.src;
          // 图片加载完成后触发渐入动画
          img.addEventListener('load', function () {
            img.classList.remove('lazy-placeholder');
            img.classList.add('loaded');
          });
          // 如果图片已缓存或加载失败，也移除占位
          img.addEventListener('error', function () {
            img.classList.remove('lazy-placeholder');
            img.classList.add('loaded');
          });
          // 停止观察该元素
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '100px 0px', // 提前 100px 开始加载
      threshold: 0
    });

    lazyImages.forEach(function (img) {
      observer.observe(img);
    });
  }

})();
