/**
 * 组件系统
 * 负责加载和管理所有组件
 */
class ComponentSystem {
  constructor() {
    this.components = [];
    this.containerSelector = '.grid';
    this.componentOrder = this.loadComponentOrder() || [];

    // 组件映射关系：{ 中文名: {目录名: 字符串, 全局变量名: 字符串} }
    this.componentNameMapping = {
      随机哔哩哔哩: {
        directory: 'BilibiliRandomVideo',
        globalVar: 'BilibiliRandomVideo',
      },
      随机小姐姐: {
        directory: 'RandomGirl',
        globalVar: 'RandomGirl',
      },
      随机黑丝: {
        directory: 'RandomHeisi',
        globalVar: 'RandomHeisi',
      },
      随机唱鸭: {
        directory: 'RandomSingDuck',
        globalVar: 'RandomSingDuck',
      },
      游戏中心: {
        directory: 'GameCenter',
        globalVar: 'GameCenter',
      },
      必应壁纸: {
        directory: 'Wallpaper',
        globalVar: 'Wallpaper',
      },
      快递查询: {
        directory: 'ExpressTracker',
        globalVar: 'ExpressTracker',
      },
      随机追剧: {
        directory: 'RandomTV',
        globalVar: 'RandomTV',
      },
      随机网易云: {
        directory: 'RandomNeteaseMusic',
        globalVar: 'RandomNeteaseMusic',
      },
      热榜: {
        directory: 'HotList',
        globalVar: 'HotList',
      },
      RSS阅读器: {
        directory: 'RSSReader',
        globalVar: 'RSSReader',
      },
      随机一本书: {
        directory: 'RandomBook',
        globalVar: 'RandomBook',
      },
      随机博客: {
        directory: 'RandomBlog',
        globalVar: 'RandomBlog',
      },
      随机炫猿导航: {
        directory: 'RandomXydh',
        globalVar: 'RandomXydh',
      },
      聊天室: {
        directory: 'ChatRoom',
        globalVar: 'ChatRoom',
      },
      工具箱: {
        directory: 'Toolbox',
        globalVar: 'Toolbox',
      },
      聚合一言: {
        directory: 'AggregateHitokoto',
        globalVar: 'AggregateHitokoto',
      },
      直播视界: {
        directory: 'LiveStream',
        globalVar: 'LiveStream',
      },
      // 可以在这里添加更多组件映射
    };

    // 获取所有支持的组件标识符（中文名称）
    this.allComponentNames = Object.keys(this.componentNameMapping);

    // 桌面上显示的组件列表
    this.desktopComponents = this.loadDesktopComponents() || [
      '随机哔哩哔哩',
      '随机小姐姐',
      '随机黑丝',
      '随机唱鸭',
      '游戏中心',
      '日历',
      '天气',
      '必应壁纸',
      '快递查询',
      '记事本',
      '网站库',
      '随机追剧',
      '随机网易云',
      '热榜',
      'RSS阅读器',
      '随机一本书',
      '随机博客',
      '随机炫猿导航',
      '聊天室',
      '随机诡异故事',
      '随机分页',
      '工具箱',
      '八宫格周视图',
      '倒数日',
      '食忆日历',
      '聚合一言',
      '直播视界',
      '音乐',
    ];

    // 组件库中显示的组件列表
    this.libraryComponents = this.loadLibraryComponents() || [
      '随机哔哩哔哩',
      '随机小姐姐',
      '随机黑丝',
      '随机唱鸭',
      '游戏中心',
      '日历',
      '天气',
      '必应壁纸',
      '快递查询',
      '记事本',
      '网站库',
      '随机追剧',
      '随机网易云',
      '热榜',
      'RSS阅读器',
      '随机一本书',
      '随机博客',
      '随机炫猿导航',
      '聊天室',
      '随机诡异故事',
      '随机分页',
      '工具箱',
      '八宫格周视图',
      '倒数日',
      '食忆日历',
      '聚合一言',
      '直播视界',
      '音乐',
    ];

    // 所有需要加载的组件（并集）
    this.allRequiredComponents = [
      ...new Set([...this.desktopComponents, ...this.libraryComponents]),
    ];
  }

