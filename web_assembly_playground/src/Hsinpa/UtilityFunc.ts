export const Clamp = function(taget: number, max : number, min : number) {
    return Math.min(Math.max(taget, min), max);
}

export function RandomRange(min : number, max : number) {
    return ~~(Math.random() * (max - min + 1)) + min
};


export function NormalizeToBase(value: number, min : number, max : number) {
    return (value - min) / (max - min);
};

export function GetImagePromise(imagePath : string) {
    return new Promise<HTMLImageElement>( resolve => {
        const im = new Image();
        im.crossOrigin = "anonymous";
        im.src = imagePath;
        im.onload = () => resolve(Object.assign(im));

        return im;
    });
}