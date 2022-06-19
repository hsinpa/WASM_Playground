import * as Comlink from 'comlink';
import init, {initThreadPool, do_multi_thead_task}  from 'wasm_rust';

async function initHandlers() {

    await init();
    await initThreadPool(navigator.hardwareConcurrency);
    do_multi_thead_task(5);
    console.log("Hello world");
}

Comlink.expose({
    handlers: initHandlers()
});