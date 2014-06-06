/**
 * Created by mk-sfdev on 6/6/14.
 */
onmessage = function (event) {
    var imageData = event.data.imagedata,
        newImageData = {},
        width = event.data.width,
        height = event.data.height,
        deepQuatro = event.data.deep / 5 | 0,
        deep = event.data.deep,
        quality = 5,
        diodeWidth = event.data.dW,
        diodeHeight = event.data.dH;

    // Количество пикселей, попадающих в радиус размывания
    var num_pixels = width * height;
    var resPoints = [],
        _resPoints = [],
        leftBorder = [];

    function getPixel(x, y) {
        if (x < 0) {
            x = 0;
        }
        if (y < 0) {
            y = 0;
        }
        if (x >= width) {
            x = width - 1;
        }
        if (y >= height) {
            y = height - 1;
        }
        var index = (y * width + x) * 4;
        return [
            imageData.data[index + 0],
            imageData.data[index + 1],
            imageData.data[index + 2],
            imageData.data[index + 3],
        ];
    }

    function setPixel(x, y, r, g, b, a) {
        var index = (y * width + x) * 4;
        imageData.data[index + 0] = r;
        imageData.data[index + 1] = g;
        imageData.data[index + 2] = b;
        imageData.data[index + 3] = a;
    }

    var lastprogress = 0,
        x,
        y,
        h = height - quality - diodeHeight,
        w = width - quality - diodeWidth;

    for (y = 0; y < h; y += quality) {
        for (x = 0; x < w; x += quality) {
            var progress = Math.round((((y * width) + height) / num_pixels) * 40);
            if (progress > lastprogress) {
                lastprogress = progress;
                postMessage({status: 'progress', progress: progress});
            }

            var pixelData = getPixel(x, y),
                leftPixel = getPixel(x - quality, y),
                bottomPixel;
            if (pixelData[0] > 0) {
                if (leftPixel[0] === 0 || (x == 0 && pixelData[0] > 0)) {
                    leftBorder.push({x: x, y: y})
                }
            }
        }
    }

    var arrLen = leftBorder.length;

    for (var i = 0; i < arrLen; i++) {
        var point = leftBorder[i];
        if (i % (arrLen / 10 | 0) == 0) {
            lastprogress++;
            postMessage({status: 'progress', progress: lastprogress});
        }
        if (point.y % deep < quality) {
            resPoints.push({
                x: point.x + deepQuatro,
                y: point.y
            })
        }
    }

    var setNextPoint = function (point) {
        var X = point.x + deep,
            pixel = getPixel(X, point.y),
            r = getPixel(X + diodeWidth + quality, point.y),
            c = getPixel(X + diodeWidth/2, point.y),
            b1 = getPixel(X + diodeWidth + quality, point.y + diodeHeight + quality),
            b2 = getPixel(X + quality, point.y + diodeHeight + quality);

        if (pixel[0] > 0
            && r[0] > 0
            && c[0] > 0
            && b1[0] > 0
            && b2[0] > 0
            && point.x < width - deepQuatro) {
            var p = {
                x: X,
                y: point.y
            };
            _resPoints.push(p);
            setNextPoint(p);
        }
    };

    arrLen = resPoints.length;
    for (i = 0; i < arrLen; i++) {
        if (i % (arrLen / 50 | 0) == 0) {
            lastprogress++;
            postMessage({status: 'progress', progress: lastprogress});
        }

//        var pt = resPoints[i],
//            bp = getPixel(point.x,point.y+diodeHeight+quality),
//            tp = getPixel(point.x, point.y-quality);

//        if(bp[0] === 0){
//            resPoints[i].y = pt.y - diodeHeight - quality;
//        }
//
//        if(pt[0] === 0){
//            resPoints[i].y = pt.y + deepQuatro;
//        }

        setNextPoint(resPoints[i]);
    }

    postMessage({status: 'complite', points: resPoints.concat(_resPoints)});
//    postMessage({status: 'complite', points: leftBorder});
};