import './style.css'

//@ts-ignore
import init, {do_multi_thead_task} from 'wasm-rust';

const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <h1>Hello Vite!</h1>
  <a href="https://vitejs.dev/guide/features.html" target="_blank">Documentation</a>
`

init().then(() => {
  console.log('init wasm-pack');
  do_multi_thead_task(212);
  //exports.do_multi_thead_task(3);
});
