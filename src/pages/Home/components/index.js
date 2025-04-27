/**
 * 组件系统
 * 负责加载和管理所有组件
 */
class ComponentSystem {
  constructor() {
    this.components = [];
    // React中ref会将元素通过ID或特殊属性标记
    this.containerSelectors = [
      '[class*="shortcutsSection"]', // 处理模块化CSS的情况
      '.shortcutsSection',
      '#shortcutsRef',
      'div[ref="shortcutsRef"]',
    ];
    this.componentOrder = this.loadComponentOrder() || [];
    // 初始化组件顺序映射
    this.componentOrders = this.loadComponentOrders() || {};
    // 初始化网站快捷方式排序
    this.websiteSortOrder = this.loadWebsiteShortcutsOrder() || [];
    // 使用自定义顺序标志
    this.useCustomOrder = Boolean(Object.keys(this.componentOrders).length);

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
      '游戏中心',
      '工具箱',
      '随机小姐姐',
      '随机黑丝',
      '随机哔哩哔哩',
    ];

    // 组件库中显示的组件列表
    this.libraryComponents = this.loadLibraryComponents() || [
      '游戏中心',
      '工具箱',
      '随机小姐姐',
      '随机黑丝',
      '随机哔哩哔哩',
      '随机唱鸭',
      '必应壁纸',
      '快递查询',
      '随机追剧',
      '热榜',
      'RSS阅读器',
      '随机一本书',
      '随机博客',
      '随机炫猿导航',
      '聚合一言',
      '直播视界',
    ];

    // 所有需要加载的组件（包含所有componentNameMapping中的组件）
    this.allRequiredComponents = [...this.allComponentNames];
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

      // 确保组件有必要的属性
      if (!component.icon) {
        // 如果icon未设置但iconClass已设置，使用iconClass
        if (component.iconClass) {
          component.icon = component.iconClass;
        } else {
          component.icon = 'fa-puzzle-piece'; // 默认图标
        }
      }

      if (!component.bgColor) {
        // 如果bgColor未设置但backgroundColor已设置，使用backgroundColor
        if (component.backgroundColor) {
          component.bgColor = component.backgroundColor;
        } else {
          component.bgColor = 'bg-blue-500'; // 默认背景色
        }
      }

      if (!component.description) {
        component.description = `${component.name}组件`; // 默认描述
      }

      this.components.push(component);

