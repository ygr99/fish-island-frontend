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
  handleClick?: () => void;
  // 添加其他可能需要的属性
  [key: string]: any;
}

// 定义组件构造函数类型
type ComponentClass = new () => IComponent;

// 组件系统类
class ComponentSystem {
  components: IComponent[];
  containerSelector: string;
  componentOrder: string[];
  allComponentNames: string[];
  desktopComponents: string[];
  libraryComponents: string[];
  allRequiredComponents: string[];
  useCustomOrder?: boolean;
  componentOrders?: Record<string, number>;
  loadedComponents: Set<string>;

  constructor() {
    this.components = [];
    this.loadedComponents = new Set<string>();
    this.containerSelector = '.shortcutsSection';
    this.componentOrder = this.loadComponentOrder() || [];
    this.allComponentNames = []; // 初始化为空数组，将在discoverComponents中被填充

    // 桌面上显示的组件列表
    this.desktopComponents = this.loadDesktopComponents() || [
      '随机小姐姐',
      // 其他默认组件...
    ];

    // 组件库中显示的组件列表
    this.libraryComponents = this.loadLibraryComponents() || [
      '随机小姐姐'
    ];

    // 所有需要加载的组件（并集）
    this.allRequiredComponents = [
      ...new Set([...this.desktopComponents, ...this.libraryComponents]),
    ];
    
    // 自动发现所有可用组件名称
    this.discoverComponents();
    
    // 注册系统组件打开方法
    window.openComponent = this.openComponent.bind(this);
    
    console.log('组件系统构造函数执行完毕');
  }
  
  /**
   * 自动发现组件目录下的所有组件
   */
  async discoverComponents() {
    try {
      console.log('开始发现组件...');
      
      // 先尝试加载已知组件
      this.allComponentNames = [...this.allRequiredComponents];
      
      // 开始加载组件
      console.log(`将加载这些组件: ${this.allComponentNames.join(', ')}`);
      await this.loadComponents(this.allComponentNames);
      
      // 如果没有组件被加载成功，尝试直接加载默认组件
      if (this.components.length === 0) {
        console.log('没有组件被加载，尝试直接加载随机小姐姐组件');
        // 手动加载并注册随机小姐姐组件
        try {
          await this.loadComponent('RandomGirl');
        } catch (error) {
          console.error('加载随机小姐姐组件失败:', error);
        }
      }
      
      console.log(`组件发现完成，已加载组件数量: ${this.components.length}`);
    } catch (error) {
      console.error('组件发现过程出错:', error);
    }
  }

