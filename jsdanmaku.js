/**
 * danmaku.js — 连云港文旅弹幕系统
 * 纯原生 JavaScript 实现，无任何依赖
 * 使用 IIFE 封装，挂载到 window.LygDanmaku 供开关按钮控制
 */
;(function () {
  'use strict';

  /* ========================================
   * 弹幕数据集（模拟真实游客评论，按景点分类）
   * ======================================== */
  var danmakuData = [
    // 花果山
    { text: '花果山水帘洞绝了！夏天去超凉快', color: '#2C5F5D', name: '山顶洞人' },
    { text: '玉女峰上看日出，此生无憾', color: '#C4A265', name: '追光者' },
    { text: '带孩子来花果山，西游记迷疯了', color: '#2C5F5D', name: '超级奶爸' },
    { text: '建议坐索道上山，走路太累了哈哈', color: '#737373', name: '懒人旅行' },
    { text: '猴子们真的好可爱！不怕人', color: '#2C5F5D', name: '小动物控' },
    { text: '三月份庙会太热闹了，明年还来', color: '#C4A265', name: '年年有余' },
    { text: '花果山秋天红叶绝美，推荐！', color: '#3A7A77', name: '秋叶旅人' },

    // 连岛
    { text: '大沙湾沙子超级细，赤脚踩着好舒服', color: '#2C5F5D', name: '海风少年' },
    { text: '苏马湾比大沙湾人少，更安静', color: '#C4A265', name: '文艺青年' },
    { text: '沿海栈道走完大概2小时，风景绝了', color: '#2C5F5D', name: '暴走达人' },
    { text: '连岛日落配海鲜，人生巅峰', color: '#C4A265', name: '吃货小王' },
    { text: '夏天来连岛一定要涂防晒！教训深刻', color: '#737373', name: '晒黑了' },
    { text: '海水真的超清，能看到小鱼', color: '#3A7A77', name: '潜水爱好者' },

    // 海上云台山
    { text: '云台山云海太壮观了，像仙境', color: '#C4A265', name: '云海漫步' },
    { text: '玻璃栈道腿软了但是值得！', color: '#2C5F5D', name: '恐高但勇敢' },
    { text: '俯瞰整个连云港港口，震撼', color: '#2C5F5D', name: '无人机航拍' },
    { text: '山上温度比市区低5度，避暑好去处', color: '#737373', name: '避暑达人' },
    { text: '日出一定要看！云海日出绝了', color: '#C4A265', name: '早起鸟儿' },

    // 孔望山
    { text: '东汉摩崖石刻比敦煌还早，涨知识了', color: '#2C5F5D', name: '历史迷' },
    { text: '孔子望海的地方，文化底蕴深厚', color: '#C4A265', name: '国学爱好者' },
    { text: '公园很安静，适合慢慢逛', color: '#737373', name: '慢生活' },
    { text: '门票才40块，性价比超高', color: '#3A7A77', name: '精打细算' },

    // 渔湾
    { text: '江苏小九寨沟名不虚传！', color: '#C4A265', name: '自然摄影师' },
    { text: '夏天瀑布水量大，带小孩玩水超开心', color: '#2C5F5D', name: '亲子游' },
    { text: '水超级清，比很多景区干净多了', color: '#2C5F5D', name: '洁癖旅人' },
    { text: '建议穿防滑鞋，石头有点滑', color: '#737373', name: '安全第一' },

    // 东海温泉
    { text: '冬天泡温泉太爽了，华东第一真不是吹的', color: '#C4A265', name: '温泉控' },
    { text: '水温真的高，一会儿就泡出汗了', color: '#2C5F5D', name: '汗蒸达人' },
    { text: '水晶城顺便逛了，买了好多手链送人', color: '#3A7A77', name: '买买买' },

    // 大伊山
    { text: '新石器时代石棺墓，六千多年历史', color: '#2C5F5D', name: '考古迷' },
    { text: '山不高但景很美，适合慢慢爬', color: '#737373', name: '佛系登山' },
    { text: '古塔拍照特别出片', color: '#C4A265', name: '小红书博主' },

    // 抗日山
    { text: '致敬先烈，非常庄严的地方', color: '#2C5F5D', name: '铭记历史' },
    { text: '带学生来的，爱国主义教育很有意义', color: '#C4A265', name: '班主任李老师' },
    { text: '全国唯一以抗日命名的山，值得铭记', color: '#737373', name: '红色传承' },

    // 通用夸赞
    { text: '连云港真的是被低估的旅游城市！', color: '#C4A265', name: '旅行达人' },
    { text: '海鲜太好吃了，梭子蟹直接清蒸', color: '#2C5F5D', name: '海鲜狂魔' },
    { text: '板浦凉粉绝了，每次来必吃', color: '#3A7A77', name: '本地老饕' },
    { text: '淮海戏真的很有韵味，推荐去听一下', color: '#2C5F5D', name: '戏曲迷' },
    { text: '连云港人太热情了，问路都超耐心', color: '#C4A265', name: '路痴旅客' },
    { text: '东海水晶城逛了一整天，眼花缭乱', color: '#737373', name: '水晶控' },
    { text: '海州古城晚上散步超舒服', color: '#2C5F5D', name: '夜猫子游客' },
    { text: '连云港物价好友好，良心旅游城市', color: '#C4A265', name: '穷游党' },
    { text: '第一次来连云港，已经爱上这里了', color: '#3A7A77', name: '一见钟情' },
    { text: '性价比超高！比很多网红城市好多了', color: '#2C5F5D', name: '理性游客' }
  ];

  /* ========================================
   * 金色弹幕子集（5% 概率触发）
   * ======================================== */
  var goldenDanmaku = [
    { text: '连云港，一座你来了就不想走的城市', color: '#FFD700', name: '金牌推荐官' },
    { text: '山海相连，人间值得！连云港我推荐！', color: '#FFD700', name: '旅行种草机' },
    { text: '谁能想到江苏有这么美的海？', color: '#FFD700', name: '海洋探险家' },
    { text: '花果山 + 连岛 = 完美周末！', color: '#FFD700', name: '周末策划师' },
    { text: '五星推荐连云港，必来！', color: '#FFD700', name: '旅行达人MAX' }
  ];

  /* ========================================
   * 配置参数
   * ======================================== */
  var CONFIG = {
    TRACK_COUNT: 10,          // 轨道数量
    MAX_DANMAKU: 15,          // 同时最多显示弹幕数
    FIRE_INTERVAL_MIN: 2000,  // 发射间隔最小值（毫秒）
    FIRE_INTERVAL_MAX: 4000, // 发射间隔最大值（毫秒）
    SPEED_MIN: 8,            // 最慢穿越屏幕时间（秒）
    SPEED_MAX: 15,           // 最快穿越屏幕时间（秒）
    GOLDEN_CHANCE: 0.05,      // 金色弹幕触发概率
    GOLDEN_STAY: 3000,        // 金色弹幕停留时间（毫秒）
    STORAGE_KEY: 'danmaku_enabled'  // localStorage 存储键
  };

  /* ========================================
   * 弹幕引擎核心
   * ======================================== */
  var container = null;       // 弹幕容器 DOM
  var toggleBtn = null;        // 开关按钮 DOM
  var isEnabled = true;        // 弹幕是否开启
  var activeDanmaku = [];     // 当前活跃弹幕列表
  var trackCooldowns = [];      // 每条轨道的冷却标记（避免同轨道重叠）
  var remainingPool = [];      // 剩余未展示弹幕池
  var fireTimer = null;        // 发射定时器

  /**
   * 初始化弹幕系统
   */
  function init() {
    // 从 localStorage 读取用户偏好，默认开启
    var saved = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (saved === 'false') {
      isEnabled = false;
    }

    // 创建弹幕容器
    createContainer();

    // 创建开关按钮
    createToggleBtn();

    // 初始化轨道冷却
    for (var i = 0; i < CONFIG.TRACK_COUNT; i++) {
      trackCooldowns.push(0);
    }

    // 初始化弹幕池
    resetPool();

    // 如果启用则开始发射
    if (isEnabled) {
      startFiring();
    }
  }

  /**
   * 创建弹幕容器（固定定位，覆盖全屏，不阻挡交互）
   */
  function createContainer() {
    container = document.createElement('div');
    container.id = 'lyg-danmaku-layer';
    container.style.cssText =
      'position:fixed;top:0;left:0;width:100%;height:100%;' +
      'pointer-events:none;z-index:999;overflow:hidden;';
    document.body.appendChild(container);
  }

  /**
   * 创建弹幕开关按钮（右下角，暗黑模式按钮上方）
   */
  function createToggleBtn() {
    toggleBtn = document.createElement('button');
    toggleBtn.id = 'lyg-danmaku-toggle';
    toggleBtn.setAttribute('aria-label', '弹幕开关');
    toggleBtn.title = isEnabled ? '关闭弹幕' : '开启弹幕';
    toggleBtn.style.cssText =
      'position:fixed;bottom:82px;right:20px;z-index:99999;' +
      'width:40px;height:40px;border:none;border-radius:50%;' +
      'cursor:pointer;font-size:18px;' +
      'background:rgba(255,255,255,0.92);color:#2C5F5D;' +
      'box-shadow:0 2px 10px rgba(0,0,0,0.15);' +
      'display:flex;align-items:center;justify-content:center;' +
      'transition:all .3s ease;pointer-events:auto;';

    // 默认显示开启状态图标
    toggleBtn.textContent = '\uD83D\uDCAC'; // 💬

    // 根据初始状态调整样式
    updateToggleStyle();

    // 点击切换开关
    toggleBtn.addEventListener('click', function () {
      toggle();
    });

    document.body.appendChild(toggleBtn);
  }

  /**
   * 更新开关按钮样式
   */
  function updateToggleStyle() {
    if (!toggleBtn) return;
    if (isEnabled) {
      toggleBtn.style.opacity = '1';
      toggleBtn.style.transform = 'scale(1)';
      toggleBtn.title = '关闭弹幕';
    } else {
      toggleBtn.style.opacity = '0.5';
      toggleBtn.style.transform = 'scale(0.9)';
      toggleBtn.title = '开启弹幕';
    }
  }

  /**
   * 切换弹幕开关
   */
  function toggle() {
    isEnabled = !isEnabled;
    localStorage.setItem(CONFIG.STORAGE_KEY, isEnabled ? 'true' : 'false');
    updateToggleStyle();

    if (isEnabled) {
      startFiring();
    } else {
      stopFiring();
      // 关闭后不立即清除已有弹幕，等它们滑出屏幕后自动清除
    }
  }

  /**
   * 重置弹幕池（打乱顺序）
   */
  function resetPool() {
    remainingPool = danmakuData.slice();
    shuffleArray(remainingPool);
  }

  /**
   * 从弹幕池中取出一条（池空则重置）
   */
  function pickNormalDanmaku() {
    if (remainingPool.length === 0) {
      resetPool();
    }
    return remainingPool.pop();
  }

  /**
   * 从金色弹幕子集中随机抽取一条
   */
  function pickGoldenDanmaku() {
    return goldenDanmaku[Math.floor(Math.random() * goldenDanmaku.length)];
  }

  /**
   * Fisher-Yates 洗牌算法
   */
  function shuffleArray(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
  }

  /**
   * 选择一条可用轨道（优先选择不在冷却中的轨道）
   * @returns {number} 轨道索引
   */
  function pickTrack() {
    var now = Date.now();
    var availableTracks = [];

    // 收集不在冷却中的轨道
    for (var i = 0; i < CONFIG.TRACK_COUNT; i++) {
      if (now >= trackCooldowns[i]) {
        availableTracks.push(i);
      }
    }

    // 如果所有轨道都在冷却中，选冷却最早结束的
    if (availableTracks.length === 0) {
      var minCooldown = trackCooldowns[0];
      var minIdx = 0;
      for (var i = 1; i < CONFIG.TRACK_COUNT; i++) {
        if (trackCooldowns[i] < minCooldown) {
          minCooldown = trackCooldowns[i];
          minIdx = i;
        }
      }
      return minIdx;
    }

    // 从可用轨道中随机选一条
    return availableTracks[Math.floor(Math.random() * availableTracks.length)];
  }

  /**
   * 发射一条普通弹幕
   */
  function fireNormal() {
    if (!container) return;
    if (activeDanmaku.length >= CONFIG.MAX_DANMAKU) return;

    var data = pickNormalDanmaku();
    var track = pickTrack();

    // 计算垂直位置（按轨道均匀分布，顶部留出导航栏空间）
    var navHeight = 80; // 导航栏高度
    var availableHeight = window.innerHeight - navHeight - 60; // 底部留 60px
    var trackHeight = availableHeight / CONFIG.TRACK_COUNT;
    var topPos = navHeight + track * trackHeight + (trackHeight - 30) / 2;

    // 随机穿越时间
    var duration = CONFIG.SPEED_MIN + Math.random() * (CONFIG.SPEED_MAX - CONFIG.SPEED_MIN);

    // 设置轨道冷却（弹幕宽度估算 + 间距）
    var estimatedWidth = (data.name.length + data.text.length) * 14 + 60;
    var cooldownTime = (estimatedWidth / (window.innerWidth + estimatedWidth)) * duration * 1000 + 800;
    trackCooldowns[track] = Date.now() + cooldownTime;

    // 创建弹幕 DOM
    var el = createDanmakuElement(data, false);
    container.appendChild(el);

    // 初始位置：屏幕右侧外
    el.style.transform = 'translateX(' + window.innerWidth + 'px)';
    el.style.top = topPos + 'px';

    // 记录活跃弹幕
    var item = { el: el, startTime: Date.now(), duration: duration * 1000, golden: false };
    activeDanmaku.push(item);

    // 触发 GPU 加速动画
    requestAnimationFrame(function () {
      el.style.transition = 'transform ' + duration + 's linear';
      el.style.transform = 'translateX(-100%)';
    });

    // 动画结束后移除 DOM
    var removeDelay = duration * 1000 + 500;
    setTimeout(function () {
      removeDanmakuItem(item);
    }, removeDelay);
  }

  /**
   * 发射一条金色弹幕（固定中部停留后消失）
   */
  function fireGolden() {
    if (!container) return;

    var data = pickGoldenDanmaku();

    // 创建金色弹幕 DOM
    var el = createDanmakuElement(data, true);

    // 固定在屏幕中部
    el.style.top = '50%';
    el.style.left = '50%';
    el.style.transform = 'translate(-50%, -50%)';
    el.style.opacity = '0';

    container.appendChild(el);

    // 记录活跃弹幕
    var item = { el: el, startTime: Date.now(), duration: CONFIG.GOLDEN_STAY, golden: true };
    activeDanmaku.push(item);

    // 淡入
    requestAnimationFrame(function () {
      el.style.transition = 'opacity 0.5s ease-in';
      el.style.opacity = '1';
    });

    // 停留后淡出并移除
    setTimeout(function () {
      el.style.transition = 'opacity 0.5s ease-out';
      el.style.opacity = '0';
      setTimeout(function () {
        removeDanmakuItem(item);
      }, 600);
    }, CONFIG.GOLDEN_STAY);
  }

  /**
   * 创建弹幕 DOM 元素
   * @param {Object} data 弹幕数据 { text, color, name }
   * @param {boolean} isGolden 是否金色弹幕
   * @returns {HTMLElement} 弹幕 DOM
   */
  function createDanmakuElement(data, isGolden) {
    var el = document.createElement('div');
    el.className = isGolden ? 'lyg-danmaku lyg-danmaku--golden' : 'lyg-danmaku';
    el.style.cssText =
      'position:absolute;white-space:nowrap;' +
      'border-radius:20px;' +
      'padding:' + (isGolden ? '6px 18px' : '4px 14px') + ';' +
      'font-size:' + (isGolden ? '16px' : '14px') + ';' +
      'line-height:1.5;' +
      'font-family:"Noto Sans SC","Microsoft YaHei",sans-serif;' +
      'background:rgba(0,0,0,0.55);' +
      'color:#fff;' +
      'will-change:transform,opacity;' +
      (isGolden
        ? 'border:1.5px solid #FFD700;' +
          'box-shadow:0 0 12px rgba(255,215,0,0.4);' +
          'z-index:10;'
        : 'text-shadow:0 1px 2px rgba(0,0,0,0.3);');

    // 构建弹幕内容：昵称 + 评论
    var nameSpan = document.createElement('span');
    nameSpan.style.cssText = 'font-size:' + (isGolden ? '13px' : '12px') + ';opacity:0.7;';
    nameSpan.textContent = data.name + '\uFF1A';

    var textSpan = document.createElement('span');
    textSpan.textContent = data.text;
    textSpan.style.color = isGolden ? '#FFD700' : data.color;

    el.appendChild(nameSpan);
    el.appendChild(textSpan);

    return el;
  }

  /**
   * 移除一条弹幕并清理 DOM
   */
  function removeDanmakuItem(item) {
    var idx = activeDanmaku.indexOf(item);
    if (idx !== -1) {
      activeDanmaku.splice(idx, 1);
    }
    if (item.el && item.el.parentNode) {
      item.el.parentNode.removeChild(item.el);
    }
  }

  /**
   * 开始发射弹幕
   */
  function startFiring() {
    if (fireTimer) return; // 已在运行

    function scheduleNext() {
      if (!isEnabled) {
        fireTimer = null;
        return;
      }

      // 发射弹幕
      if (Math.random() < CONFIG.GOLDEN_CHANCE && activeDanmaku.length < CONFIG.MAX_DANMAKU) {
        fireGolden();
      } else {
        fireNormal();
      }

      // 随机间隔后发射下一条
      var interval = CONFIG.FIRE_INTERVAL_MIN +
        Math.random() * (CONFIG.FIRE_INTERVAL_MAX - CONFIG.FIRE_INTERVAL_MIN);
      fireTimer = setTimeout(scheduleNext, interval);
    }

    // 稍延迟启动，让页面先渲染完成
    fireTimer = setTimeout(scheduleNext, 1500);
  }

  /**
   * 停止发射弹幕
   */
  function stopFiring() {
    if (fireTimer) {
      clearTimeout(fireTimer);
      fireTimer = null;
    }
  }

  /* ========================================
   * 暴露到全局（供开关按钮等外部控制使用）
   * ======================================== */
  window.LygDanmaku = {
    toggle: toggle,
    isEnabled: function () { return isEnabled; },
    start: function () { isEnabled = true; localStorage.setItem(CONFIG.STORAGE_KEY, 'true'); updateToggleStyle(); startFiring(); },
    stop: function () { isEnabled = false; localStorage.setItem(CONFIG.STORAGE_KEY, 'false'); updateToggleStyle(); stopFiring(); }
  };

  /* ========================================
   * DOM 就绪后自动初始化
   * ======================================== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
