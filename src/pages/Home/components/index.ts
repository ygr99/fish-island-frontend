import Sortable from 'sortablejs'; // 尝试导入 Sortable 类型

export {}; // 确保这是一个模块

/**
 * 组件系统
 * 负责加载和管理所有组件
 */
console.log('[CS Top Level] src/pages/Home/components/index.js script executing...');

// 定义组件接口
interface IComponent {
  name: string;
  icon?: string;
  bgColor?: string;
  description?: string;
  render: () => string; // 假设 render 返回 HTML 字符串
  init?: () => void;
  // 添加其他可能需要的属性
  [key: string]: any;
}

// 定义组件构造函数类型
type ComponentClass = new () => IComponent;

// 定义组件名称映射的类型
interface ComponentNameMapping {
  [key: string]: { directory: string; globalVar: string };
}

// 定义 ComponentSystem 类的属性类型
class ComponentSystem {
  components: IComponent[];
  containerSelector: string;
  componentOrder: string[];
  componentNameMapping: ComponentNameMapping;
  allComponentNames: string[];
  desktopComponents: string[];
  libraryComponents: string[];
  allRequiredComponents: string[];
  useCustomOrder?: boolean;
  componentOrders?: Record<string, number>;

  constructor() {
    this.components = [];
    this.containerSelector = '.shortcutsSection';
    this.componentOrder = this.loadComponentOrder() || [];

    // 组件映射关系
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
      日历: {
        directory: 'Calendar',
        globalVar: 'Calendar',
      },
      天气: {
        directory: 'Weather',
        globalVar: 'Weather',
      },
      必应壁纸: {
        directory: 'Wallpaper',
        globalVar: 'Wallpaper',
      },
      快递查询: {
        directory: 'ExpressTracker',
        globalVar: 'ExpressTracker',
      },
      记事本: {
        directory: 'Notepad',
        globalVar: 'Notepad',
      },
      网站库: {
        directory: 'WebsiteLibrary',
        globalVar: 'WebsiteLibrary',
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
      随机诡异故事: {
        directory: 'RandomStrangeTale',
        globalVar: 'RandomStrangeTale',
      },
      随机分页: {
        directory: 'PaginatedSites',
        globalVar: 'PaginatedSites',
      },
      工具箱: {
        directory: 'Toolbox',
        globalVar: 'Toolbox',
      },
      八宫格周视图: {
        directory: 'WeeklyPlanner',
        globalVar: 'WeeklyPlanner',
      },
      倒数日: {
        directory: 'Countdown',
        globalVar: 'Countdown',
      },
      食忆日历: {
        directory: 'FoodMemoryCalendar',
        globalVar: 'FoodMemoryCalendar',
      },
      聚合一言: {
        directory: 'AggregateHitokoto',
        globalVar: 'AggregateHitokoto',
      },
      直播视界: {
        directory: 'LiveStream',
        globalVar: 'LiveStream',
      },
      音乐: {
        directory: 'Music',
        globalVar: 'Music',
      },
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
      '随机小姐姐',
      '随机哔哩哔哩',
      '随机黑丝',
      '随机唱鸭',
      '游戏中心'
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
  getDirectoryName(componentName: string): string {
    return this.componentNameMapping[componentName]?.directory || componentName;
  }

  /**
   * 根据组件中文名获取全局变量名
   * @param {String} componentName - 组件的中文名称
   * @returns {String} 对应的全局变量名
   */
  getGlobalVarName(componentName: string): string | undefined {
    return this.componentNameMapping[componentName]?.globalVar;
  }

  /**
   * 注册新组件
   * @param {Object} ComponentClass - 组件类
   */
  register(ComponentClass: ComponentClass): void {
    try {
      const component = new ComponentClass();

      // 确保组件有必要的属性
      if (!component.icon) {
        component.icon = 'fa-puzzle-piece'; // 默认图标
      }

      if (!component.bgColor) {
        component.bgColor = 'bg-blue-500'; // 默认背景色
      }

      if (!component.description) {
        component.description = `${component.name}组件`; // 默认描述
      }

      this.components.push(component);
      console.log(`组件 [${component.name}] 已注册`);

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
  renderDesktopComponents(): void {
    const container = document.querySelector<HTMLElement>(this.containerSelector);
    console.log(`尝试查找容器: ${this.containerSelector}，结果:`, container);
    if (!container) {
      console.error(`找不到容器: ${this.containerSelector}`);
      return;
    }

    // 筛选出要在桌面显示的组件
    const componentsToRender = this.components.filter((comp: IComponent) =>
      this.desktopComponents.includes(comp.name),
    );

    // 根据排序方式处理组件顺序
    let orderedComponents: IComponent[] = [];

    if (this.useCustomOrder && this.componentOrders) {
      // 使用自定义排序（基于用户调整后的顺序）
      orderedComponents = [...componentsToRender].sort((a: IComponent, b: IComponent) => {
        const orderA = this.componentOrders![a.name] || 9999;
        const orderB = this.componentOrders![b.name] || 9999;
        return orderA - orderB;
      });

      console.log('使用自定义组件排序', this.componentOrders);
    } else {
      // 使用默认排序（组件放在最前面）
      // 按保存的顺序排序组件
      this.componentOrder.forEach((name: string) => {
        const component = componentsToRender.find((c: IComponent) => c.name === name);
        if (component) {
          orderedComponents.push(component);
        }
      });

      // 将未在排序列表中的组件添加到末尾
      componentsToRender.forEach((component: IComponent) => {
        if (!orderedComponents.includes(component)) {
          orderedComponents.push(component);
        }
      });
    }

    // 渲染自定义组件
    orderedComponents.forEach((component: IComponent) => {
      // 检查是否已经存在同名组件元素
      const existingElement = container.querySelector<HTMLElement>(`[data-component-name="${component.name}"]`);

      // 如果已存在，则跳过
      if (existingElement) {
        return;
      }

      const html = component.render();

      // 使用文档片段提高性能
      const temp = document.createElement('template');
      temp.innerHTML = html.trim();

      // 确保组件元素有标识
      const componentElement = temp.content.firstChild as HTMLElement | null;
      if (componentElement) {
        componentElement.setAttribute('data-custom-component', 'true');
        componentElement.setAttribute('data-component-name', component.name);

        // 根据排序策略决定插入位置
        if (this.useCustomOrder && this.componentOrders) {
          // 自定义排序时，根据order属性确定位置
          const order = this.componentOrders[component.name] || 0;

          // 找到应该插入的位置（找到第一个order值大于当前组件的元素）
          let insertBeforeElement: Element | null = null;

          // 遍历所有元素，包括自定义组件和网站
          Array.from(container.children).forEach((element: Element) => {
            const elementOrderAttr = element.getAttribute('data-order');
            const elementOrder = elementOrderAttr ? parseInt(elementOrderAttr) : 9999;
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
          componentElement.setAttribute('data-order', order.toString());
        } else {
          // 默认排序时，组件放在最前面
          const firstDefaultApp = container.querySelector<HTMLElement>('.app-container');
          if (firstDefaultApp) {
            container.insertBefore(componentElement, firstDefaultApp);
          } else {
            container.appendChild(componentElement);
          }
        }
      }
    });

    // 初始化组件事件
    orderedComponents.forEach((component: IComponent) => {
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
  getLibraryComponents(): IComponent[] {
    return this.components.filter((comp: IComponent) => this.libraryComponents.includes(comp.name));
  }

  /**
   * 添加组件到桌面
   * @param {String} componentName - 组件名称
   */
  addToDesktop(componentName: string): void {
    if (!this.desktopComponents.includes(componentName)) {
      this.desktopComponents.push(componentName);
      this.saveDesktopComponents();
    }
  }

  /**
   * 从桌面移除组件
   * @param {String} componentName - 组件名称
   */
  removeFromDesktop(componentName: string): void {
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
  addToLibrary(componentName: string): void {
    if (!this.libraryComponents.includes(componentName)) {
      this.libraryComponents.push(componentName);
      this.saveLibraryComponents();
    }
  }

  /**
   * 从组件库移除组件
   * @param {String} componentName - 组件名称
   */
  removeFromLibrary(componentName: string): void {
    const index = this.libraryComponents.indexOf(componentName);
    if (index !== -1) {
      this.libraryComponents.splice(index, 1);
      this.saveLibraryComponents();
    }
  }

  /**
   * 保存桌面组件列表到本地存储
   */
  saveDesktopComponents(): void {
    try {
      localStorage.setItem('desktop-components', JSON.stringify(this.desktopComponents));
    } catch (e) {
      console.error('保存桌面组件列表失败:', e);
    }
  }

  /**
   * 从本地存储加载桌面组件列表
   */
  loadDesktopComponents(): string[] | null {
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
  saveLibraryComponents(): void {
    try {
      localStorage.setItem('library-components', JSON.stringify(this.libraryComponents));
    } catch (e) {
      console.error('保存组件库组件列表失败:', e);
    }
  }

  /**
   * 从本地存储加载组件库组件列表
   */
  loadLibraryComponents(): string[] {
    try {
      const saved = localStorage.getItem('library-components');
      // 返回解析的数据，如果没有数据则返回空数组（而不是null）
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('加载组件库组件列表失败:', e);
      // 出错时返回空数组
      return [];
    }
  }

  /**
   * 渲染所有组件到页面
   */
  renderAll(): void {
    const container = document.querySelector<HTMLElement>(this.containerSelector);
    if (!container) {
      console.error(`找不到容器: ${this.containerSelector}`);
      return;
    }

    // 获取第一个默认应用图标元素
    const firstDefaultApp = container.querySelector<HTMLElement>('.app-container');

    // 按保存的顺序排序组件
    let orderedComponents: IComponent[] = [];
    this.componentOrder.forEach((name: string) => {
      const component = this.components.find((c: IComponent) => c.name === name);
      if (component) {
        orderedComponents.push(component);
      }
    });

    // 将未在排序列表中的组件添加到末尾
    this.components.forEach((component: IComponent) => {
      if (!orderedComponents.includes(component)) {
        orderedComponents.push(component);
      }
    });

    // 渲染所有组件
    orderedComponents.forEach((component: IComponent) => {
      const html = component.render();

      // 使用文档片段提高性能
      const temp = document.createElement('template');
      temp.innerHTML = html.trim();

      // 确保组件元素有标识
      const componentElement = temp.content.firstChild as HTMLElement | null;
      if (componentElement) {
        componentElement.setAttribute('data-custom-component', 'true');
        componentElement.setAttribute('data-component-name', component.name);

        // 将自定义组件插入到第一个应用之前
        if (firstDefaultApp) {
          container.insertBefore(componentElement, firstDefaultApp);
        } else {
          // 如果没有默认应用，则添加到容器末尾
          container.appendChild(componentElement);
        }
      }
    });

    // 初始化组件事件
    this.components.forEach((component: IComponent) => {
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
  initSortable(container: HTMLElement): Sortable | null {
    // 尝试使用 window.Sortable，如果不存在则使用导入的 Sortable
    const SortableInstance = window.Sortable || Sortable;

    if (!SortableInstance) {
      console.warn('Sortable库未加载，拖拽功能不可用');
      return null;
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
      const sortable = SortableInstance.create(container, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        handle: '.app-icon', // 只能通过图标拖动
        onEnd: (evt: Sortable.SortableEvent) => {
          // 更新组件排序
          this.useCustomOrder = true;
          this.componentOrders = this.componentOrders || {};

          // 保存新的顺序
          Array.from(container.children).forEach((item: Element, index: number) => {
            // 更新顺序属性
            item.setAttribute('data-order', index.toString());

            if (item.hasAttribute('data-custom-component')) {
              // 是自定义组件
              const componentName = item.getAttribute('data-component-name');
              if (componentName) {
                this.componentOrders![componentName] = index;
              }
            }
          });

          // 保存排序信息
          this.saveComponentOrders();

          // 通知存储系统保存所有桌面数据
          // 使用类型断言来访问可能的 window.storage
          const storage = window.storage as { saveDesktopData?: () => void } | undefined;
          if (storage && typeof storage.saveDesktopData === 'function') {
            storage.saveDesktopData();
          }
        },
      });

      return sortable;
    } catch (error) {
      console.error('初始化拖拽排序失败:', error);
      return null;
    }
  }

  // 添加 saveComponentOrders 的声明，即使它不存在也要声明，或者实现它
  saveComponentOrders(): void {
    try {
      localStorage.setItem('component-orders', JSON.stringify(this.componentOrders));
    } catch (e) {
      console.error('保存组件自定义顺序失败:', e);
    }
  }

  /**
   * 更新组件的排序顺序
   */
  updateComponentOrder(): void {
    const container = document.querySelector<HTMLElement>(this.containerSelector);
    if (!container) return;

    const customComponentElements = container.querySelectorAll<HTMLElement>('[data-custom-component="true"]');
    const newOrder: string[] = [];

    customComponentElements.forEach((element: HTMLElement) => {
      // 尝试更可靠地获取组件名称，例如从 data-* 属性
      const componentName = element.getAttribute('data-component-name');
      if (componentName) {
        newOrder.push(componentName);
      } else {
        // 作为后备，尝试从 span 获取
        const nameElement = element.querySelector('span');
        if (nameElement && nameElement.textContent) {
          newOrder.push(nameElement.textContent);
        }
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
  saveComponentOrder(): void {
    try {
      localStorage.setItem('custom-components-order', JSON.stringify(this.componentOrder));
    } catch (e) {
      console.error('保存组件顺序失败:', e);
    }
  }

  /**
   * 从本地存储加载组件顺序
   */
  loadComponentOrder(): string[] {
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
  loadComponents(componentNames: string[]): Promise<void[]> {
    console.log('[CS] 开始加载组件:', componentNames);
    
    // 先检查RandomGirl组件文件是否真的存在
    const checkRandomGirl = new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('HEAD', '/components/RandomGirl/index.js', true);
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 400) {
          console.log('[CS] RandomGirl组件文件存在且可访问');
        } else {
          console.error('[CS] RandomGirl组件文件不存在或无法访问:', xhr.status);
        }
        resolve();
      };
      xhr.onerror = function() {
        console.error('[CS] 检查RandomGirl组件文件时发生错误');
        resolve();
      };
      xhr.send();
    });

    return checkRandomGirl.then(() => {
      const promises = componentNames.map((componentName: string) => {
        return new Promise<void>((resolve, reject) => { // Promise<void> 因为我们只关心加载完成
          const script = document.createElement('script');
          // 使用映射获取目录名
          const directoryName = this.getDirectoryName(componentName);
          // 假设组件脚本最终位于 /components/目录下
          const scriptPath = `/components/${directoryName}/index.js`;
          console.log(`[CS] 尝试加载组件脚本: ${scriptPath} (${componentName})`);
          
          script.src = scriptPath;
          script.onload = () => {
            console.log(`[CS] 组件脚本加载成功: ${componentName}`);
            
            // 检查全局变量是否定义
            const globalVarName = this.getGlobalVarName(componentName);
            const ComponentClass = (window as any)[globalVarName || ''];
            if (ComponentClass) {
              console.log(`[CS] 检测到组件类已定义: ${globalVarName}`);
            } else {
              console.warn(`[CS] 组件类未定义: ${globalVarName}`);
            }
            
            resolve();
          }; 
          
          script.onerror = (e) => {
            console.error(`[CS] 加载组件失败: ${componentName} (${directoryName})`, e);
            resolve(); // 即使失败也resolve，以免阻止其他组件加载
          };
          
          document.head.appendChild(script);
        });
      });

      return Promise.all(promises);
    });
  }
}

// --- ComponentLibrary IIFE 类型修复 ---

interface ComponentLibraryAPI {
  getComponents: () => IComponent[];
  getComponentByName: (name: string) => IComponent | null;
  initComponentEvents: (formElements: Record<string, HTMLElement>) => {
    getSelectedComponent: () => string | null;
    resetSelection: () => void;
  };
}

// 创建全局组件系统实例
window.componentSystem = new ComponentSystem();

// 清理ComponentLibrary模块，移除示例组件数据
const ComponentLibrary = (function (): ComponentLibraryAPI {
  // 公开API
  const api: ComponentLibraryAPI = {
    // 获取系统中注册的所有组件
    getComponents: function (): IComponent[] {
      return window.componentSystem ? window.componentSystem.components : [];
    },

    // 根据名称获取组件
    getComponentByName: function (name: string): IComponent | null {
      if (!window.componentSystem) return null;
      return window.componentSystem.components.find((item: IComponent) => item.name === name) || null;
    },

    // 初始化组件点击事件
    initComponentEvents: function (formElements: Record<string, HTMLElement>) {
      // const { siteUrl, siteName, iconPreview } = formElements; // 这些变量未使用，可以注释掉

      // 查找所有组件元素
      const componentItems = document.querySelectorAll<HTMLElement>('.component-item');
      let selectedComponent: string | null = null;

      // 添加点击事件
      componentItems.forEach((item: HTMLElement) => {
        item.addEventListener('click', function () { // 使用 function 保留 this 指向 item
          // 移除之前选中的组件的选中状态
          componentItems.forEach((comp: HTMLElement) =>
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
        getSelectedComponent: function (): string | null {
          return selectedComponent;
        },
        resetSelection: function (): void {
          selectedComponent = null;
          componentItems.forEach((comp: HTMLElement) =>
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
// 注意：在浏览器环境中，这种导出方式可能不适用或不需要
// if (typeof module !== 'undefined' && module.exports) {
//   module.exports = ComponentLibrary;
// }

// 文档加载完成后初始化组件 (移到最后)
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[CS DOM Listener] DOMContentLoaded event listener started.');
  try {
    // 类型断言：明确 componentSystem 是完整的 ComponentSystem 实例
    const componentSystem = window.componentSystem as ComponentSystem;

    console.log('[CS] Required components:', componentSystem.allRequiredComponents);

    // 只加载需要的组件（桌面或组件库中的）
    console.log('[CS] Starting component load...');
    await componentSystem.loadComponents(componentSystem.allRequiredComponents);
    console.log('[CS] Component load finished.');

    // 注册所有已加载的组件
    console.log('[CS] Starting component registration...');
    componentSystem.allRequiredComponents.forEach((componentName: string) => {
      const globalVarName = componentSystem.getGlobalVarName(componentName);
      console.log(`[CS] 尝试注册组件: ${componentName}, 全局变量名: ${globalVarName}`);
      
      // 使用 (window as any) 获取组件类
      const ComponentClass = (window as any)[globalVarName || ''] as ComponentClass | undefined;
      console.log(`[CS] 组件类是否存在: ${!!ComponentClass}`, ComponentClass);

      if (globalVarName && ComponentClass) {
        try {
          componentSystem.register(ComponentClass);
          console.log(`[CS] 成功注册组件: ${componentName}`);
        } catch (e) {
          console.error(`[CS] 注册组件 ${componentName} (${globalVarName}) 时出错:`, e);
        }
      } else {
        console.error(`[CS] Cannot find component class: ${globalVarName} for ${componentName}`);
        // 检查window对象中的所有属性，以便调试
        console.log('[CS] 可用的全局变量:', Object.keys(window).filter(key => typeof (window as any)[key] === 'function').join(', '));
      }
    });
    console.log('[CS] Component registration finished.');
    // 打印最终注册的组件实例列表
    console.log(
      '[CS] 最终注册的组件实例 (componentSystem.components):',
      componentSystem.components.map((c: IComponent) => c.name),
    );
    console.log('[CS] 最终的 libraryComponents:', componentSystem.libraryComponents);

    // 渲染桌面组件
    console.log('[CS] Calling renderDesktopComponents...');
    componentSystem.renderDesktopComponents();
    console.log('[CS] renderDesktopComponents finished.');
  } catch (error) {
    console.error('[CS DOM Listener] Error during component initialization:', error);
  }
  console.log('[CS DOM Listener] DOMContentLoaded event listener finished.');
});
