function rndColor() {
    var hex = '0123456789ABCDEF'.split(''),
        color = '#', i;
    for (i = 0; i < 6 ; i++) {
        color = color + hex[Math.floor(Math.random() * 16)];
    }
    return color;
}