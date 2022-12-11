export const InputEventTitle = Object.freeze({
    up : "up",
    down : "down",
    left: "left",
    right : "right",
});

export const KeycodeLookupTable = Object.create({
    w : InputEventTitle.up,
    s : InputEventTitle.down,
    d : InputEventTitle.right,
    a : InputEventTitle.left,
    arrowup : InputEventTitle.up,
    arrowdown : InputEventTitle.down,
    arrowright : InputEventTitle.right,
    arrowleft : InputEventTitle.left
});
