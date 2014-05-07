/**
 * Created by Lenovo on 09.11.13.
 */

ko.observableArray.fn.pushAll = function (valuesToPush) {
    var underlyingArray = this();
    this.valueWillMutate();
    ko.utils.arrayPushAll(underlyingArray, valuesToPush);
    this.valueHasMutated();
    return this;
};

ko.bindingHandlers.masked = {
    init: function(element, valueAccessor, allBindingsAccessor) {
        var mask = allBindingsAccessor().mask;
        $(element).mask(mask);
        ko.utils.registerEventHandler(element, 'focusout', function() {
            var observable = valueAccessor();
            observable($(element).val());
        });
    },
    update: function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        $(element).val(value);
    }
};

ko.bindingHandlers['digitext'] = {
    'update': function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor()) + "";
        value = value.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
        if(value.indexOf('.') > -1){
            value = function(val){
                var res = val.split('.');
                return res[0]+','+res[1].substr(0,2);
            }(value);
        }
        ko.utils.setTextContent(element, value);
    }
};

ko.bindingHandlers['absdigitext'] = {
    'update': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var value = parseFloat(ko.utils.unwrapObservable(valueAccessor()));

        if (!isNaN(value) && viewModel.cssClass == "transport_tr") {
            value = Math.abs(value);
        }

        value = isNaN(value) ? '' : value + '';

        value = value.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1 ');
        ko.utils.setTextContent(element, value);
    }
};

ko.bindingHandlers['accountname'] = {
    'update': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var value = ko.utils.unwrapObservable(valueAccessor()),
            acc = bindingContext.$root.accountsHash[value];
        value = acc ? acc.description : "";
        ko.utils.setTextContent(element, value);
    }
};
ko.bindingHandlers['shorttext'] = {
    'update': function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor()) + "";
        value = value.length > 18 ? value.substr(0, 18) + ".." : value;
        ko.utils.setTextContent(element, value);
    }
};

ko.bindingHandlers['currency'] = {
    'update': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var uw = ko.utils.unwrapObservable,
            value = uw(valueAccessor());
        value = uw(value);
        value = value ? value : 0;
        try {
            value = bindingContext.$root.currency[value].shortname;
        } catch (e) {
            console.log(e, value);
        }

        ko.utils.setTextContent(element, value);
    }
};

ko.bindingHandlers['gotoaction'] = {
    'init': function (element, valueAccessor, allBindings, root) {
        $(element).click(function (e) {
            var val = ko.utils.unwrapObservable(valueAccessor());
            //root.action(val);
            location.hash = val;
        })
    }
};
//DATE

ko.bindingHandlers['textdate'] = {
    'update': function (element, valueAccessor) {
        var uw = ko.utils.unwrapObservable,
            value = moment.isMoment(uw(valueAccessor())) ? uw(valueAccessor()) : moment(uw(valueAccessor())),
            date = new moment(),
            trdate = new Date(value * 1000),
            trnow = value.clone().startOf('day'),
            now = moment().startOf('day'),
            now_1 = now.clone().subtract('days', 1),
            now_2 = now.clone().subtract('days', 2),
            dayOfWeek = value.day();

        if (trnow.format() == now.format()) {
            value = value.format("HH:mm");
        } else if (trnow.format() == now_1.format()) {
            value = "Вчера"
        } else if (trnow.format() == now_2.format()) {
            value = dayOfWeeks[dayOfWeek];
        } else {
            value = value > new moment().year(1980) ?
                [value.date(), value.format('MMM').toUpperCase(), value.year()].join(" ")
                : "";
        }

        ko.utils.setTextContent(element, value);
    }
};