  /**
   * 根据组件中文名获取目录名
   * @param {String} componentName - 组件的中文名称
   * @returns {String} 对应的目录名
   */
  getDirectoryName(componentName) {
    return this.componentNameMapping[componentName]?.directory || componentName;
  }

  /**
   * 根据组件中文名获取全局变量名
   * @param {String} componentName - 组件的中文名称
   * @returns {String} 对应的全局变量名
   */
  getGlobalVarName(componentName) {
    return this.componentNameMapping[componentName]?.globalVar;
  }

  /**
   * 注册新组件
   * @param {Object} ComponentClass - 组件类
   */
  register(ComponentClass) {
    try {
      const component = new ComponentClass();
      console.log(`注册组件 [${component.name}]`, {
        icon: component.icon,
        bgColor: component.bgColor,
        iconClass: component.iconClass,
        backgroundColor: component.backgroundColor,
      });

      // 确保组件有必要的属性
      if (!component.icon) {
        // 如果icon未设置但iconClass已设置，使用iconClass
        if (component.iconClass) {
          component.icon = component.iconClass;
          console.log(`组件 [${component.name}] 使用iconClass作为icon: ${component.icon}`);
        } else {
          component.icon = 'fa-puzzle-piece'; // 默认图标
          console.log(`组件 [${component.name}] 使用默认图标: ${component.icon}`);
        }
      }

      if (!component.bgColor) {
        // 如果bgColor未设置但backgroundColor已设置，使用backgroundColor
        if (component.backgroundColor) {
          component.bgColor = component.backgroundColor;
          console.log(
            `组件 [${component.name}] 使用backgroundColor作为bgColor: ${component.bgColor}`,
          );
        } else {
          component.bgColor = 'bg-blue-500'; // 默认背景色
          console.log(`组件 [${component.name}] 使用默认背景色: ${component.bgColor}`);
        }
      }

      if (!component.description) {
        component.description = `${component.name}组件`; // 默认描述
      }

      this.components.push(component);
      console.log(`组件 [${component.name}] 已注册完成，属性：`, {
        icon: component.icon,
        bgColor: component.bgColor,
        description: component.description,
      });

      // 如果是新组件，添加到排序列表末尾
      if (!this.componentOrder.includes(component.name)) {
        this.componentOrder.push(component.name);
        this.saveComponentOrder();
      }
    } catch (error) {
      console.error('注册组件失败:', error);
    }
  }