  /**
   * 注册新组件
   * @param {Object} ComponentClass - 组件类
   */
  register(ComponentClass: ComponentClass): void {
    try {
      const component = new ComponentClass();

      // 确保组件有必要的属性
      if (!component.icon && !component.iconClass) {
        component.icon = 'fa-puzzle-piece'; // 默认图标
      } else if (!component.icon && component.iconClass) {
        // 如果只有iconClass，则将其复制到icon
        component.icon = component.iconClass;
      }

      if (!component.bgColor && !component.backgroundColor) {
        component.bgColor = 'bg-blue-500'; // 默认背景色
      } else if (!component.bgColor && component.backgroundColor) {
        // 如果只有backgroundColor，则将其复制到bgColor
        component.bgColor = component.backgroundColor;
      }

      if (!component.description) {
        component.description = `${component.name}组件`; // 默认描述
      }

      this.components.push(component);
      console.log(`[CS] 成功注册组件: ${component.name}`);
    } catch (error) {
      console.error(`[CS] 注册组件失败:`, error);
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
      // 使用默认排序（按保存的顺序排序组件）
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

    // 将每个组件渲染到容器中
    const componentContainers: HTMLElement[] = [];
    if (orderedComponents.length > 0) {
      container.innerHTML = ''; // 清空容器
    orderedComponents.forEach((component: IComponent) => {
        try {
          const componentHtml = component.render();
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = componentHtml.trim();
          const componentElement = tempDiv.firstChild as HTMLElement;
          
      if (componentElement) {
            componentContainers.push(componentElement);
            container.appendChild(componentElement);
          }
        } catch (error) {
          console.error(`渲染组件 ${component.name} 失败:`, error);
      }
    });

    // 初始化组件事件
    orderedComponents.forEach((component: IComponent) => {
      if (typeof component.init === 'function') {
          try {
        component.init();
          } catch (error) {
            console.error(`初始化组件 ${component.name} 失败:`, error);
          }
      }
    });

      // 初始化排序功能
    this.initSortable(container);
    } else {
      console.log('没有组件需要渲染');
    }
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
   * 保存组件库列表到本地存储
   */
  saveLibraryComponents(): void {
    try {
      localStorage.setItem('library-components', JSON.stringify(this.libraryComponents));
    } catch (e) {
      console.error('保存组件库列表失败:', e);
    }
  }

  /**
   * 从本地存储加载组件库列表
   */
  loadLibraryComponents(): string[] | null {
    try {
      const saved = localStorage.getItem('library-components');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('加载组件库列表失败:', e);
      return null;
    }
  }

  /**
   * 渲染所有组件并初始化
   */
  renderAll(): void {
    // 等待组件加载完成后再渲染
    if (this.components.length > 0) {
      this.renderDesktopComponents();
    } else {
      console.log('暂无组件，等待组件加载...');

      // 等待组件加载完成后再次尝试渲染
      setTimeout(() => {
        console.log(`再次尝试渲染，当前已加载组件数: ${this.components.length}`);
        this.renderDesktopComponents();
      }, 500);
    }
  }

  /**
   * 初始化排序功能
   * @param {HTMLElement} container - 组件容器元素
   */
  initSortable(container: HTMLElement): Sortable | null {
    // 检查 Sortable 是否可用
    if (typeof Sortable === 'undefined') {
      console.error('Sortable库未加载，无法初始化拖拽排序');
      return null;
    }

    try {
      // 如果容器中没有子元素，不初始化 Sortable
      if (container.children.length === 0) {
        console.warn('容器中没有元素，跳过Sortable初始化');
        return null;
      }

      // 创建并初始化Sortable实例
      const sortable = new Sortable(container, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortableChosen',
        dragClass: 'sortableDrag',
        forceFallback: false, // 在移动设备上使用原生拖拽
        onEnd: (evt) => {
          this.updateComponentOrder();
        },
      });

      console.log('Sortable初始化成功');
      return sortable;
    } catch (error) {
      console.error('初始化Sortable失败:', error);
      return null;
    }
  }

  /**
   * 保存组件顺序到localStorage
   */
  saveComponentOrders(): void {
    try {
      localStorage.setItem('component-orders', JSON.stringify(this.componentOrders));
      console.log('保存组件顺序成功');
    } catch (e) {
      console.error('保存组件顺序失败:', e);
    }
  }

  /**
   * 更新组件顺序
   */
  updateComponentOrder(): void {
    const container = document.querySelector<HTMLElement>(this.containerSelector);
    if (!container) return;

    // 获取新的组件顺序
    const newOrder: string[] = [];
    const newComponentOrders: Record<string, number> = {};

    // 遍历容器中的每个组件元素
    Array.from(container.children).forEach((child, index) => {
      // 尝试获取组件名称
      const nameElement = child.querySelector('.text-sm');
      if (nameElement && nameElement.textContent) {
        const componentName = nameElement.textContent.trim();
        newOrder.push(componentName);
        newComponentOrders[componentName] = index;
      }
    });

    if (newOrder.length > 0) {
      // 更新组件顺序
      this.componentOrder = newOrder;
      this.componentOrders = newComponentOrders;
      this.useCustomOrder = true;

      // 保存新顺序
      this.saveComponentOrder();
      this.saveComponentOrders();

      console.log('更新组件顺序成功:', newOrder);
    }
  }

  /**
   * 保存组件顺序到localStorage
   */
  saveComponentOrder(): void {
    try {
      localStorage.setItem('component-order', JSON.stringify(this.componentOrder));
      console.log('保存组件顺序列表成功');
    } catch (e) {
      console.error('保存组件顺序列表失败:', e);
    }
  }

  /**
   * 加载组件顺序从localStorage
   */
  loadComponentOrder(): string[] | null {
    try {
      const saved = localStorage.getItem('component-order');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('加载组件顺序失败:', e);
      return null;
    }
  }

  /**
   * 加载组件
   * @param {Array} componentNames - 要加载的组件名称数组
   */
  async loadComponents(componentNames: string[]): Promise<void[]> {
    // 过滤出尚未加载的组件
    const componentsToLoad = componentNames.filter(name => !this.loadedComponents.has(name));
    
    if (componentsToLoad.length === 0) {
      console.log('所有组件已加载');
      return Promise.resolve([]);
    }

    console.log(`开始加载组件: ${componentsToLoad.join(', ')}`);
    
    // 创建加载每个组件的Promise数组
    const loadPromises = componentsToLoad.map(componentName => this.loadComponent(componentName));
    
    return Promise.all(loadPromises);
  }
  
  /**
   * 加载单个组件
   * @param {String} componentName - 组件名称
   */
  loadComponent(componentName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // 如果组件已经加载，直接返回
      if (this.loadedComponents.has(componentName)) {
        resolve();
        return;
      }
      
      // 构建脚本路径
      const scriptUrl = `/components/${componentName}/index.js`;
      
      // 检查该文件是否可访问
      fetch(scriptUrl, { 
        method: 'GET',
        headers: { 'Accept': 'application/javascript' }
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`组件文件不可访问: ${response.status}`);
          }
          
          return response.text().then(content => {
            // 检查是否是合法的JavaScript
            if (content.trim().startsWith('<!DOCTYPE html>') || content.trim().startsWith('<html')) {
              console.error(`组件 ${componentName} 文件内容是HTML而非JavaScript`);
              throw new Error('组件文件格式错误: 收到HTML而非JavaScript');
            }
            
            // 文件内容正确，创建脚本元素
            const script = document.createElement('script');
            script.type = 'application/javascript';
            script.text = content;
            
            // 设置加载回调
            script.onload = () => {
              console.log(`组件 ${componentName} 脚本执行成功`);
              this.loadedComponents.add(componentName);

              // 尝试自动注册组件
              setTimeout(() => {
                const ComponentClass = (window as any)[componentName];
            if (ComponentClass) {
                  try {
                    this.register(ComponentClass);
                    console.log(`组件 ${componentName} 加载后自动注册成功`);
                  } catch (error) {
                    console.error(`组件 ${componentName} 自动注册失败:`, error);
                  }
            } else {
                  console.warn(`组件 ${componentName} 加载成功但未找到全局类`);
                }
              }, 100);
              
              resolve();
            };
            
            script.onerror = (error) => {
              console.error(`组件 ${componentName} 脚本执行失败:`, error);
              reject(new Error(`脚本执行失败: ${componentName}`));
            };
            
            // 添加脚本到文档
            document.head.appendChild(script);
          });
        })
        .catch(error => {
          console.error(`请求组件 ${componentName} 失败:`, error);
          
          // 尝试备用加载方式
          console.log(`尝试使用备用方式加载组件 ${componentName}`);
          const backupScript = document.createElement('script');
          backupScript.src = scriptUrl;
          backupScript.async = true;
          
          backupScript.onload = () => {
            console.log(`备用方式: 组件 ${componentName} 脚本加载成功`);
            this.loadedComponents.add(componentName);
            resolve();
          }; 
          
          backupScript.onerror = (backupError) => {
            console.error(`备用方式: 组件 ${componentName} 加载失败:`, backupError);
            reject(new Error(`无法加载组件: ${componentName}`));
          };
          
          document.head.appendChild(backupScript);
        });
    });
  }
  
  /**
   * 打开组件
   * @param {String} componentName - 组件名称
   * @returns {Boolean} 是否成功打开组件
   */
  openComponent(componentName: string): boolean {
    console.log(`[组件系统] 请求打开组件: ${componentName}`);
    
    // 如果组件已经注册到组件系统
    const registeredComponent = this.components.find(comp => comp.name === componentName);
    if (registeredComponent) {
      try {
        console.log(`[组件系统] 从已注册组件中找到组件 ${componentName}`);
        if (typeof registeredComponent.handleClick === 'function') {
          registeredComponent.handleClick();
          return true;
        } else {
          console.error(`[组件系统] 已注册组件 ${componentName} 没有 handleClick 方法`);
          return false;
        }
      } catch (error) {
        console.error(`[组件系统] 执行已注册组件 ${componentName} 失败:`, error);
        return false;
      }
    }
    
    // 查找已加载的组件类
    const ComponentClass = (window as any)[componentName] as ComponentClass | undefined;
    
    if (ComponentClass) {
      try {
        console.log(`[组件系统] 组件 ${componentName} 已存在，直接实例化并执行`);
        const component = new ComponentClass();
        
        // 注册组件以便下次使用
        this.register(ComponentClass);
        
        if (typeof component.handleClick === 'function') {
          component.handleClick();
          return true;
        } else {
          console.error(`[组件系统] 组件 ${componentName} 没有 handleClick 方法`);
          return false;
        }
      } catch (error) {
        console.error(`[组件系统] 实例化或执行组件 ${componentName} 失败:`, error);
        return false;
      }
    }
    
    // 如果组件未加载，尝试加载
    console.log(`[组件系统] 组件 ${componentName} 未加载，尝试加载`);
    this.loadComponent(componentName)
      .then(() => {
        // 加载成功后再次尝试打开
        const LoadedComponentClass = (window as any)[componentName] as ComponentClass | undefined;
        
        if (LoadedComponentClass) {
          try {
            // 尝试注册组件
            this.register(LoadedComponentClass);
            
            const component = new LoadedComponentClass();
            if (typeof component.handleClick === 'function') {
              component.handleClick();
            } else {
              console.error(`[组件系统] 加载后组件 ${componentName} 没有 handleClick 方法`);
            }
          } catch (error) {
            console.error(`[组件系统] 加载后实例化或执行组件 ${componentName} 失败:`, error);
          }
        } else {
          console.error(`[组件系统] 加载后找不到组件类: ${componentName}`);
        }
      })
      .catch(error => {
        console.error(`[组件系统] 加载组件 ${componentName} 失败:`, error);
      });
    
    // 返回true表示已开始尝试加载组件
    return true;
  }
}