      // 如果是新组件，添加到排序列表末尾
      if (!this.componentOrder.includes(component.name)) {
        this.componentOrder.push(component.name);
        this.saveComponentOrder();
      }
    } catch (error) {}
  }

  /**
   * 查找渲染容器
   * @returns {HTMLElement|null} 找到的容器元素
   */
  findContainer() {
    for (const selector of this.containerSelectors) {
      const container = document.querySelector(selector);
      if (container) {
        return container;
      }
    }

    // 尝试查找快捷方式包装元素
    const shortcutWrappers = document.querySelectorAll('[class*="shortcutWrapper"]');
    if (shortcutWrappers.length > 0) {
      const parentElement = shortcutWrappers[0].parentElement;
      if (parentElement) {
        return parentElement;
      }
    }

    return null;
  }

  /**
   * 渲染桌面组件到页面
   */
  renderDesktopComponents() {
    const container = this.findContainer();

    if (!container) {
      return;
    }

    // 筛选出要在桌面显示的组件
    const componentsToRender = this.components.filter((comp) =>
      this.desktopComponents.includes(comp.name),
    );

    // 如果没有组件要渲染，提前返回
    if (componentsToRender.length === 0) {
      return;
    }

    // 根据排序方式处理组件顺序
    let orderedComponents = [];

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

      // 默认排序时，组件放在最前面
      const firstDefaultApp = container.querySelector('.app-container');
      if (firstDefaultApp) {
        container.insertBefore(componentElement, firstDefaultApp);
      } else {
        container.appendChild(componentElement);
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

    // 转换所有组件为React样式
    if (window.ComponentWrapper) {
      setTimeout(() => {
        window.ComponentWrapper.convertAllComponents(container);
      }, 100);
    }
  }

  /**
   * 获取组件库中显示的组件
   * @returns {Array} 组件对象数组
   */
  getLibraryComponents() {
    // 只返回libraryComponents列表中的组件
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

      // 添加后立即渲染组件
      setTimeout(() => {
        this.renderDesktopComponents();
      }, 100);
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

      // 从DOM中删除组件元素
      const container = this.findContainer();
      if (container) {
        // 查找带有特定组件名称的元素
        const componentElement = container.querySelector(
          `[data-component-name="${componentName}"]`,
        );
        if (componentElement) {
          componentElement.remove();
        } else {
          console.warn(`未找到要移除的组件元素 [${componentName}]`);
        }
      }
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
    } catch (e) {}
  }

  /**
   * 从本地存储加载桌面组件列表
   */
  loadDesktopComponents() {
    try {
      const saved = localStorage.getItem('desktop-components');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * 保存组件库组件列表到本地存储
   */
  saveLibraryComponents() {
    try {
      localStorage.setItem('library-components', JSON.stringify(this.libraryComponents));
    } catch (e) {}
  }

  /**
   * 从本地存储加载组件库组件列表
   */
  loadLibraryComponents() {
    try {
      const saved = localStorage.getItem('library-components');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * 渲染所有组件到页面
   */
  renderAll() {
    const container = document.querySelector(this.containerSelector);
    if (!container) {
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
    if (!window.Sortable && !window.Sortablejs) {
      console.warn('Sortable库未加载，拖拽功能不可用');
      return;
    }

    // 使用可用的Sortable库
    const SortableLib = window.Sortable || window.Sortablejs;

    // 检测是否为移动设备
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

    // 如果是移动设备，禁用拖拽功能
    if (isMobile) {
      return null;
    }

    try {
      const sortable = SortableLib.create(container, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        handle: '.app-icon', // 只能通过图标拖动
        onEnd: (evt) => {
          // 更新组件排序
          this.useCustomOrder = true;
          this.componentOrders = this.componentOrders || {};

          // 调用更新组件顺序方法
          this.updateComponentOrder();

          // 保存新的顺序
          Array.from(container.children).forEach((item, index) => {
            // 更新顺序属性
            if (item) {
              item.setAttribute('data-order', index);

              if (item.hasAttribute && item.hasAttribute('data-custom-component')) {
                // 是自定义组件
                const componentName = item.getAttribute('data-component-name');
                if (componentName) {
                  this.componentOrders[componentName] = index;
                }
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
      return null;
    }
  }

  /**
   * 更新组件的排序顺序
   */
  updateComponentOrder() {
    const container = this.findContainer();
    if (!container) return;

    // 获取容器中所有的组件元素（包括自定义组件和网站快捷方式）
    const allElements = Array.from(container.children);
    const newOrder = [];
    const websiteOrder = []; // 新增：保存网站类型快捷方式的顺序

    // 遍历所有元素，获取组件名称和网站快捷方式
    allElements.forEach((element) => {
      // 检查是否是自定义组件
      if (element && element.hasAttribute && element.hasAttribute('data-custom-component')) {
        const componentName = element.getAttribute('data-component-name');
        if (componentName) {
          newOrder.push(componentName);
        }
      }
      // 新增：检查是否是网站快捷方式
      else if (element && element.hasAttribute && element.hasAttribute('data-website-shortcut')) {
        const shortcutTitle = element.getAttribute('data-shortcut-title');
        if (shortcutTitle) {
          websiteOrder.push(shortcutTitle);
        }
      }
    });

    // 只有在找到至少一个组件的情况下才更新顺序
    if (newOrder.length > 0) {
      this.componentOrder = newOrder;
      this.saveComponentOrder();

      // 重新排序组件系统中的desktopComponents数组，确保它与当前DOM顺序一致
      const newDesktopComponents = [];

      // 首先添加按照新顺序排列的组件
      newOrder.forEach((name) => {
        if (name && this.desktopComponents.includes(name)) {
          newDesktopComponents.push(name);
        }
      });

      // 然后添加任何剩余的桌面组件（以防有些组件在DOM中不可见）
      this.desktopComponents.forEach((name) => {
        if (name && !newDesktopComponents.includes(name)) {
          newDesktopComponents.push(name);
        }
      });

      // 更新桌面组件列表并保存
      this.desktopComponents = newDesktopComponents;
      this.saveDesktopComponents();
    }

    // 新增：保存网站快捷方式顺序
    if (websiteOrder.length > 0) {
      // 更新内部存储
      this.websiteSortOrder = websiteOrder;
      // 保存到localStorage
      try {
        localStorage.setItem('website-shortcuts-order', JSON.stringify(websiteOrder));
      } catch (e) {}
    }
  }

  /**
   * 保存组件顺序到本地存储
   */
  saveComponentOrder() {
    try {
      // 过滤掉无效数据再保存
      const validOrder = this.componentOrder.filter((item) => item);
      localStorage.setItem('custom-components-order', JSON.stringify(validOrder));
    } catch (e) {}
  }

  /**
   * 从本地存储加载组件顺序
   */
  loadComponentOrder() {
    try {
      const savedOrder = localStorage.getItem('custom-components-order');
      const parsedOrder = savedOrder ? JSON.parse(savedOrder) : [];
      // 过滤掉可能的无效数据
      return Array.isArray(parsedOrder) ? parsedOrder.filter((item) => item) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * 从本地存储加载网站快捷方式排序
   */
  loadWebsiteShortcutsOrder() {
    try {
      const savedOrder = localStorage.getItem('website-shortcuts-order');
      const parsedOrder = savedOrder ? JSON.parse(savedOrder) : [];
      return Array.isArray(parsedOrder) ? parsedOrder.filter((item) => item) : [];
    } catch (e) {
      return [];
    }
  }

  /**
   * 保存组件顺序列表到本地存储
   */
  saveComponentOrders() {
    try {
      if (this.componentOrders) {
        // 清理可能的无效数据
        const cleanedOrders = {};
        Object.entries(this.componentOrders).forEach(([key, value]) => {
          if (key && value !== undefined && value !== null) {
            cleanedOrders[key] = value;
          }
        });
        localStorage.setItem('component-orders', JSON.stringify(cleanedOrders));
      }
    } catch (e) {}
  }

  /**
   * 从本地存储加载组件顺序列表
   */
  loadComponentOrders() {
    try {
      const savedOrders = localStorage.getItem('component-orders');
      const parsedOrders = savedOrders ? JSON.parse(savedOrders) : {};
      // 验证是一个有效的对象
      return typeof parsedOrders === 'object' && parsedOrders !== null ? parsedOrders : {};
    } catch (e) {
      return {};
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
        script.onload = () => {
          resolve();
        };
        script.onerror = (e) => {
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
      }
    });

    // 确认组件注册结果
    console.log(
      '已注册的组件:',
      componentSystem.components.map((comp) => comp.name),
    );

    // 渲染桌面组件

    componentSystem.renderDesktopComponents();
  } catch (error) {}
});

// 确保在页面完全加载后也尝试渲染组件

window.onload = function () {
  if (window.componentSystem) {
    window.componentSystem.renderDesktopComponents();
  }
};

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

/**
 * 组件包装器
 * 负责将组件系统生成的原生组件样式转换为React Shortcut组件样式
 */
class ComponentWrapper {
  /**
   * 将所有原生组件转换为React风格组件
   * @param {HTMLElement} container - 容器元素
   */
  static convertAllComponents(container) {
    if (!container) return;

    // 查找所有原生组件 - 修复选择器，防止重复添加
    const nativeComponents = container.querySelectorAll(
      '.app-container[data-custom-component="true"]:not(.converted)',
    );

    nativeComponents.forEach((component) => {
      ComponentWrapper.convertComponent(component);
      // 标记为已转换
      component.classList.add('converted');
    });
  }

  /**
   * 转换单个组件
   * @param {HTMLElement} component - 组件元素
   */
  static convertComponent(component) {
    if (!component) return;

    // 获取组件名称
    const componentName = component.getAttribute('data-component-name');
    if (!componentName) return;

    // 检查是否已经存在同名的React风格组件
    const existingReactComponent = document.querySelector(
      `.shortcutWrapper___bmAvR[data-component-name="${componentName}"]`,
    );
    if (existingReactComponent) {
      return;
    }

    // 获取原组件的图标和元素
    const iconElement = component.querySelector('.app-icon');
    if (!iconElement) return;

    // 获取背景色和图标类名
    const bgColorClass =
      Array.from(iconElement.classList).find((cls) => cls.startsWith('bg-')) || 'bg-blue-500';
    const iconClass =
      iconElement.querySelector('i')?.className || 'fa-puzzle-piece text-white text-2xl';

    // 创建新的React风格组件结构
    const newHtml = `
      <div class="shortcutWrapper___bmAvR">
        <div class="shortcut___hastY">
          <div class="iconWrapper___KH5xY">
            <div class="${bgColorClass} rounded-md w-full h-full flex items-center justify-center">
              <i class="${iconClass.replace('text-2xl', 'text-xl')}"></i>
            </div>
          </div>
          <div class="title___V8Vc9">${componentName}</div>
        </div>
      </div>
    `;

    // 使用文档片段提高性能
    const temp = document.createElement('template');
    temp.innerHTML = newHtml.trim();
    const newComponent = temp.content.firstChild;

    // 保留原组件的属性
    newComponent.setAttribute('data-custom-component', 'true');
    newComponent.setAttribute('data-component-name', componentName);
    if (component.id) {
      newComponent.querySelector('.shortcut___hastY').id = component.id;
    }

    // 添加右键菜单事件
    newComponent.addEventListener('contextmenu', (e) => {
      // 检查是否存在全局事件处理函数
      if (window.handleComponentContextMenu) {
        window.handleComponentContextMenu(e, {
          title: componentName,
          type: 'component',
          icon: iconClass,
          bgColor: bgColorClass,
          component: componentName,
        });
      }
    });

    // 添加点击事件
    newComponent.addEventListener('click', () => {
      // 如果存在openComponent函数，则调用
      if (window.openComponent && componentName) {
        window.openComponent(componentName);
      }
    });

    // 替换原组件
    component.parentNode.replaceChild(newComponent, component);

    return newComponent;
  }
}

// 将包装器添加到全局对象
window.ComponentWrapper = ComponentWrapper;

/**
 * 组件桥接系统
 * 用于在React中打开组件弹窗
 */

// 组件桥接函数映射
const componentBridges = {};

// 创建通用组件加载函数
function loadComponent(componentName) {
  // 从组件系统中获取目录名和全局变量名
  let directoryName = componentName;
  let globalVarName = componentName;

  // 如果存在组件系统，使用映射关系
  if (
    window.componentSystem &&
    window.componentSystem.componentNameMapping &&
    window.componentSystem.componentNameMapping[componentName]
  ) {
    directoryName = window.componentSystem.componentNameMapping[componentName].directory;
    globalVarName = window.componentSystem.componentNameMapping[componentName].globalVar;
  } else {
  }

  // 检查全局变量中是否已经存在此组件
  if (window[globalVarName]) {
    try {
      const component = new window[globalVarName]();
      if (typeof component.handleClick === 'function') {
        component.handleClick();
      } else {
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  // 尝试加载组件脚本
  return new Promise((resolve) => {
    // 构建组件路径，从 public 目录加载
    const scriptUrl = `/components/${directoryName}/index.js`;

    const script = document.createElement('script');
    script.src = scriptUrl;

    script.onload = function () {
      if (window[globalVarName]) {
        try {
          const component = new window[globalVarName]();

          if (typeof component.handleClick === 'function') {
            component.handleClick();
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (e) {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    };

    script.onerror = function () {
      resolve(false);
    };

    document.head.appendChild(script);
  });
}

// 对外暴露的调用接口
window.openComponent = function (componentName) {
  // 如果已经有定义的桥接函数，直接使用
  if (componentBridges[componentName]) {
    return componentBridges[componentName]();
  }

  // 否则尝试加载组件
  return loadComponent(componentName);
};
