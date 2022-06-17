mod utils;

use std::thread;
use std::time::Duration;
use wasm_bindgen::prelude::*;
extern crate web_sys;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern {
    fn alert(s: &str);
}

macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, wasm-rust!");
}

#[wasm_bindgen]
pub fn do_multi_thead_task(num: i32) {

    // let js_string = JsValue::from_str("Hello using web-sys");

    // let handler = thread::spawn( move || {
        for i in 0..num {
            let message = format!("hi number {} from the spawned thread", i);
            web_sys::console::log_1(&(message.into()));
            // thread::sleep(Duration::from_millis(1));
        }
    // });
    // //
    // handler.join().unwrap();
    // Ok(())
}