ko.bindingHandlers['date'] = {
    'update': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        //TODO appen datePicker here
        var value = ko.utils.unwrapObservable(valueAccessor());
        value = moment.isMoment(value) ?
            value.format()
            : ko.utils.unwrapObservable(value.value).format(value.format);

        ko.utils.setTextContent(element, value);
    }
};
ko.bindingHandlers['datepick'] = {
    'init': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var uw = ko.utils.unwrapObservable,
            $element = $(element),
            value = uw(valueAccessor()),
            date,
            textHolder,
            datePicker;

        date = moment.isMoment(value) ?
            value.format()
            : moment(uw(value.value)).format(value.format);

        textHolder = $('<div/>', {class: 'dateval'}).appendTo(element).text(date);
        datePicker = $('<div/>', {class: 'hidden animated itemDropDown '}).appendTo(element);

        textHolder.on('click', function (e) {
            var hidden = datePicker.hasClass('hidden');
            datePicker.removeClass(hidden ? 'hidden' : 'fadeInDown')
                .addClass(hidden ? 'fadeInDown' : 'hidden');
        });

        datePicker.pickmeup({
            flat: true,
            locale: datePickerLocale,
            date: moment.isMoment(value) ? value : uw(value.value),
            change: function (s, d) {
                value.value(new moment(d));
                bindingContext.$root.selectedFilter(new FilterViewModel({type: 'interval'}, bindingContext.$root));
                if (!value.time)datePicker.addClass('hidden').removeClass('fadeInDown');
            }
        });

        $element.data('textHolder', textHolder);
        $element.data('datePicker', datePicker);
        //timePicker
        var createSlider = function (title, label, parts, initValue, callback) {
                var text = $('<div/>', {class: 'slider-text'}).text(label),
                    resizer = $('<div/>', {class: 'slider-element'}),
                    resizerVal = $('<div/>', {class: 'slider-value'}),
                    resizerSetter = $('<div/>', {class: 'slider-value-setter'}),
                    k = 100 / parts,
                    findPos = function (obj) {
                        var curLeft = 0,
                            curTop = 0;

                        if (obj.offsetParent) {
                            curLeft = obj.offsetLeft
                            curTop = obj.offsetTop
                            while (obj = obj.offsetParent) {
                                curLeft += obj.offsetLeft
                                curTop += obj.offsetTop
                            }
                        }
                        return [curLeft, curTop];
                    }
                    ;

                resizer.append(resizerVal);
                resizer.append(resizerSetter);

                var drag = false,
                    pos,
                    ox,
                    dx,
                    width,
                    valCss,
                    val;

                if (initValue !== undefined) {
                    resizerSetter.css({'left': k * initValue + '%'});
                    resizerVal.css({'width': k * initValue + '%'});
                }


                resizer.on('mousedown', function (e) {
                    var target = e.target.className == 'slider-value-setter'?
                        e.target.parentNode
                        : e.target;

                    width = resizer.width();
                    pos = findPos(target);
                    ox = pos[0];
                    dx = e.screenX - ox;
                    drag = true;

                    valCss = dx/width*100 | 0;
                    val = parts*valCss/100  | 0;
                    val = val > parts ? parts : val;
                    val = val < 0 ? 0 : val;

                    valCss = valCss > 105 ? 105 : valCss;
                    valCss = valCss < 10 ? 10 : valCss;

                    resizerSetter.css({'left': valCss + '%'});
                    resizerVal.css({'width': valCss + '%'});

                    $(document).on('mouseup.'+title, function () {
                        drag = false;
                        callback(val);
                        $(document).off('mouseup.'+title);
                    });
                });

                $(document).on('mousemove', function (e) {
                    var target = e.target.className == 'slider-value-setter'?
                        e.target.parentNode
                        : e.target;
                    if (drag) {
                        dx = e.screenX - ox;

                        valCss = dx/width*100 | 0;
                        val = parts*valCss/100  | 0;
                        val = val > parts ? parts : val;
                        val = val < 0 ? 0 : val;

                        valCss = valCss > 105 ? 105 : valCss;
                        valCss = valCss < 10 ? 10 : valCss;

                        resizerSetter.css({'left': valCss + '%'});
                        resizerVal.css({'width': valCss + '%'});
                        callback(val);
                    }
                });



                return $('<div/>', {class: 'slider-holder'})
                    .append(text)
                    .append(resizer);
            },
            timePicker,
            timeOut = $('<div/>', {class: 'timeOut'}),
            minSlider = createSlider('minute', 'Мин', 59, moment(value.value()).minutes(), function(val){
                var new_val = moment(value.value()).minutes(val);
                value.value(new_val);
                timeOut.text(new_val.format("HH:mm"));
            }),
            hourSlider = createSlider('hour', 'Час', 23, moment(value.value()).hours(), function(val){
                var new_val = moment(value.value()).hours(val);
                value.value(new_val);
                timeOut.text(new_val.format("HH:mm"));
            }),
            okButton = $('<input type="button" class="vse-cancel small button" value="OK"/>');
            okButton.on('click',function(){
                datePicker.addClass('hidden').removeClass('fadeInDown');
            });

        if (value.time) {
            timePicker = $('<div/>', {class: 'timepicker'})
                .appendTo(datePicker);

            $('<div/>', {class: 'left-panel'})
                .appendTo(timePicker)
                .append(timeOut);

            timeOut.text(moment.isMoment(value) ?
                value.format('HH:mm')
                : moment(uw(value.value)).format('HH:mm'));

            $('<div/>', {class: 'right-panel'})
                .appendTo(timePicker)
                .append(hourSlider)
                .append(minSlider);

            $('<div/>', {class: 'button-panel'})
                .appendTo(timePicker)
                .append(okButton);
        }
    },
    'update': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var $element = $(element),
            value = ko.utils.unwrapObservable(valueAccessor()),
            date,
            textHolder = $element.data('textHolder'),
            datePicker = $element.data('datePicker');


        date = moment.isMoment(value) ?
            value.format()
            : ko.utils.unwrapObservable(value.value).format(value.format);
        datePicker && datePicker.pickmeup('set_date',
            new Date(moment.isMoment(value) ? value.format() : ko.utils.unwrapObservable(value.value).format()));
        textHolder && textHolder.text(date);
    }
};