// 创建组件库API
interface ComponentLibraryAPI {
  getComponents: () => IComponent[];
  getComponentByName: (name: string) => IComponent | null;
  initComponentEvents: (formElements: Record<string, HTMLElement>) => {
    getSelectedComponent: () => string | null;
    resetSelection: () => void;
  };
}

// 在window上初始化组件系统实例
if (typeof window !== 'undefined') {
  // DOM加载完成后初始化组件系统
  const initComponentSystem = () => {
    if (!window.componentSystem) {
window.componentSystem = new ComponentSystem();
      console.log('组件系统已初始化');
    } else {
      console.log('组件系统已存在，跳过初始化');
    }
    
    // 创建并导出组件库API
    window.ComponentLibrary = {
      getComponents: () => window.componentSystem.getLibraryComponents(),
      getComponentByName: (name: string) => {
        const comp = window.componentSystem.components.find(c => c.name === name);
        return comp || null;
      },
      initComponentEvents: (formElements: Record<string, HTMLElement>) => {
      let selectedComponent: string | null = null;

        const getSelectedComponent = () => selectedComponent;
        const resetSelection = () => { selectedComponent = null; };
        
        return {
          getSelectedComponent,
          resetSelection
        };
      }
    } as ComponentLibraryAPI;
    
    // 添加存储相关方法
    window.storage = {
      ...window.storage,
      saveDesktopData: () => {
        window.componentSystem.saveDesktopComponents();
        window.componentSystem.saveComponentOrder();
      }
    };
  };
  
  // 如果DOM已加载完成，直接初始化
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('DOM已加载，直接初始化组件系统');
    initComponentSystem();
  } else {
    // 否则等待DOM加载完成
    console.log('等待DOM加载完成后初始化组件系统');
    document.addEventListener('DOMContentLoaded', initComponentSystem);
  }
}

// 扩展 Window 接口
declare global {
  interface Window {
    componentSystem: ComponentSystem;
    ComponentLibrary: ComponentLibraryAPI;
    openComponent: (componentName: string) => boolean;
    Sortable?: any;
    storage?: { saveDesktopData?: () => void; [key: string]: any };
    [key: string]: any;
  }
}

// 初始化系统并导出
export { ComponentSystem };