  /**
   * 渲染桌面组件到页面
   */
  renderDesktopComponents() {
    const container = document.querySelector(this.containerSelector);
    if (!container) {
      console.error(`找不到容器: ${this.containerSelector}`);
      return;
    }

    // 筛选出要在桌面显示的组件
    const componentsToRender = this.components.filter((comp) =>
      this.desktopComponents.includes(comp.name),
    );

    // 根据排序方式处理组件顺序
    let orderedComponents = [];

    if (this.useCustomOrder && this.componentOrders) {
      // 使用自定义排序（基于用户调整后的顺序）
      orderedComponents = [...componentsToRender].sort((a, b) => {
        const orderA = this.componentOrders[a.name] || 9999;
        const orderB = this.componentOrders[b.name] || 9999;
        return orderA - orderB;
      });

      console.log('使用自定义组件排序', this.componentOrders);
    } else {
      // 使用默认排序（组件放在最前面）
      // 按保存的顺序排序组件
      this.componentOrder.forEach((name) => {
        const component = componentsToRender.find((c) => c.name === name);
        if (component) {
          orderedComponents.push(component);
        }
      });

      // 将未在排序列表中的组件添加到末尾
      componentsToRender.forEach((component) => {
        if (!orderedComponents.includes(component)) {
          orderedComponents.push(component);
        }
      });
    }

    // 渲染自定义组件
    orderedComponents.forEach((component) => {
      // 检查是否已经存在同名组件元素
      const existingElement = container.querySelector(`[data-component-name="${component.name}"]`);

      // 如果已存在，则跳过
      if (existingElement) {
        return;
      }

      const html = component.render();

      // 使用文档片段提高性能
      const temp = document.createElement('template');
      temp.innerHTML = html.trim();

      // 确保组件元素有标识
      const componentElement = temp.content.firstChild;
      componentElement.setAttribute('data-custom-component', 'true');
      componentElement.setAttribute('data-component-name', component.name);

      // 根据排序策略决定插入位置
      if (this.useCustomOrder && this.componentOrders) {
        // 自定义排序时，根据order属性确定位置
        const order = this.componentOrders[component.name] || 0;

        // 找到应该插入的位置（找到第一个order值大于当前组件的元素）
        let insertBeforeElement = null;

        // 遍历所有元素，包括自定义组件和网站
        Array.from(container.children).forEach((element) => {
          const elementOrder = parseInt(element.getAttribute('data-order') || 9999);
          if (elementOrder > order && !insertBeforeElement) {
            insertBeforeElement = element;
          }
        });

        if (insertBeforeElement) {
          container.insertBefore(componentElement, insertBeforeElement);
        } else {
          container.appendChild(componentElement);
        }

        // 添加order属性
        componentElement.setAttribute('data-order', order);
      } else {
        // 默认排序时，组件放在最前面
        const firstDefaultApp = container.querySelector('.app-container');
        if (firstDefaultApp) {
          container.insertBefore(componentElement, firstDefaultApp);
        } else {
          container.appendChild(componentElement);
        }
      }
    });

    // 初始化组件事件
    orderedComponents.forEach((component) => {
      if (typeof component.init === 'function') {
        component.init();
      }
    });

    // 重新初始化 Sortable
    this.initSortable(container);

    // 触发组件渲染完成事件，让其他系统可以进行后续处理
    const event = new CustomEvent('componentsRendered', {
      detail: {
        container: container,
        components: orderedComponents,
      },
    });
    document.dispatchEvent(event);
    console.log('触发组件渲染完成事件');
  }

  /**
   * 获取组件库中显示的组件
   * @returns {Array} 组件对象数组
   */
  getLibraryComponents() {
    return this.components.filter((comp) => this.libraryComponents.includes(comp.name));
  }

  /**
   * 添加组件到桌面
   * @param {String} componentName - 组件名称
   */
  addToDesktop(componentName) {
    if (!this.desktopComponents.includes(componentName)) {
      this.desktopComponents.push(componentName);
      this.saveDesktopComponents();
    }
  }

  /**
   * 从桌面移除组件
   * @param {String} componentName - 组件名称
   */
  removeFromDesktop(componentName) {
    const index = this.desktopComponents.indexOf(componentName);
    if (index !== -1) {
      this.desktopComponents.splice(index, 1);
      this.saveDesktopComponents();
    }
  }

  /**
   * 添加组件到组件库
   * @param {String} componentName - 组件名称
   */
  addToLibrary(componentName) {
    if (!this.libraryComponents.includes(componentName)) {
      this.libraryComponents.push(componentName);
      this.saveLibraryComponents();
    }
  }

  /**
   * 从组件库移除组件
   * @param {String} componentName - 组件名称
   */
  removeFromLibrary(componentName) {
    const index = this.libraryComponents.indexOf(componentName);
    if (index !== -1) {
      this.libraryComponents.splice(index, 1);
      this.saveLibraryComponents();
    }
  }

  /**
   * 保存桌面组件列表到本地存储
   */
  saveDesktopComponents() {
    try {
      localStorage.setItem('desktop-components', JSON.stringify(this.desktopComponents));
    } catch (e) {
      console.error('保存桌面组件列表失败:', e);
    }
  }

  /**
   * 从本地存储加载桌面组件列表
   */
  loadDesktopComponents() {
    try {
      const saved = localStorage.getItem('desktop-components');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('加载桌面组件列表失败:', e);
      return null;
    }
  }