ko.bindingHandlers['tabs'] = {
    'init': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var each = function (arr, func) {
                try {
                    for (var i = 0; i < arr.length; i++) {
                        func(arr[i], i);
                    }
                } catch (e) {
                    console && console.log(e);
                }
            },
            options = allBindings().tabs.options,
            $element = $(element),
            tabClass = $element.attr('class') + '-',
            $ul = $($element.children()[0]),
            $tabs = (function (elArr) {
                var res = [];
                each(elArr, function (e) {
                    var $el = $(e);
                    $el.addClass(tabClass + 'tab');
                    $el.data('href', $el.children()[0].href.split('#')[1]);
                    $el.find('span').unwrap();
                    res.push($el);
                });
                return $(res);
            }($ul.find('li'))),
            selectTab = function ($el) {
                var selected = tabClass + 'selected',
                    href = $el.data('href'),
                    divId = '#' + href;

                each($tabs, function (e) {
                    e.removeClass(selected);
                });
                $el.addClass(selected);

                each($element.children(), function (el, i) {
                    $(el).addClass(i > 0 ? 'hidden' : '');
                });
                $(divId).removeClass('hidden');
                if (options.callback[href]) {
                    try {
                        options.callback[href].apply(bindingContext.$root);
                    } catch (e) {
                        console && console.log(e);
                    }
                }
            };

        $ul.addClass(tabClass + 'tabs');

        each($tabs, function (el) {
            $(el).on('click', function (event) {
                selectTab($(this));
            });
        });

        selectTab($tabs[0]);
    }
};

ko.bindingHandlers['treemenu'] = {
    'init': function (element, valueAccessor, allBindings, viewModel, bindingContext) {
//        var each = function (arr, func) {
//                try {
//                    for (var i = 0; i < arr.length; i++) {
//                        func(arr[i], i);
//                    }
//                } catch (e) {
//                    console && console.log(e);
//                }
//            },
//            data = allBindings().treemenu.data(),
//            selected = allBindings().treemenu.value(),
//            $element = $(element);
//
//        console.log(data);
//        console.log(selected);
    }
};
//TODO option caption BUG replace 1 li but need add before
ko.bindingHandlers['select'] = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var uw = ko.utils.unwrapObservable,
            $element = $(element),
            config = valueAccessor(),
            optionText = uw(config.optionText),
            optionValue = uw(config.optionValue),
            optionsCaption = uw(config.optionCaption),
            tag = uw(config.tag ? config.tag : 'div'),
            icon = uw(config.icon),
            css = uw(config.css),
            options,
            value = uw(config.value),
            isSelected,
            _text,
            _ul,
            _options = [],
            buildUI = function () {
                options = uw(config.options);
                //console.log(options);
                if (_text) {
                    _text.remove();
                }
                if (_ul) {
                    _ul.remove()
                }
                _text = $('<' + tag + ' class="fake_select" />').insertBefore($element);
                _ul = $('<ul class="fake_select_body "></ul>').insertAfter(_text).addClass('hidden');
                _options = [];

                var _optionValue,
                    _innerContent;

                _ul.css(css ? css : {
                    'left': _text.position().left,
                    'width': _text.innerWidth()
                });
                if (optionsCaption) {
                    var opt0 = optionText ? {} : optionsCaption;
                    if (optionText) {
                        opt0[optionText] = optionsCaption;
                        opt0.isCaption = true;
                    }

                    _options[0] = $('<li></li>')
                        .text(optionsCaption)
                        .data('_option', opt0)
                        .data('_selected', value == 0);

                    _options[0].on('click', function () {
                        config.value(0);
                        _ul.addClass('hidden');
                    });
                    _options[0].appendTo(_ul);
                }

                for (var i = optionsCaption ? 1 : 0; i < options.length; i++) {
                    _optionValue = optionValue ? options[i][optionValue] : options[i];
                    isSelected = optionValue ?
                        _optionValue == value
                        : _optionValue === value;

                    _innerContent = optionText ? uw(options[i][optionText]) : options[i];
                    if (icon) {
                        _innerContent = '<i class="' + options[i][icon] + '"></i>' + _innerContent;
                    }

                    _options[i] = $('<li></li>')
                        .html(_innerContent)
                        .data('_option', options[i])
                        .data('_selected', isSelected);

                    _options[i][isSelected ? 'addClass' : 'removeClass']('selected');

                    _options[i].on('click', function () {
                        var opt = optionValue ?
                            $(this).data('_option')[optionValue]
                            : $(this).data('_option');
                        config.value(opt);
                        _ul.addClass('hidden');
                    });
                    _options[i].appendTo(_ul);
                }

                _text.on('click', function () {
                    //$('.fake_select_body').not(_ul).addClass('hidden');
                    _ul.toggleClass('hidden');
                });


                $element.data('text', _text);
                $element.data('options', _options);
            };

        buildUI();

        if (ko.isObservable(config.options)) {
            config.options.subscribe(function (val) {
                buildUI();
                config.value.valueHasMutated();
            });
        }
        $element.parent().addClass('binding_select');
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var uw = ko.utils.unwrapObservable,
            $element = $(element),
            config = valueAccessor(),
            optionText = uw(config.optionText),
            optionValue = uw(config.optionValue),
            optionsCaption = uw(config.optionCaption),
            options = uw(config.options),
            value = uw(config.value),
            _text = $element.data('text'),
            _options = $element.data('options'),
            _optionValue,
            isSelected;
        for (var i = 0; i < _options.length; i++) {
            _optionValue = optionValue ?
                _options[i].data('_option')[optionValue]
                : _options[i].data('_option');
            isSelected = optionValue ?
                _optionValue == uw(value)
                : _optionValue === value;
            if (_options[i].data('_option').isCaption && uw(value) == 0) {
                isSelected = true;
            }

            _options[i][isSelected ? 'addClass' : 'removeClass']('selected');

            if (isSelected) {
                _text.text(uw(_options[i].data('_option')[optionText]));
            }
        }


    }
};

