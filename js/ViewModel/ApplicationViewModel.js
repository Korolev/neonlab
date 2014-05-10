/**
 * Created by mk-sfdev on 4/17/14.
 */

//147.svg - KARO

    /*
    цена общая выравнивание по правому краю, а Итого по левому
    Отправка писем
    Номер расчета
    Кнопка Отмена в развернутом варианте ТЗ2 стр 20
     */

var ApplicationViewModel = function () {
    this.isDev = location.href.indexOf('localhost')>-1;
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

    /* =============== */
//TODO get Data from server
    this.diodInfo = [
        {h1: '60-100', name: 'X-Led Samsung 25', size: '20x9', luminous: '25', power: '0.6', distance: '100', price: '20'},
        {h1: '80-150', name: 'X-Led Samsung 50', size: '25x25', luminous: '50', power: '0.72', distance: '165', price: '32'},
        {h1: '130-200', name: 'X-Led Samsung 80', size: '25x25', luminous: '80', power: '0.72', distance: '215', price: '53'},
        {h1: '180-250', name: 'X-Led Samsung 120', size: '25x25', luminous: '120', power: '0.72', distance: '215', price: '60'}
    ];
    this.powerSuplyInfo = [
        {name: 'Mean Well', characteristic: '20 Вт, 12 В, IP 67', power: '20', amperage: '0.11', price: '450'},
        {name: 'Mean Well', characteristic: ' 35 Вт, 12 В, IP 67', power: '35', amperage: '0.19', price: '620'},
        {name: 'Mean Well', characteristic: ' 60 Вт, 12 В, IP 67', power: '60', amperage: '0.33', price: '740'},
        {name: 'Mean Well', characteristic: ' 100 Вт, 12 В, IP 67', power: '100', amperage: '0.54', price: '1200'},
        {name: 'Mean Well', characteristic: ' 150 Вт, 12 В, IP 65', power: '150', amperage: '0.78', price: '2450'}
    ];
    /* =============== */

    this.usedDiodTypes = ko.observableArray([defDiod]);
    this.usedPowerSupplyTypes = ko.observableArray([defPowerSupply]);

    /* =============== */
    this.pointsCount = ko.observable(0);
    this.diodTotalCost = ko.computed(function () {
        var res = 0,
            total = self.pointsCount();
        $.each(self.usedDiodTypes(), function (k, v) {
            res += (v.itemsCount | 0) * parseFloat(v.price || 0);
        });
        return res;
    }, this).extend({throttle: 100});

    this.powerSupplyTotalCost = ko.computed(function () {
        var res = 0;
        $.each(self.usedPowerSupplyTypes(), function (k, v) {
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
        $.each(self.usedPowerSupplyTypes(),function(k,d){
            res += d.itemsCount * d.amperage;
        });
        return res.toFixed(2);
    }, this).extend({throttle: 100});

    this.luminousMax = ko.computed(function () {
        var res = 0;
        $.each(self.usedDiodTypes(),function(k,d){
            res = Math.max(res, d.luminous);
        });
        return res;
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

        $.each(self.usedDiodTypes(), function (k, dt) {
            res += dt.itemsCount * parseFloat(dt.power);
        });

        resN = res * 1.15;
        self.pointsWattCountNeeded(Math.ceil(resN));
        if (resN > 0) {
            //TODO Use minimal count of PS
            $.each(self.powerSuplyInfo, function (k, pw) {
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

            $.each(blocksPower, function (k, pw) {
                if (pw.power > resN) {
                    candidate.push(pw);
                }
            });

            $.each(candidate, function (k, cd) {
                choice = choice || cd;
                if (cd.price < self.powerSuplyInfo[choice.idx].price) {
                    choice = cd;
                }
            });

            self.powerSuplyInfo[choice.idx].itemsCount++;
            powerSupplyTC++;

            self.usedPowerSupplyTypes([]);
            $.each(self.powerSuplyInfo, function (k, pw) {
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

    this.resetData = function(){
        self.usedDiodTypes([defDiod]);
        self.usedPowerSupplyTypes([defPowerSupply]);
    };

    self.greedDeep.subscribe(function (val) {
        var minHVal, maxHVal,
            selectedType;

        $.each(self.diodInfo, function (k, d) {
            var h = d.h1.split('-'), hFrom = h[0], hTo = h[1];
            minHVal = minHVal || hFrom;
            maxHVal = maxHVal || hTo;

            minHVal = Math.min(minHVal, hFrom);
            maxHVal = Math.max(maxHVal, hTo);

            if (val <= hTo && selectedType === undefined) {
                selectedType = k;
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
                message : 'Введенная глубина конструкции<br> не попадает в диапазон от ' +
                    minHVal +
                    ' мм<br> до ' + maxHVal +
                    ' мм. Попробуйте еще раз!'
            });
        }
        if(selectedType !== undefined){
            self.usedDiodTypes([]);
            self.diodInfo[selectedType].itemsCount = self.diodInfo[selectedType].itemsCount || 0;
            self.usedDiodTypes.push(self.diodInfo[selectedType]);
        }
        self.greedDeep(v);
    });

    self.getSvgImg = ko.computed(function () {
        var html = '';
//            s = self.canvas.select('svg');
//
//
//        if (self.svgObject()) {
////            html = s.node.outerHTML
//        }

        return html;
    }, this).extend({throttle: 100});
};