import './style.css'
import * as Comlink from 'comlink';

// @ts-ignore
import init, {initThreadPool} from "wasm_rust";
 
const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <h1>Hello Vite!</h1>
  <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>`;

  (async function init() {
    // Create a separate thread from wasm-worker.js and get a proxy to its handlers.
    let handlers = await Comlink.wrap(
      new Worker(new URL("./custom_wasm_actions.ts", import.meta.url), {
        type: 'module'
      })
    );

  })();