  /**
   * 保存组件库组件列表到本地存储
   */
  saveLibraryComponents() {
    try {
      localStorage.setItem('library-components', JSON.stringify(this.libraryComponents));
    } catch (e) {
      console.error('保存组件库组件列表失败:', e);
    }
  }

  /**
   * 从本地存储加载组件库组件列表
   */
  loadLibraryComponents() {
    try {
      const saved = localStorage.getItem('library-components');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('加载组件库组件列表失败:', e);
      return null;
    }
  }

  /**
   * 渲染所有组件到页面
   */
  renderAll() {
    const container = document.querySelector(this.containerSelector);
    if (!container) {
      console.error(`找不到容器: ${this.containerSelector}`);
      return;
    }

    // 获取第一个默认应用图标元素
    const firstDefaultApp = container.querySelector('.app-container');

    // 按保存的顺序排序组件
    const orderedComponents = [];
    this.componentOrder.forEach((name) => {
      const component = this.components.find((c) => c.name === name);
      if (component) {
        orderedComponents.push(component);
      }
    });

    // 将未在排序列表中的组件添加到末尾
    this.components.forEach((component) => {
      if (!orderedComponents.includes(component)) {
        orderedComponents.push(component);
      }
    });

    // 渲染所有组件
    orderedComponents.forEach((component) => {
      const html = component.render();

      // 使用文档片段提高性能
      const temp = document.createElement('template');
      temp.innerHTML = html.trim();

      // 确保组件元素有标识
      const componentElement = temp.content.firstChild;
      componentElement.setAttribute('data-custom-component', 'true');
      componentElement.setAttribute('data-component-name', component.name);

      // 将自定义组件插入到第一个应用之前
      if (firstDefaultApp) {
        container.insertBefore(componentElement, firstDefaultApp);
      } else {
        // 如果没有默认应用，则添加到容器末尾
        container.appendChild(componentElement);
      }
    });

    // 初始化组件事件
    this.components.forEach((component) => {
      if (typeof component.init === 'function') {
        component.init();
      }
    });

    // 重新初始化 Sortable
    this.initSortable(container);
  }

  /**
   * 初始化拖拽排序功能
   * @param {HTMLElement} container - 容器元素
   */
  initSortable(container) {
    if (!window.Sortable) {
      console.warn('Sortable库未加载，拖拽功能不可用');
      return;
    }

    // 检测是否为移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

    // 如果是移动设备，禁用拖拽功能
    if (isMobile) {
      console.log('检测到移动设备，拖拽功能已禁用');
      return null;
    }

    try {
      const sortable = Sortable.create(container, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        handle: '.app-icon', // 只能通过图标拖动
        onEnd: (evt) => {
          // 更新组件排序
          this.useCustomOrder = true;
          this.componentOrders = this.componentOrders || {};

          // 保存新的顺序
          Array.from(container.children).forEach((item, index) => {
            // 更新顺序属性
            item.setAttribute('data-order', index);

            if (item.hasAttribute('data-custom-component')) {
              // 是自定义组件
              const componentName = item.getAttribute('data-component-name');
              if (componentName) {
                this.componentOrders[componentName] = index;
              }
            }
          });

          // 保存排序信息
          this.saveComponentOrders();

          // 通知存储系统保存所有桌面数据
          if (window.storage && typeof window.storage.saveDesktopData === 'function') {
            window.storage.saveDesktopData();
          }
        },
      });

      return sortable;
    } catch (error) {
      console.error('初始化拖拽排序失败:', error);
      return null;
    }
  }

  /**
   * 更新组件的排序顺序
   */
  updateComponentOrder() {
    const container = document.querySelector(this.containerSelector);
    if (!container) return;

    const customComponentElements = container.querySelectorAll('[data-custom-component="true"]');
    const newOrder = [];

    customComponentElements.forEach((element) => {
      const nameElement = element.querySelector('span');
      if (nameElement) {
        const componentName = nameElement.textContent;
        newOrder.push(componentName);
      }
    });

    if (newOrder.length > 0) {
      this.componentOrder = newOrder;
      this.saveComponentOrder();
    }
  }

  /**
   * 保存组件顺序到本地存储
   */
  saveComponentOrder() {
    try {
      localStorage.setItem('custom-components-order', JSON.stringify(this.componentOrder));
    } catch (e) {
      console.error('保存组件顺序失败:', e);
    }
  }

  /**
   * 从本地存储加载组件顺序
   */
  loadComponentOrder() {
    try {
      const savedOrder = localStorage.getItem('custom-components-order');
      return savedOrder ? JSON.parse(savedOrder) : [];
    } catch (e) {
      console.error('加载组件顺序失败:', e);
      return [];
    }
  }

  /**
   * 加载所有组件脚本
   * @param {Array} componentNames - 要加载的组件名称数组
   * @returns {Promise} - 所有组件加载完成的Promise
   */
  loadComponents(componentNames) {
    const promises = componentNames.map((componentName) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        // 使用映射获取目录名
        const directoryName = this.getDirectoryName(componentName);
        script.src = `/components/${directoryName}/index.js`;
        script.onload = resolve;
        script.onerror = (e) => {
          console.error(`加载组件失败: ${componentName} (${directoryName})`, e);
          reject(e);
        };
        document.head.appendChild(script);
      });
    });

    return Promise.all(promises);
  }
}

