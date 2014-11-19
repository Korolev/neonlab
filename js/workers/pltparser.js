/**
 * Created by mk-sfdev on 13/6/14.
 */

var console = {
    log: function (args) {
        postMessage({status: 'console', log: args});
    }
};

function each(arr, callback) {
    var len = arr.length,
        i = 0;
    while (i < len) {
        callback(i, arr[i]);
        i++;
    }
}

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
    var pathsArr = event.data.pathsArr;

    each(pathsArr,function(k,path){
        path = path.replace(/(\s*[ML]{1}\s*){1}/gi,'$');
        pathsArr[k] = path.substr(1).split('$');
        console.log(pathsArr[k]);
    })
};