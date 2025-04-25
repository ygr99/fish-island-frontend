/**
 * 组件桥接系统
 * 用于在React中打开组件弹窗
 */

// 组件桥接函数映射
const componentBridges = {};

// 创建通用组件加载函数
function loadComponent(componentName) {
  console.log(`准备加载组件: ${componentName}`);

  // 检查全局变量中是否已经存在此组件
  if (window[componentName]) {
    try {
      console.log(`组件${componentName}已存在，直接实例化`);
      const component = new window[componentName]();
      if (typeof component.handleClick === 'function') {
        component.handleClick();
      } else {
        console.error(`组件${componentName}没有handleClick方法`);
      }
      return true;
    } catch (e) {
      console.error(`实例化组件${componentName}失败:`, e);
      return false;
    }
  }

  // 尝试加载组件脚本
  return new Promise((resolve) => {
    // 构建组件路径，从 public 目录加载
    const scriptUrl = `/components/${componentName}/index.js`;
    console.log(`尝试加载组件脚本: ${scriptUrl}`);

    const script = document.createElement('script');
    script.src = scriptUrl;

    script.onload = function () {
      console.log(`组件${componentName}脚本加载成功`);
      if (window[componentName]) {
        try {
          const component = new window[componentName]();

          if (typeof component.handleClick === 'function') {
            component.handleClick();
            resolve(true);
          } else {
            console.error(`组件${componentName}没有handleClick方法`);
            resolve(false);
          }
        } catch (e) {
          console.error(`实例化组件${componentName}失败:`, e);
          resolve(false);
        }
      } else {
        console.error(`找不到组件类: ${componentName}`);
        resolve(false);
      }
    };

    script.onerror = function () {
      console.error(`加载组件脚本失败: ${scriptUrl}`);
      resolve(false);
    };

    document.head.appendChild(script);
  });
}

// 对外暴露的调用接口
window.openComponent = function (componentName) {
  console.log(`请求打开组件: ${componentName}`);

  // 如果已经有定义的桥接函数，直接使用
  if (componentBridges[componentName]) {
    return componentBridges[componentName]();
  }

  // 否则尝试加载组件
  return loadComponent(componentName);
};

console.log('组件桥接系统已初始化');
