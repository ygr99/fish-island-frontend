import '@umijs/max';
import defaultSettings from '../config/defaultSettings';
const clearCache = () => {
  // remove all caches
  if (window.caches) {
    caches
      .keys()
      .then((keys) => {
        keys.forEach((key) => {
          caches.delete(key);
        });
      })
      .catch((e) => console.log(e));
  }
};

// 卸载 Service Worker 并重新加载页面
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistration().then(reg => {
    if (reg) {
      reg.unregister().then(() => {
        clearCache();
        location.reload(); // 重新加载页面，不受 SW 缓存影响
      });
    }
  });
}