ko.bindingHandlers['treeSelect'] = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var uw = ko.utils.unwrapObservable,
            $element = $(element),
            config = valueAccessor(),
            optionText = uw(config.optionText),
            optionTree = uw(config.optionTree),
            optionValue = uw(config.optionValue),
            optionsCaption = uw(config.optionCaption),
            tag = uw(config.tag ? config.tag : 'div'),
            icon = uw(config.icon),
            css = uw(config.css),
            options,
            value = uw(config.value),
            isSelected,
            _text,
            _ul,
            _options = [],
            buildUI = function () {
                var selected = value;
                options = uw(config.options);
                if (_text) {
                    _text.remove();
                }
                if (_ul) {
                    _ul.remove()
                }
                _text = $('<' + tag + ' class="fake_tree_select" />').insertBefore($element);
                _ul = $('<ul class="fake_tree_select_body "></ul>').insertAfter(_text).addClass('hidden');
                _options = [];

                var _optionValue,
                    _innerContent;

                _ul.css(css ? css : {
                    'left': _text.position().left,
                    'width': _text.innerWidth()
                });

                var buildLi = function (arr, parent) {
                    var __options = [],
                        child,
                        __ul,
                        __text;
                    for (var i = 0; i < arr.length; i++) {
                        __options[i] = $('<li></li>')
                            .appendTo(parent);
                        __text = $('<span></span>')
                            .text(uw(arr[i][optionText]))
                            .appendTo(__options[i]);

                        if (arr[i][optionValue] == selected) {
                            _text.text(uw(arr[i][optionText]));
                            __options[i].addClass('selected');
                        }

                        child = uw(arr[i][optionTree]);

                        __text.data('_option', arr[i]);
                        __text.data('_parent', __options[i]);

                        if (child.length) {
                            __options[i].addClass('has_child');
                            __ul = $('<ul class="hidden"></ul>').appendTo(__options[i]);
                            __text.data('_list', __ul);
                            buildLi(child, __ul);
                            __text.on('click', function () {
                                $(this).data('_parent').toggleClass('_open');
                                $(this).data('_list').toggleClass('hidden');
                            });
                        } else {
                            __text.on('click', function () {
                                var selected = $(this).data('_option');
                                config.value(selected[optionValue]);
                                _text.text(uw(selected[optionText]));
                                _ul.find('.selected').removeClass('selected');
                                $(this).data('_parent').addClass('selected');
                                _ul.addClass('hidden');
                            });
                        }
                    }
                    parent.data('_options', __options);
                };

                buildLi(options, _ul);
                _text.on('click', function () {
                    _ul.toggleClass('hidden');
                });
            };

        buildUI();

        if (ko.isObservable(config.options)) {
            config.options.subscribe(function (val) {
                buildUI();
            });
        }

        $element.parent().addClass('binding_tree_select');
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
        var uw = ko.utils.unwrapObservable,
            $element = $(element),
            config = valueAccessor(),
            optionText = uw(config.optionText),
            optionValue = uw(config.optionValue),
            optionsCaption = uw(config.optionCaption),
            options = uw(config.options),
            value = uw(config.value),
            _text = $element.data('text'),
            _options = $element.data('options'),
            _optionValue,
            isSelected;

    }
};