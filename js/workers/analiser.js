/**
 * Created by mk-sfdev on 6/6/14.
 */

var console = {
    log: function (args) {
        postMessage({status: 'console', log: args});
    }
};

Array.prototype.getUnique = function () {
    var u = {}, a = [];
    for (var i = 0, l = this.length; i < l; ++i) {
        if (u.hasOwnProperty(this[i])) {
            continue;
        }
        a.push(this[i]);
        u[this[i]] = 1;
    }
    return a;
}

onmessage = function (event) {
    var imageData = event.data.imagedata,
        newImageData = {},
        width = event.data.width,
        height = event.data.height,
        deepQuatro = event.data.deep / 5 | 0,
        deep = event.data.deep - event.data.deep % 5, //TODO remove this bad code
        quality = 5,
        diodeWidth = event.data.dW,
        diodeHeight = event.data.dH;

    // Количество пикселей, попадающих в радиус размывания
    var num_pixels = width * height;
    var resPointsL = [],
        resPointsR = [],
        _resPoints = [],
        leftBorder = [],
        rightBorder = [];

    function each(arr, callback) {
        var len = arr.length,
            i = 0;
        while (i < len) {
            callback(i, arr[i]);
            i++;
        }
    }

    function getPixel(x, y) {
        x = x | 0;
        y = y | 0;
        if (x < 0 || y < 0 || x >= width || y >= height) {
            return [0, 0, 0, 0];
        }
        var index = (y * width + x) * 4;
        return [
            imageData.data[index + 0],
            imageData.data[index + 1],
            imageData.data[index + 2],
            imageData.data[index + 3]
        ];
    }

    function mergeArrays(arr) {
        var res = [];
        each(arr, function (k, el) {
            res = res.concat(el);
        });
        return res;
    }

    function checkPoint(point) {
        var pX = point.x,
            pY = point.y,
            pt = getPixel(pX, pY),
            c = getPixel(pX + diodeWidth / 2, pY + diodeHeight / 2);

        return pt[0] > 0 && c[0] > 0
            && checkLeftPoint(pX, pY)
            && checkRightPoint(pX, pY);
    }

    function checkLeftPoint(pX, pY) {
        var lX = pX - deepQuatro,
            tl = getPixel(lX, pY - deepQuatro),
            cl = getPixel(lX, pY + diodeHeight / 2),
            bl = getPixel(lX, pY + diodeHeight + deepQuatro);

        return tl[0] > 0 && cl[0] > 0 && bl[0] > 0;
    }

    function checkRightPoint(pX, pY) {
        var rX = pX + deepQuatro + diodeWidth,
            tr = getPixel(rX, pY - deepQuatro),
            cr = getPixel(rX, pY + diodeHeight / 2),
            br = getPixel(rX, pY + diodeHeight + deepQuatro);

        return tr[0] > 0 && cr[0] > 0 && br[0] > 0;
    }

    var lastprogress = 0,
        i = 0,
        x,
        y,
        h = height - quality - diodeHeight,
        w = width - quality - diodeWidth;

    for (y = 0; y < h; y += quality) {
        for (x = 0; x <= w; x += quality) {
            var progress = Math.round((((y * width) + height) / num_pixels) * 40);
            if (progress > lastprogress) {
                lastprogress = progress;
                postMessage({status: 'progress', progress: progress});
            }

            var pixelData = getPixel(x, y),
                leftPixel = getPixel(x - quality, y),
                rightPixel = getPixel(x + diodeWidth + quality, y);//TODO!!!
            if (pixelData[0] > 0) {
                if (leftPixel[0] === 0 || x == 0) {
                    leftBorder.push({x: x + deepQuatro, y: y});
                } else if (rightPixel[0] === 0) {
                    rightBorder.push({x: x - deepQuatro, y: y});
                } else if (x + quality > w) {
                    rightBorder.push({x: x - deepQuatro, y: y});
                }
            }
        }
    }

    var arrLen = leftBorder.length,
        point,
        top,
        bottom,
        res,
        lastPoint;

    for (i = 0; i < arrLen; i++) {
        point = leftBorder[i];
        top = getPixel(point.x, point.y - quality);
        bottom = getPixel(point.x, point.y + diodeHeight + quality);
        res = {
            x: point.x,
            y: point.y
        };

        if (i % (arrLen / 10 | 0) == 0) {
            lastprogress++;
            postMessage({status: 'progress', progress: lastprogress});
        }
        if (point.y % deep < 2) {
            if (top[0] == 0) {
                res.y += deepQuatro;
            } else if (bottom[0] == 0) {
                res.y -= deepQuatro;
            }
            resPointsL.push(res);
        }
    }

    arrLen = rightBorder.length;

    for (i = 0; i < arrLen; i++) {
        point = rightBorder[i];
        top = getPixel(point.x + diodeWidth, point.y - quality);
        bottom = getPixel(point.x + diodeWidth, point.y + diodeHeight + quality);
        res = {
            x: point.x,
            y: point.y
        };

        if (i % (arrLen / 10 | 0) == 0) {
            lastprogress++;
            postMessage({status: 'progress', progress: lastprogress});
        }
        if (point.y % deep == 0) {
//TODO optimize this duplicated code
            if (lastPoint && lastPoint.y == point.y) {
                if (point.x - lastPoint.x > deep) {
                    lastPoint = point;
                    if (top[0] == 0) {
                        res.y += deepQuatro;
                    } else if (bottom[0] == 0) {
                        res.y -= deepQuatro;
                    }
                    resPointsR.push(res);
                }
            } else {
                lastPoint = point;
                if (top[0] == 0) {
                    res.y += deepQuatro;
                } else if (bottom[0] == 0) {
                    res.y -= deepQuatro;
                }
                resPointsR.push(res);
            }
        }
    }


    var setPreviousPoint = function (point, parent) {
        var X = point.x - deep,
            pixel = getPixel(X, point.y),
            l = getPixel(X + quality, point.y),
            ct = getPixel(X + diodeWidth / 2, point.y),
            c = getPixel(X + diodeWidth / 2, point.y + diodeHeight / 2),
            cb = getPixel(X + diodeWidth / 2, point.y + diodeHeight),
            b1 = getPixel(X + quality, point.y + diodeHeight + quality);

        if (pixel[0] > 0
            && l[0] > 0
            && ct[0] > 0
            && c[0] > 0
            && cb[0] > 0
            && b1[0] > 0
            && point.x < width - deepQuatro) {

            var p = {
                x: X,
                y: point.y,
                parent: parent,
                type: 'prev'
            };

            _resPoints.push(p);
            setPreviousPoint(p, parent);
        }
    };

    var setNextPoint = function (point, parent) {
        var X = point.x + deep,
            pixel = getPixel(X, point.y),
            r = getPixel(X + diodeWidth + quality, point.y),
            c = getPixel(X + diodeWidth / 2, point.y + diodeHeight / 2),
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
                y: point.y,
                parent: parent,
                type: 'next'
            };
            _resPoints.push(p);
            setNextPoint(p, parent);
        }
    };

    arrLen = resPointsL.length;
    for (i = 0; i < arrLen; i++) {
        if (i % (arrLen / 15 | 0) == 0) {
            lastprogress++;
            postMessage({status: 'progress', progress: lastprogress});
        }

        setNextPoint(resPointsL[i], {x: resPointsL[i].x, y: resPointsL[i].y, left: 1, right: 0});
    }

    arrLen = resPointsR.length;
    for (i = 0; i < arrLen; i++) {
        if (i % (arrLen / 15 | 0) == 0) {
            lastprogress++;
            postMessage({status: 'progress', progress: lastprogress});
        }
        setPreviousPoint(resPointsR[i], {x: resPointsR[i].x, y: resPointsR[i].y, left: 0, right: 1});
    }

    _resPoints = _resPoints.concat(resPointsR);
    _resPoints = _resPoints.concat(resPointsL);

    var yHash = {};

    arrLen = _resPoints.length;
    for (i = 0; i < arrLen; i++) {
        yHash[_resPoints[i].y] = yHash[_resPoints[i].y] || [];
        yHash[_resPoints[i].y].push(_resPoints[i]);
    }

    for (var key in yHash) {
        if (yHash.hasOwnProperty(key)) {
            yHash[key].sort(function (a, b) {
                return a.x < b.x ? -1 : 1;
            });

            yHash[key][0].use = true;
            var usedX = yHash[key][0].x;

            each(yHash[key], function (i, pt) {
                if (pt.x - usedX >= deep) {
                    pt.use = true;
                    usedX = pt.x
                }
            });

        }
    }

    _resPoints = _resPoints.filter(function (el) {
        return el.use;
    });


    _resPoints.sort(function (a, b) {
        return a.x < b.x ? -1 : 1;
    });

    var pairs = [],
        abs = Math.abs,
        diff = deep / 1.9;
    each(_resPoints, function (k, point) {
        each(_resPoints, function (_k, _point) {
            if (abs(point.x - _point.x) < diff && abs(point.y - _point.y) < diff && point !== _point) {
                point.x = (point.x + _point.x) / 2;
                point.y = (point.y + _point.y) / 2;
                _point.use = false;
                point.use = true;
                pairs.push([point, _point]);
            }
        });
    });

    _resPoints = _resPoints.filter(function (el) {
        return el.use;
    });
    postMessage({status: 'complite', points: _resPoints});
//    postMessage({status: 'complite', points: leftBorder});
};