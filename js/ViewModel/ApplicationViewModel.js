/**
 * Created by mk-sfdev on 4/17/14.
 */

//147.svg - KARO

var luminousConf = {
    25: {
        60: 3800,
        80: 2100,
        100: 2100
    },
    50: {
        60: 7000,
        80: 4500,
        100: 2900,
        120: 2000,
        140: 1400,
        160: 1250
    },
    80: {
        60: 11000,
        80: 7700,
        100: 4900,
        120: 3300,
        140: 2750,
        160: 2200,
        180: 1300,
        200: 1100,
        220: 900
    },
    120: {
        60: 30000,
        80: 16000,
        100: 10500,
        120: 6900,
        140: 4350,
        160: 3600,
        180: 2850,
        200: 2450,
        220: 2000
    }
};

/*
 - цена общая выравнивание по правому краю, а Итого по левому
 - Имя файла в большом окне
 - Номер расчета
 - Кнопка Отмена в развернутом варианте ТЗ2 стр 20
 - Разобраться с несколькими видами блоков в большом окне
 - Поддержка нескольких видов диодов
 - Массовое выделение
 - Отправка писем
 */

var ApplicationViewModel = function () {
    this.isDev = location.href.indexOf('localhost') > -1;
    this.isSafari = navigator.vendor.indexOf('Apple') > -1;
    /* ====================== */

    var self = this;

    var defDiod = {h1: '60-100', name: '-', size: '0', luminous: '0', power: '0', distance: '0', price: '00', itemsCount: 0},
        defPowerSupply = {name: '-', characteristic: '-', power: '0', amperage: '0', cost: '0', itemsCount: 0};

    /* =============== */
    this.Dialog = new DialogViewModel(self);
    this.User = new UserViewModel(self);
    this.File = new FileViewModel(self);
    this.WorkArea = new WorkAreaViewModel(self);

    var dialog = self.Dialog;

    /* =============== */

    this.greedDeep = ko.observable();
    this.maxDeep = ko.observable();
    this.totalDeep = ko.observable();

    /* =============== */
//TODO get Data from server
    this.diodInfo = [
        {h1: '60-100', name: 'X-Led Samsung 25', size: '20x9', luminous: '25', power: '0.6', distance: '100', price: '20'},
        {h1: '80-150', name: 'X-Led Samsung 50', size: '25x25', luminous: '50', power: '0.72', distance: '165', price: '32'},
        {h1: '130-200', name: 'X-Led Samsung 80', size: '25x25', luminous: '80', power: '0.72', distance: '215', price: '53'},
        {h1: '180-250', name: 'X-Led Samsung 120', size: '25x25', luminous: '120', power: '0.72', distance: '215', price: '60'}
    ];
    this.powerSuplyInfo = [
        {name: 'Mean Well LPV-20-12', characteristic: '20 Вт, 12 В, IP 67', power: '20', amperage: '0.11', price: '450'},
        {name: 'Mean Well LPV-35-12', characteristic: ' 35 Вт, 12 В, IP 67', power: '35', amperage: '0.19', price: '620'},
        {name: 'Mean Well LPV-60-12', characteristic: ' 60 Вт, 12 В, IP 67', power: '60', amperage: '0.33', price: '740'},
        {name: 'Mean Well LPV-100-12', characteristic: ' 100 Вт, 12 В, IP 67', power: '100', amperage: '0.54', price: '1200'},
        {name: 'Mean Well LPV-150-12', characteristic: ' 150 Вт, 12 В, IP 65', power: '150', amperage: '0.78', price: '2450'}
    ];
    /* =============== */

    self.File.loadDiode(function (r) {
        if (r) {
            self.diodInfo = r
        }
    });

    self.File.loadPower(function (r) {
        if (r) {
            self.powerSuplyInfo = r
        }
    });
//**** PARTIAL DIODES CHANGE
    this.additionalDeep = ko.observable();
    this.additionalDiode = ko.observable();
    this.settingsPosition = ko.observable('left:20px;top:10px');

    var diodeSearch = function (deep) {
        var res = [];
        each(self.diodInfo, function (k, d) {
            var h = d.h1.split('-'), hFrom = h[0], hTo = h[1];

            if (deep >= hFrom && deep <= hTo) {
                res.push(d);
            }
        });
        return res;
    };

    this.diodInfoFiltered = ko.computed(function () {
        return diodeSearch(self.additionalDeep());
    }, this).extend({throttle: 50});

    this.diodInfoFilteredMain = ko.computed(function () {
        return diodeSearch(self.greedDeep());
    }, this).extend({throttle: 50});

//    this.additionalDiode.subscribe(function (val) {
    this.calculatePartial = function () {
        setTimeout(function () {
            var val = self.additionalDiode();
            var findInArr = false;
            each(self.diodInfoFiltered(), function (k, v) {
                if (val == v) {
                    findInArr = true;
                }
            });
            if (!findInArr) {
                self.additionalDiode(self.diodInfoFiltered()[0]);
                val = self.additionalDiode();
            }

            if (val && self.WorkArea.showOptionsDialog()) {
                var workArea = self.WorkArea,
                    waCanvas = workArea.SvgImage.canvas.select('svg'),
                    viewBox = waCanvas.attr('viewBox'),
                    selectedDiodesList = workArea.selectedDiodes(),
                    selectBoxCords = workArea.SvgImage.selectBoxCoords,
                    x1 = (selectBoxCords.x1 - viewBox.x) / 100 | 0,
                    y1 = (selectBoxCords.y1 - viewBox.y) / 100 | 0,
                    x2 = (selectBoxCords.x2 - viewBox.x) / 100 | 0,
                    y2 = (selectBoxCords.y2 - viewBox.y) / 100 | 0;

//            console.log(x1,y1,x2,y2);

                workArea.selectedDiodes([]);


                workArea.calculateDiodesByCoordinates(self, x1, y1, x2, y2, val, self.additionalDeep(), function (points) {
//                self.usedDiodTypes.push(val);//TODO ???
                    for (var j = 0; j < selectedDiodesList.length; j++) {
                        setTimeout(function (i) {
                            selectedDiodesList[i].remove();
                            if (i == selectedDiodesList.length - 1) {
                                selectedDiodesList = [];
                                workArea.diodesArr.valueHasMutated();
                            }
                        }, j * 10, j);
                    }

                    if (!workArea.SvgImage.diodGroup) {
                        workArea.SvgImage.diodGroup = waCanvas.g();
                    }

                    for (var i = 0; i < points.length; i++) {
                        setTimeout(function (i) {
                            var p = points[i].draw(waCanvas);
                            workArea.SvgImage.diodGroup.add(p);
                            if (i == points.length - 1) {
                                workArea.isReady(true);
                                workArea.diodesArr.pushAll(points);
                                workArea.showOptionsDialog(false);
                            }
                        }, i * 10, i);
                    }
                });
            }
        }, 100);

    };
//    );

    this.additionalDeep.subscribe(function (val) {
        var minHVal, maxHVal;

        each(self.diodInfo, function (k, d) {
            var h = d.h1.split('-'), hFrom = h[0], hTo = h[1];
            minHVal = minHVal || hFrom;
            maxHVal = maxHVal || hTo;

            minHVal = Math.min(minHVal, hFrom);
            maxHVal = Math.max(maxHVal, hTo);

        });

        var v = parseInt(val, 10),
            error = false;
        if (isNaN(v) || v < minHVal) {
            v = minHVal;
            error = true;
        } else if (v > maxHVal) {
            v = maxHVal;
            error = true;
        }
        if (error) {
            setTimeout(function () {
                dialog.hideModalWindow();
            }, 4000);
            dialog.showModalWindow({
                message: 'Введенная глубина конструкции<br> не попадает в диапазон от ' +
                    minHVal +
                    ' мм<br> до ' + maxHVal +
                    ' мм. Попробуйте еще раз!'
            });
        }
        self.additionalDeep(v);
    });
//**** PARTIAL DIODES CHANGE

    this.useBetter = false;
    this.usedDiodTypes = ko.observableArray([defDiod]);
    this.usedDiodType = ko.observable(defDiod);
    this.usedPowerSupplyTypes = ko.observableArray([defPowerSupply]);
    this.usedItemsList = ko.computed(function () {
        var d = self.usedDiodTypes(),
            p = self.usedPowerSupplyTypes(),
            res = [];

        each(d, function (k, d) {
            if (d.name != '-')
                res.push({
                    desc: "Светодиодный модуль",
                    name: d.name,
                    data: '(' + d.luminous + ' Лм, ' + d.size + ' мм, ' + d.distance + ' мм)',
                    count: d.itemsCount,
                    price: parseFloat(d.price).toFixed(2),
                    total: (parseFloat(d.price) * d.itemsCount).toFixed(2)
                })
        });

        each(p, function (k, d) {
            if (d.name != '-')
                res.push({
                    desc: "Блок питания",
                    name: d.name,
                    data: '(' + d.characteristic + ')',
                    count: d.itemsCount,
                    price: parseFloat(d.price).toFixed(2),
                    total: (parseFloat(d.price) * d.itemsCount).toFixed(2)
                })
        });

        return res;
    }, this).extend({throttle: 1});

    /* ========LUMINOUS======= */


    this.luminousMin = ko.observable(0);
    this.luminousMax = ko.computed(function () {
        var res = 0, resMin = 0;
        each(self.usedDiodTypes(), function (k, d) {
            if(!resMin){
                resMin = d.luminous;
            }
            resMin = Math.min(resMin, d.luminous);
            res = Math.max(res, d.luminous);
        });
        self.luminousMin(resMin);
        return res;
    }, this).extend({throttle: 100});

    this.luminousAverage = ko.computed(function(){
        console.log(self.usedDiodTypes().length > 1);
        return self.usedDiodTypes().length > 1;
    },this).extend({throttle:5});

    this.luminousValue = ko.computed(function(){
        console.log('TADA');
        var res = self.luminousMax();
        if(self.luminousAverage()){
            res = (self.luminousMax() + self.luminousMin()) /2;
        }
        return res;
    },this).extend({throttle:5});

    /* ========LUMINOUS======= */
    /* =============== */
    this.pointsCount = ko.observable(0);
    this.diodTotalCost = ko.computed(function () {
        var res = 0,
            total = self.pointsCount();
        each(self.usedDiodTypes(), function (k, v) {
            res += (v.itemsCount | 0) * parseFloat(v.price || 0);
        });
        return res;
    }, this).extend({throttle: 100});

    this.powerSupplyTotalCost = ko.computed(function () {
        var res = 0;
        each(self.usedPowerSupplyTypes(), function (k, v) {
            res += (v.itemsCount | 0) * parseFloat(v.price || 0);
        });
        return res;
    }, this).extend({throttle: 100});

    this.projectCost = ko.computed(function () {
        return self.powerSupplyTotalCost() + self.diodTotalCost();
    }, this).extend({throttle: 100});

    this.pointsWattCountNeeded = ko.observable(0);
    this.powerSupplyTotalCount = ko.observable(0);

    this.powerSupplyAmperageTotal = ko.computed(function () {
        var res = 0;
        each(self.usedPowerSupplyTypes(), function (k, d) {
            res += d.itemsCount * d.amperage;
        });
        return res.toFixed(2);
    }, this).extend({throttle: 100});

    this.pointsWattCount = ko.computed(function () {
        var res = 0,
            resN = 0,
            bestBPIdx = 0,
            blocksPower = {},
            total = self.pointsCount(),
            candidate = [],
            choice,
            powerSupplyTC = 0;

        each(self.usedDiodTypes(), function (k, dt) {
            res += dt.itemsCount * parseFloat(dt.power);
        });

        resN = res * 1.15;
        self.pointsWattCountNeeded(Math.ceil(resN));
        if (resN > 0) {
            //TODO Use minimal count of PS
            each(self.powerSuplyInfo, function (k, pw) {
                self.powerSuplyInfo[k].itemsCount = 0;
                blocksPower[k] = {
                    power: parseInt(pw.power, 10),
                    rate: pw.price / pw.power,
                    idx: k
                };
                bestBPIdx = bestBPIdx || k;
                if (blocksPower[k].rate < blocksPower[bestBPIdx].rate) {
                    bestBPIdx = k;
                }
            });

            while (resN > blocksPower[bestBPIdx].power) {
                self.powerSuplyInfo[bestBPIdx].itemsCount++;
                powerSupplyTC++;
                resN -= blocksPower[bestBPIdx].power;
            }
            //objects to $.each here
            $.each(blocksPower, function (k, pw) {
                if (pw.power > resN) {
                    candidate.push(pw);
                }
            });
            each(candidate, function (k, cd) {
                choice = choice || cd;
                if (cd.price < self.powerSuplyInfo[choice.idx].price) {
                    choice = cd;
                }
            });

            self.powerSuplyInfo[choice.idx].itemsCount++;
            powerSupplyTC++;

            self.usedPowerSupplyTypes([]);
            each(self.powerSuplyInfo, function (k, pw) {
                if (pw.itemsCount > 0) {
                    self.usedPowerSupplyTypes.push(pw);
                }
            });

            self.powerSupplyTotalCount(powerSupplyTC);
        } else {
            self.usedPowerSupplyTypes([defPowerSupply]);
        }

        return Math.round(res);
    }, this).extend({throttle: 100});

    /* =============== */
    this.size = ko.computed(function () {
        return self.WorkArea.SvgImage.svgObjWidth() + 'x' + self.WorkArea.SvgImage.svgObjHeight();
    }, this).extend({throttle: 100});
    this.perimetr = ko.computed(function () {
        return (self.WorkArea.SvgImage.svgObjWidth() + self.WorkArea.SvgImage.svgObjHeight()) * 2;
    }, this).extend({throttle: 100});

    /* =============== */
    this.testUseMorePowerfulDiode = function () {
        var deep = self.greedDeep(),
            dTypes = self.usedDiodTypes(),
            dType = self.usedDiodType(),
            useAnother;
        if (dTypes.length == 1) {
            useAnother = diodeSearch(deep);
            console.log(dType === useAnother[useAnother.length - 1], dType, useAnother[useAnother.length - 1])
            if (useAnother.length > 1 && dType !== useAnother[useAnother.length - 1]) {
                self.Dialog.showModalWindow({
                    type: 'info',
                    message: 'Сделать конструкцию более яркой?<div class="comment">' +
                        '(по умолчанию расчет предлагается на оптимальных светодиодных модулях ' +
                        'по соотношению яркость/стоимость подсветки)' +
                        '</div>',
                    buttons: [
                        {
                            text: 'Да',
                            callback: function () {
                                self.useBetter = true;
//                            self.greedDeep.valueHasMutated();
//                            self.pointsCount.valueHasMutated();

                                self.Dialog.hideModalWindow();
                                self.WorkArea.calculateDiod();
//                                var info = self.usedDiodTypes()[0];
//                            if(self.WorkArea.diodesArr().length){
//                                var diodesArr = self.WorkArea.diodesArr(),
//                                    diodesArrLength = diodesArr.length;
//                                self.WorkArea.isReady(false);
//                                $.each(diodesArr,function(k,d){
//                                    setTimeout(function(i){
//                                        diodesArr[i].setInfo(info);
//                                        if(k == diodesArrLength-1){
//                                            self.WorkArea.isReady(true);
//                                        }
//                                    },k*10,k)
//                                });
//                            }
                            }
                        },
                        {
                            text: 'Отмена',
                            callback: function () {
                                self.Dialog.hideModalWindow();
                            }
                        }
                    ]
                })
            }
        }
    };
    /* =============== */

    this.resetData = function () {
        self.usedPowerSupplyTypes([defPowerSupply]);
        self.usedDiodTypes([defDiod]);
        self.usedDiodType(defDiod);
        self.pointsCount(0);
        self.pointsWattCountNeeded = ko.observable(0);
        self.powerSupplyTotalCount = ko.observable(0);
    };

    self.usedDiodType.subscribe(function (val) {
        if (self.usedDiodTypes().length == 1) {
            self.usedDiodTypes([val]);
        }
    });

    self.greedDeep.subscribe(function (val) {
        var minHVal, maxHVal,
            selectedType;

        each(self.diodInfo, function (k, d) {
            var h = d.h1.split('-'), hFrom = h[0], hTo = h[1];
            minHVal = minHVal || hFrom;
            maxHVal = maxHVal || hTo;

            minHVal = Math.min(minHVal, hFrom);
            maxHVal = Math.max(maxHVal, hTo);

            if (self.useBetter) {
                if (val <= hTo && val >= hFrom) {
                    selectedType = k;
                }
            } else {
                if (val <= hTo && selectedType === undefined) {
                    selectedType = k;
                }
            }

        });

        var v = parseInt(val, 10),
            error = false;
        if (isNaN(v) || v < minHVal) {
            v = minHVal;
            error = true;
        } else if (v > maxHVal) {
            v = maxHVal;
            error = true;
        }
        if (error) {
            setTimeout(function () {
                dialog.hideModalWindow();
            }, 4000);
            dialog.showModalWindow({
                message: 'Введенная глубина конструкции<br> не попадает в диапазон от ' +
                    minHVal +
                    ' мм<br> до ' + maxHVal +
                    ' мм. Попробуйте еще раз!'
            });
        }
        var testUsedDiodType = function (diodType) {
            var allowed = diodeSearch(v);
            return allowed.indexOf(diodType) == -1;
        };
        if (selectedType !== undefined && self.usedDiodType() === defDiod || selectedType !== undefined && testUsedDiodType(self.usedDiodType())) {
            self.usedDiodTypes([]);
            self.diodInfo[selectedType].itemsCount = self.diodInfo[selectedType].itemsCount || self.pointsCount();
            self.usedDiodTypes.push(self.diodInfo[selectedType]);
            self.usedDiodType(self.diodInfo[selectedType]);
        }
        self.greedDeep(v);
        self.totalDeep(v);
    });

    self.sentToManager = function () {
        var summ = self.projectCost();
        if (summ > 0) {

            self.User.sentToManager(true);
            self.Dialog.showDialogWindow();
        } else {
            self.Dialog.showModalWindow({
                message: "Ошибка! Невозможно отправить нулевой расчет."
            });
        }
    };
    self.sentToUser = function () {
        var summ = self.projectCost();
        if (summ > 0) {
            self.Dialog.showDialogWindow();
        } else {
            self.Dialog.showModalWindow({
                message: "Ошибка! Невозможно отправить нулевой расчет."
            });
        }
    };
};