export {}; // 确保这是一个模块

/**
 * 组件桥接系统
 * 用于在React中打开组件弹窗
 */

// 扩展 Window 接口 (与 index.tsx 中的声明保持一致)
// 全局声明需要放在顶层模块作用域
declare global {
  interface Window {
    openComponent: (componentName: string) => boolean;
    ComponentLibrary?: any; // 如果需要 ComponentLibrary 的类型定义
    // 如果需要 Sortable 的类型定义，可以在这里添加或安装 @types/sortablejs
    Sortable?: any;
    // 如果需要 storage 的类型定义，可以在这里添加
    storage?: { saveDesktopData?: () => void };
    // 允许在 window 上挂载其他组件类
    [key: string]: any;
  }
}

// 定义一个基础的组件接口
interface IComponent {
  name: string;
  icon?: string;
  iconClass?: string;
  bgColor?: string;
  backgroundColor?: string;
  handleClick?: () => void;
  // 添加其他组件可能具有的属性或方法
  [key: string]: any; // 允许其他属性
}

// 定义组件构造函数类型
type ComponentConstructor = new () => IComponent;

// 组件桥接函数映射
const componentBridges: Record<string, () => boolean> = {};

// 创建通用组件加载/执行函数
function loadOrExecuteComponent(componentName: string): boolean {
  console.log(`[Bridge] 尝试加载或执行组件: ${componentName}`);

  // 检查全局变量中是否已经存在此组件
  // 使用 (window as any) 来避免 Linter 对索引签名的抱怨
  const ComponentClass = (window as any)[componentName] as ComponentConstructor | undefined;

  if (ComponentClass) {
    try {
      console.log(`[Bridge] 组件 ${componentName} 已存在，直接实例化并执行`);
      const component = new ComponentClass();
      console.log(`[Bridge] 组件实例:`, component);

      if (typeof component.handleClick === 'function') {
        console.log(`[Bridge] 调用组件 ${componentName} 的 handleClick 方法`);
        component.handleClick();
        return true; // 同步执行成功
      } else {
        console.error(`[Bridge] 组件 ${componentName} 没有 handleClick 方法`);
        return false; // 没有点击处理器视为失败
      }
    } catch (e) {
      console.error(`[Bridge] 实例化或执行组件 ${componentName} 失败:`, e);
      return false;
    }
  }

  // 如果组件类不存在，尝试动态加载脚本
  console.log(`[Bridge] 组件 ${componentName} 不存在，尝试加载脚本...`);
  // 构建组件路径
  const scriptUrl = `/components/${componentName}/index.js`; // 假设这是最终的路径
  console.log(`[Bridge] 尝试加载组件脚本: ${scriptUrl}`);

  // 检查该路径的脚本是否已经加载
  const existingScript = document.querySelector(`script[src="${scriptUrl}"]`);
  if (existingScript) {
    console.log(`[Bridge] 脚本 ${scriptUrl} 已经在文档中，但全局变量未定义，可能加载失败`);
  }

  const script = document.createElement('script');
  script.src = scriptUrl;
  script.async = true; // 异步加载

  script.onload = () => {
    console.log(`[Bridge] 组件 ${componentName} 脚本加载成功`);
    // 使用 (window as any) 来避免 Linter 对索引签名的抱怨
    const LoadedComponentClass = (window as any)[componentName] as ComponentConstructor | undefined;
    console.log(`[Bridge] 检查加载后的组件类: ${!!LoadedComponentClass}`);

    if (LoadedComponentClass) {
      try {
        const component = new LoadedComponentClass();
        console.log(`[Bridge] 成功创建组件实例:`, component);
        if (typeof component.handleClick === 'function') {
          console.log(`[Bridge] 动态加载后执行组件 ${componentName} 的 handleClick`);
          component.handleClick();
          // 注意：这里无法改变外部 openComponent 的返回值了
        } else {
          console.error(`[Bridge] 动态加载后，组件 ${componentName} 仍没有 handleClick 方法`);
        }
      } catch (e) {
        console.error(`[Bridge] 动态加载后，实例化或执行组件 ${componentName} 失败:`, e);
      }
    } else {
      console.error(`[Bridge] 动态加载后，仍然找不到组件类: ${componentName}`);
      console.log(`[Bridge] 当前window对象上的属性:`, Object.keys(window).filter(key => typeof (window as any)[key] === 'function').join(', '));
    }
  };

  script.onerror = (e) => {
    console.error(`[Bridge] 加载组件脚本失败: ${scriptUrl}`, e);
    // 注意：这里也无法改变外部 openComponent 的返回值了
  };

  document.head.appendChild(script);
  // 即使脚本加载失败或成功，都立即返回 true，表示已开始尝试加载
  return true;
}

// 对外暴露的调用接口，保持返回 boolean
window.openComponent = function (componentName: string): boolean {
  console.log(`请求打开组件: ${componentName}`);

  // 如果已经有定义的桥接函数，直接使用
  if (componentBridges[componentName]) {
    return componentBridges[componentName]();
  }

  // 否则尝试加载或执行
  return loadOrExecuteComponent(componentName);
};

console.log('组件桥接系统已初始化');
