$env:RUSTFLAGS='-C target-feature=+atomics,+bulk-memory,+mutable-globals'
rustup run nightly-2022-04-07
wasm-pack build --dev --out-dir ../web_assembly_playground/wasm --target web -- -Z build-std=panic_abort,std
