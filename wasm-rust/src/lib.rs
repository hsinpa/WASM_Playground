mod utils;
use wasm_bindgen::prelude::*;
pub use wasm_bindgen_rayon::init_thread_pool;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
pub fn do_multi_thead_task(num: i32) {
    // let js_string = JsValue::from_str("Hello using web-sys");
    // web_sys::console::log_1(&(js_string.into()));

    rayon::spawn(move || {
        let js_string = JsValue::from_str("Hello using web-sys");
        web_sys::console::log_1(&(js_string.into()));
    });
}