// 创建全局组件系统实例
window.componentSystem = new ComponentSystem();

// 文档加载完成后初始化组件
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const componentSystem = window.componentSystem;

    // 只加载需要的组件（桌面或组件库中的）
    await componentSystem.loadComponents(componentSystem.allRequiredComponents);

    // 注册所有已加载的组件
    componentSystem.allRequiredComponents.forEach((componentName) => {
      const globalVarName = componentSystem.getGlobalVarName(componentName);

      if (globalVarName && window[globalVarName]) {
        componentSystem.register(window[globalVarName]);
      } else {
        console.error(`无法找到组件类: ${globalVarName}`);
      }
    });

    // 渲染桌面组件
    componentSystem.renderDesktopComponents();
  } catch (error) {
    console.error('加载组件失败:', error);
  }
});

// 清理ComponentLibrary模块，移除示例组件数据
const ComponentLibrary = (function () {
  // 公开API
  const api = {
    // 获取系统中注册的所有组件
    getComponents: function () {
      return window.componentSystem ? window.componentSystem.components : [];
    },

    // 根据名称获取组件
    getComponentByName: function (name) {
      if (!window.componentSystem) return null;
      return window.componentSystem.components.find((item) => item.name === name) || null;
    },

    // 初始化组件点击事件
    initComponentEvents: function (formElements) {
      const { siteUrl, siteName, iconPreview } = formElements;

      // 查找所有组件元素
      const componentItems = document.querySelectorAll('.component-item');
      let selectedComponent = null;

      // 添加点击事件
      componentItems.forEach((item) => {
        item.addEventListener('click', function () {
          // 移除之前选中的组件的选中状态
          componentItems.forEach((comp) =>
            comp.classList.remove(
              'bg-blue-100',
              'border',
              'border-blue-300',
              'border-primary',
              'bg-blue-50',
            ),
          );

          // 为当前点击的组件添加选中状态
          this.classList.add('border-primary', 'bg-blue-50');

          // 记录选中的组件名称
          const compName = this.getAttribute('data-component-name');
          selectedComponent = compName;
        });
      });

      // 返回获取当前选中的组件的方法
      return {
        getSelectedComponent: function () {
          return selectedComponent;
        },
        resetSelection: function () {
          selectedComponent = null;
          componentItems.forEach((comp) =>
            comp.classList.remove(
              'bg-blue-100',
              'border',
              'border-blue-300',
              'border-primary',
              'bg-blue-50',
            ),
          );
        },
      };
    },
  };

  return api;
})();

// 如果在浏览器环境，将模块导出到全局
if (typeof window !== 'undefined') {
  window.ComponentLibrary = ComponentLibrary;
}

// 如果支持模块导出，也提供模块导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ComponentLibrary;
}
