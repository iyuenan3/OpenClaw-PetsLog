import { createSSRApp } from "vue";
import App from "./App.vue";

export function createApp() {
  const app = createSSRApp(App);
  // uview-plus 在 H5 端通过 easycom 自动导入，不需要手动 use
  return {
    app,
  };
}
