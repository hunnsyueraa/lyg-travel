/**
 * ============================================
 * 连云港文旅展示网站 — 全站通用交互脚本
 * 纯原生 JavaScript，无外部依赖
 * ============================================
 */

(function () {
  'use strict';

  /* ========================================
   * 1. 导航栏滚动变色
   * 滚动超过 80px 时为导航栏添加 .scrolled 类
   * ======================================== */
  function initNavbarScroll() {
    var navbar = document.querySelector('.navbar');
    if (!navbar) return;

    var scrollThreshold = 80;

    /** 根据滚动位置切换 scrolled 类 */
    function handleNavbarScroll() {
      if (window.scrollY > scrollThreshold) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    // 初始化时检查一次
    handleNavbarScroll();

    // 监听滚动事件（使用被动监听优化性能）
    window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  }

  /* ========================================
   * 2. 移动端汉堡菜单切换
   * 点击汉堡按钮展开/收起侧边菜单
   * ======================================== */
  function initMobileMenu() {
    var toggle = document.querySelector('.hamburger') || document.querySelector('#hamburger');
    var menu = document.querySelector('.navbar-menu');
    if (!toggle || !menu) return;

    // 创建遮罩层元素（如果不存在）
    var overlay = document.querySelector('.navbar-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'navbar-overlay';
      document.body.appendChild(overlay);
    }

    /** 切换菜单的打开/关闭状态 */
    function toggleMenu() {
      var isOpen = menu.classList.contains('open');

      toggle.classList.toggle('active', !isOpen);
      menu.classList.toggle('open', !isOpen);
      overlay.classList.toggle('show', !isOpen);

      // 防止背景滚动
      document.body.style.overflow = isOpen ? '' : 'hidden';
    }

    /** 关闭菜单 */
    function closeMenu() {
      toggle.classList.remove('active');
      menu.classList.remove('open');
      overlay.classList.remove('show');
      document.body.style.overflow = '';
    }

    // 点击汉堡按钮切换菜单
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleMenu();
    });

    // 点击遮罩层关闭菜单
    overlay.addEventListener('click', closeMenu);

    // 点击菜单项后自动关闭菜单（移动端）
    var menuLinks = menu.querySelectorAll('a');
    menuLinks.forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // 窗口尺寸变化时关闭菜单（回到桌面端）
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) {
        closeMenu();
      }
    });
  }

  /* ========================================
   * 3. 平滑滚动
   * 点击锚点链接时平滑滚动到目标位置
   * ======================================== */
  function initSmoothScroll() {
    var anchors = document.querySelectorAll('a[href^="#"]');

    anchors.forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var href = this.getAttribute('href');

        // 忽略空锚点
        if (href === '#' || href === '#!') return;

        var target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        // 计算目标位置，减去导航栏高度
        var navbarHeight = document.querySelector('.navbar')
          ? document.querySelector('.navbar').offsetHeight
          : 72;

        var targetPosition = target.getBoundingClientRect().top + window.scrollY - navbarHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      });
    });
  }

  /* ========================================
   * 4. 滚动渐入动画
   * 使用 IntersectionObserver 监听元素进入视口
   * 支持的动画类：.fade-in-up / .fade-in-left / .fade-in-right
   * ======================================== */
  function initScrollAnimations() {
    var animatedElements = document.querySelectorAll(
      '.fade-in-up, .fade-in-left, .fade-in-right'
    );

    // 如果浏览器不支持 IntersectionObserver，直接显示所有元素
    if (!('IntersectionObserver' in window)) {
      animatedElements.forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }

    /** 创建观察器 */
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            // 元素进入视口，添加 visible 类触发动画
            entry.target.classList.add('visible');
            // 动画只执行一次，之后取消观察
            observer.unobserve(entry.target);
          }
        });
      },
      {
        // 元素露出 20% 即触发
        threshold: 0.2,
        // 提前 50px 开始触发
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // 观察所有需要动画的元素
    animatedElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ========================================
   * 5. 返回顶部按钮
   * 滚动超过 300px 时显示，点击平滑回到顶部
   * ======================================== */
  function initBackToTop() {
    // 如果页面中没有返回顶部按钮，则自动创建
    var btn = document.querySelector('.back-to-top');
    if (!btn) {
      btn = document.createElement('button');
      btn.className = 'back-to-top';
      btn.setAttribute('aria-label', '返回顶部');
      btn.innerHTML = '&#8593;'; // 向上箭头
      document.body.appendChild(btn);
    }

    var scrollThreshold = 300;

    /** 根据滚动位置切换按钮可见性 */
    function handleBackToTopVisibility() {
      if (window.scrollY > scrollThreshold) {
        btn.classList.add('show');
      } else {
        btn.classList.remove('show');
      }
    }

    // 初始化时检查一次
    handleBackToTopVisibility();

    // 监听滚动事件
    window.addEventListener('scroll', handleBackToTopVisibility, { passive: true });

    // 点击返回顶部
    btn.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /* ========================================
   * 6. 图片弹窗预览 (Lightbox)
   * 点击带有 data-lightbox 属性的图片打开全屏预览
   * 点击弹窗外部或关闭按钮关闭预览
   * ======================================== */
  function initLightbox() {
    var lightboxImages = document.querySelectorAll('img[data-lightbox]');

    if (lightboxImages.length === 0) return;

    // 创建弹窗容器（如果不存在）
    var lightbox = document.querySelector('.lightbox');
    if (!lightbox) {
      lightbox = document.createElement('div');
      lightbox.className = 'lightbox';
      lightbox.innerHTML =
        '<img src="" alt="预览图片">' +
        '<button class="lightbox-close" aria-label="关闭预览">&times;</button>';
      document.body.appendChild(lightbox);
    }

    var lightboxImg = lightbox.querySelector('img');
    var closeBtn = lightbox.querySelector('.lightbox-close');

    /** 打开弹窗 */
    function openLightbox(src) {
      lightboxImg.src = src;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    /** 关闭弹窗 */
    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      // 延迟清空 src，等动画完成
      setTimeout(function () {
        lightboxImg.src = '';
      }, 300);
    }

    // 为所有标记了 data-lightbox 的图片绑定点击事件
    lightboxImages.forEach(function (img) {
      img.style.cursor = 'pointer';
      img.addEventListener('click', function () {
        // 优先使用 data-src，否则使用 src
        var fullSrc = this.getAttribute('data-src') || this.getAttribute('src');
        openLightbox(fullSrc);
      });
    });

    // 点击弹窗背景关闭
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    // 点击关闭按钮
    closeBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      closeLightbox();
    });

    // 按 ESC 键关闭弹窗
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
      }
    });
  }

  /* ========================================
   * 7. 导航栏当前页面高亮
   * 根据当前页面 URL 自动为对应菜单项添加 .active 类
   * ======================================== */
  function initNavHighlight() {
    var menuLinks = document.querySelectorAll('.navbar-menu .menu-item a');
    if (menuLinks.length === 0) return;

    var currentPath = window.location.pathname;

    // 获取当前文件名（不含扩展名）
    var currentFile = currentPath.split('/').pop().replace('.html', '') || 'index';

    // 如果当前路径以 index 或空结尾，视为首页
    if (currentFile === '' || currentFile === 'index') {
      currentFile = 'index';
    }

    menuLinks.forEach(function (link) {
      var href = link.getAttribute('href');
      if (!href) return;

      // 提取链接中的文件名
      var linkFile = href.split('/').pop().replace('.html', '');

      // 匹配当前页面
      if (linkFile === currentFile) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  /* ========================================
   * 8. 面包屑导航自动生成
   * 根据当前页面路径自动生成面包屑导航
   * 在 .breadcrumb 容器内生成导航列表
   * ======================================== */
  function initBreadcrumb() {
    var breadcrumbContainer = document.querySelector('.breadcrumb');
    if (!breadcrumbContainer) return;

    // 如果已有面包屑内容则跳过
    if (breadcrumbContainer.querySelector('.breadcrumb-list')) return;

    var breadcrumbList = document.createElement('ol');
    breadcrumbList.className = 'breadcrumb-list';

    var currentPath = window.location.pathname;

    // 路径分段
    var pathSegments = currentPath.split('/').filter(function (segment) {
      return segment !== '';
    });

    // 首页项
    var homeItem = document.createElement('li');
    var homeLink = document.createElement('a');
    homeLink.href = './index.html';
    homeLink.textContent = '首页';
    homeItem.appendChild(homeLink);
    breadcrumbList.appendChild(homeItem);

    // 页面名称映射（可按需扩展）
    var pageNameMap = {
      'index': '首页',
      'about': '关于连云港',
      'attractions': '旅游景点',
      'food': '特色美食',
      'culture': '文化遗产',
      'guide': '旅游攻略',
      'news': '新闻动态',
      'contact': '联系我们'
    };

    // 根据路径层级生成面包屑
    var pathSoFar = '';

    pathSegments.forEach(function (segment, index) {
      var isLast = index === pathSegments.length - 1;
      var pageName = segment.replace('.html', '');
      var displayName = pageNameMap[pageName] || pageName;

      var item = document.createElement('li');

      if (isLast) {
        // 最后一项为当前页面，不可点击
        item.textContent = displayName;
      } else {
        // 非最后一项，生成链接
        pathSoFar += '/' + segment;
        var link = document.createElement('a');
        link.href = '.' + pathSoFar;
        link.textContent = displayName;
        item.appendChild(link);
      }

      breadcrumbList.appendChild(item);
    });

    breadcrumbContainer.appendChild(breadcrumbList);
  }

  /* ========================================
   * 初始化入口
   * DOM 加载完毕后执行所有初始化函数
   * ======================================== */
  document.addEventListener('DOMContentLoaded', function () {
    initNavbarScroll();
    initMobileMenu();
    initSmoothScroll();
    initScrollAnimations();
    initBackToTop();
    initLightbox();
    initNavHighlight();
    initBreadcrumb();
  });

})();
