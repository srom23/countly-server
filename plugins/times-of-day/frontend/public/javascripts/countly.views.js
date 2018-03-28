window.todview = countlyView.extend({

    initialize: function () {
    },

    beforeRender: function () {
        var self = this;
        self.tod_type = "[CLY]_session";
        self.date_range = this.getDateRange('current');
        if (!this.timesOfDayData) {
            return $.when($.get(countlyGlobal["path"] + '/times-of-day/templates/timesofday.html', function (src) {
                self.template = Handlebars.compile(src);
            }), timesOfDayPlugin.fetchAllEvents(), timesOfDayPlugin.fetchTodData(self.tod_type, self.date_range)).then(function () {
                self.timesOfDayData = timesOfDayPlugin.getTodData();
                self.eventsList = timesOfDayPlugin.getEventsList();
            });
        }


    },

    loadSessionEventData: function () {
        $("#event-session-list").html('<div data-value="[CLY]_session" class="es-option item" data-localize="times-of-day.sessions">' + jQuery.i18n.map['times-of-day.sessions'] + '</div>');
        $("#event-session-list").append('<div class="group">' + jQuery.i18n.map['times-of-day.events'] + '</div>');
        var events = this.eventsList || [];
        for (var i = 0; i < events.length; i++) {
            $("#event-session-list").append('<div data-value="' + events[i] + '" class="es-option item" data-localize="">' + events[i] + '</div>');
        }

        var self = this;
        $(".es-option").on("click", function () {
            var value = $(this).data("value");
            self.tod_type = value;
            $.when(
                timesOfDayPlugin.fetchTodData(value, self.date_range),
                timesOfDayPlugin.fetchAllEvents()
            ).done(function (result) {
                self.timesOfDayData = timesOfDayPlugin.getTodData();
                self.eventsList = timesOfDayPlugin.getEventsList();
                self.updateView();
            });
        });
    },

    getDateRange: function (period) {

        switch (period) {
            case "current":
                var d = moment();
                return d.year() + ":" + (d.month() + 1);
            case "previous":
                var d = moment().add(-1, "M");
                return d.year() + ":" + (d.month() + 1);
            case "last_3":
                var response = [];
                for (var i = 0; i < 3; i++) {
                    var d = moment().add(-1 * i, "M");
                    response.push(d.year() + ":" + (d.month() + 1))
                }
                return response.join(',');
            default:
                return;
        }
    },

    renderCommon: function (isRefresh) {
        this.templateData = {
            "page-title": jQuery.i18n.map["times-of-day.plugin-title"]
        };

        if (!isRefresh) {
            $(this.el).html(this.template(this.templateData));
            this.updateView();

            var self = this;

            $('.ds').on('click', function () {
                var id = $(this).attr('id');
                
                $('.ds').removeClass('active').removeClass('selected');
                $(this).addClass('active').addClass('selected');

                switch (id) {
                    case "ds_this":
                        self.date_range = self.getDateRange('current');
                        break;
                    case "ds_previous":
                        self.date_range = self.getDateRange('previous');
                        break;
                    case "ds_last_3":
                        self.date_range = self.getDateRange('last_3');
                        break;
                    default:
                        self.date_range = self.getDateRange();
                        break;
                }

                $.when(
                    timesOfDayPlugin.fetchTodData(self.tod_type, self.date_range),
                    timesOfDayPlugin.fetchAllEvents()
                ).done(function (result) {
                    self.timesOfDayData = timesOfDayPlugin.getTodData();
                    self.eventsList = timesOfDayPlugin.getEventsList();
                    self.updateView();
                });
            })
        }
    },

    updateView: function () {
        $('#chart').empty();
        this.loadSessionEventData();
        this.loadTimesOfDay();
        this.loadTimeOfDayTable();
    },

    loadTimesOfDay: function () {
        timesOfDayPlugin.loadTimesOfDay(this.timesOfDayData, this.tod_type === "[CLY]_session" ? jQuery.i18n.map['times-of-day.sessions']  : this.tod_type);
    },

    loadTimeOfDayTable: function () {
        var self = this;
        var tableData = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23].map(function (h) {
            return {
                hour: h,
                sunday: self.timesOfDayData[0][h],
                monday: self.timesOfDayData[1][h],
                tuesday: self.timesOfDayData[2][h],
                wednesday: self.timesOfDayData[3][h],
                thursday: self.timesOfDayData[4][h],
                friday: self.timesOfDayData[5][h],
                saturday: self.timesOfDayData[6][h],
            }
        });

        this.dtable = $('#dataTableOne').dataTable($.extend({}, $.fn.dataTable.defaults, {
            "aaData": tableData,
            "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
            },
            "aoColumns": [
                {
                    "mData": "hour", "mRender": function (hour, type) {
                        var nextHour = hour + 1 > 23 ? 0 : hour + 1;
                        return (hour < 10 ? "0" + hour : hour) + ":00 - " + (nextHour < 10 ? "0" + nextHour : nextHour) + ":00"
                    }, "sType": "string", "sTitle": jQuery.i18n.map['times-of-day.hours']
                },
                { "mData": "monday", "sType": "numeric", "sTitle": jQuery.i18n.map['times-of-day.monday'], "mRender" :function(d){
                    return countlyCommon.formatNumber(d);
                }},
                { "mData": "tuesday", "sType": "numeric", "sTitle": jQuery.i18n.map['times-of-day.tuesday'], "mRender" :function(d){
                    return countlyCommon.formatNumber(d);
                }},
                { "mData": "wednesday", "sType": "numeric", "sTitle": jQuery.i18n.map['times-of-day.wednesday'], "mRender" :function(d){
                    return countlyCommon.formatNumber(d);
                }},
                { "mData": "thursday", "sType": "numeric", "sTitle": jQuery.i18n.map['times-of-day.thursday'], "mRender" :function(d){
                    return countlyCommon.formatNumber(d);
                } },
                { "mData": "friday", "sType": "numeric", "sTitle": jQuery.i18n.map['times-of-day.friday'], "mRender" :function(d){
                    return countlyCommon.formatNumber(d);
                } },
                { "mData": "saturday", "sType": "numeric", "sTitle": jQuery.i18n.map['times-of-day.saturday'], "mRender" :function(d){
                    return countlyCommon.formatNumber(d);
                } },
                { "mData": "sunday", "sType": "numeric", "sTitle": jQuery.i18n.map['times-of-day.sunday'], "mRender" :function(d){
                    return countlyCommon.formatNumber(d);
                } }
            ]
        }));

        this.dtable.stickyTableHeaders();
        this.dtable.fnSort([[0, 'asc']]);
    },
    refresh: function () {
    },
});

app.todview = new todview();

app.route('/analytics/times-of-day', 'times-of-day', function () {
    this.renderWhenReady(this.todview);
});


$(document).ready(function () {
    var menu = '<a href="#/analytics/times-of-day" class="item" ">' +
        '<div class="logo fa fa-plugin" style="background-image:none; font-size:24px; text-align:center; width:35px; margin-left:14px; line-height:42px;"></div>' +
        '<div class="text" data-localize="times-of-day.plugin-title"></div>' +
        '</a>';

    $('.sidebar-menu #engagement-submenu').append(menu);
});

app.addPageScript("/custom#", function(){
    
    if(countlyGlobal["plugins"].indexOf("dashboards") < 0){
        return;
    }

    var todWidgetTemplate;

    $.when(
        $.get(countlyGlobal["path"]+'/times-of-day/templates/widget.html', function(src){
            todWidgetTemplate = Handlebars.compile(src);
        })
    ).then(function () {
        addWidgetScript();
        
        var widgetOptions = {
            init: initWidgetSections,
            settings: widgetSettings,
            placeholder: addPlaceholder,
            create: createWidgetView,
            reset: resetWidget,
            set: setWidget,
            refresh: refreshWidget
        };

        app.addWidgetCallbacks("times-of-day", widgetOptions);
    });

    function addWidgetScript(){
        addWidgetType();
        addSettingsSection();

        function addWidgetType(){
            var todWidget =   '<div data-widget-type="times-of-day" class="opt cly-grid-5">' +
                                '    <div class="inner">' +
                                '        <span class="icon timesofday"></span>' +
                                '        Times' +
                                '    </div>' +
                                '</div>';
    
            $("#widget-drawer .details #widget-types .opts").append(todWidget);
        }
    
        function addSettingsSection(){
        }
    }

    function initWidgetSections(){
        var selWidgetType = $("#widget-types").find(".opt.selected").data("widget-type");

        if(selWidgetType != "times-of-day"){
            return;
        }
        
        var dataType = $("#data-types").find(".opt.selected").data("data-type");
        
        $("#widget-drawer .details #data-types").parent(".section").show();
        $("#data-types").find(".opt[data-data-type=push]").addClass("disabled");
        $("#data-types").find(".opt[data-data-type=crash]").addClass("disabled");
        $("#widget-section-single-app").show();
        if(dataType == "event"){
            $("#widget-section-single-event").show();
        }
    }

    function widgetSettings(){
        var $singleAppDrop = $("#single-app-dropdown"),
            $singleEventDrop = $("#single-event-dropdown"),
            dataType = $("#data-types").find(".opt.selected").data("data-type");
            
        var selectedApp = $singleAppDrop.clySelectGetSelection();
        var selectedEvent = $singleEventDrop.clySelectGetSelection();
        
        var settings = {
            apps: (selectedApp)? [ selectedApp ] : [],
            data_type: dataType
        };

        if(dataType == "event"){
            settings.events = (selectedEvent)? [ selectedEvent ] : [];
        }

        return settings;
    }

    function addPlaceholder(dimensions){
        dimensions.min_height = 3;
        dimensions.min_width = 4;
        dimensions.width = 4;
        dimensions.height = 3;
    }

    function createWidgetView(widgetData){
        var placeHolder = widgetData.placeholder;
        
        formatData();
        render();

        function formatData(){
            var data = widgetData.data;

            var labelsX = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"];
            var labelsY = [
                {
                    dispLabel: jQuery.i18n.map['times-of-day.sunday'].slice(0,2),
                    label: jQuery.i18n.map['times-of-day.sunday'],
                    data: []
                },
                {
                    dispLabel: jQuery.i18n.map['times-of-day.monday'].slice(0,2),
                    label: jQuery.i18n.map['times-of-day.monday'],                    
                    data: []
                },
                {
                    dispLabel: jQuery.i18n.map['times-of-day.tuesday'].slice(0,2),
                    label: jQuery.i18n.map['times-of-day.tuesday'],                    
                    data: []
                },
                {
                    dispLabel: jQuery.i18n.map['times-of-day.wednesday'].slice(0,2),
                    label: jQuery.i18n.map['times-of-day.wednesday'],                    
                    data: []
                },
                {
                    dispLabel: jQuery.i18n.map['times-of-day.thursday'].slice(0,2),
                    label: jQuery.i18n.map['times-of-day.thursday'],                    
                    data: []
                },
                {
                    dispLabel: jQuery.i18n.map['times-of-day.friday'].slice(0,2),
                    label: jQuery.i18n.map['times-of-day.friday'],                    
                    data: []
                },
                {
                    dispLabel: jQuery.i18n.map['times-of-day.saturday'].slice(0,2),
                    label: jQuery.i18n.map['times-of-day.saturday'],                    
                    data: []
                },
            ];
            
            var maxDataValue = Math.max.apply(null, ([].concat.apply([], data)));
            var defaultColor = "rgba(255, 255, 255, .07)";
            var maxRadius = 30;
            var minRadius = 7;
            
            var averages = [];
            for (var i = 0; i <= 23; i++) {
                var total = [0, 1, 2, 3, 4, 5, 6].reduce(function (acc, current, y) {
                    return acc + data[y][i]
                }, 0);
                averages.push(total / 7);
            }
            
            for(var i = 0; i < data.length; i++){
                for(var j = 0; j < data[i].length; j++){
                    var fill = parseFloat((data[i][j]/maxDataValue).toFixed(2));
                    var radius = ((maxRadius - minRadius) * fill) + minRadius;
                    var color = defaultColor;
                    if(radius > minRadius){
                        color = "rgba(255, 135, 0, " + fill + ")";
                    }

                    var startHourText = (j < 10 ? "0" + j : j) + ":00";
                    var endHour = j + 1 > 23 ? 0 : j + 1;
                    var endHourText = (endHour < 10 ? "0" + endHour : endHour) + ":00";

                    var percentage = ((data[i][j] - averages[j]) * 100) / averages[j];
                    
                    var obj = {
                        color: color,
                        radius: radius,
                        count: data[i][j],
                        averagePercentage: percentage.toFixed(0),
                        startHour: startHourText,
                        endHour: endHourText
                    }
                    labelsY[i].data.push(obj);
                }
            }

            var sunday = labelsY[0];
            labelsY = labelsY.splice(1, 7);
            labelsY.push(sunday);
            
            var formattedData = {
                labelsX: labelsX,
                labelsY: labelsY,
                type: widgetData.data_type === "session" ? jQuery.i18n.map['times-of-day.sessions']  : widgetData.events[0].split("***")[1]
            };

            widgetData.formattedData = formattedData;
        }
        
        function render() {
            var title = widgetData.title,
                app = widgetData.apps,
                data = widgetData.formattedData;
                
            var appName = countlyGlobal.apps[app[0]].name,
                appId = app[0];

            var $widget = $(todWidgetTemplate({
                title: title,
                app: {
                    id: appId,
                    name: appName
                },
                data: data
            }));

            placeHolder.find("#loader").fadeOut();
            placeHolder.find(".cly-widget").html($widget.html());

            if (!title) {
                var widgetTitle = "Times of day";
                placeHolder.find(".title").text(widgetTitle);
            }

            placeHolder.find('.timesofday-body-cell .crcl circle').tooltipster({
                animation: "fade",
                animationDuration: 50,
                delay: 100,
                theme: 'tooltipster-borderless',
                trigger: 'custom',
                triggerOpen: {
                    mouseenter: true,
                    touchstart: true
                },
                triggerClose: {
                    mouseleave: true,
                    touchleave: true
                },
                interactive: true,
                contentAsHTML: true,
                functionInit: function(instance, helper) {
                    instance.content(getTooltipText($(helper.origin).parents(placeHolder.find(".timesofday-body-cell"))));
                }
            })

            function getTooltipText(jqueryEl) {
                var count = jqueryEl.parents("td").data("count");
                var startHour = jqueryEl.parents("td").data("starthour");
                var endHour = jqueryEl.parents("td").data("endhour")
                var percentage = jqueryEl.parents("td").data("averagepercentage")
                var label = jqueryEl.parents("tr").data("label");
                var type = jqueryEl.parents(".timesofday").find("table").data("es-type");

                var tooltipStr = "<div id='tod-tip'>";

                type = type.toLowerCase();
                if(type != "sessions"){
                    type = type + "(s)"
                }
                tooltipStr += jQuery.i18n.prop('times-of-day.tooltip-1', countlyCommon.formatNumber(count), type, label, startHour, endHour) + "<br/>";
                tooltipStr += count > 0 ? jQuery.i18n.prop('times-of-day.tooltip-' + (percentage > 0 ? "more" : "less") + '-than', Math.abs(percentage)) : "";

                tooltipStr += "</div>";
        
                return tooltipStr;
            }

            $(".crcl").on({
                mouseenter:function () {
                    $(".crcl").removeClass("hover");
                    $(this).addClass("hover");
                },
                mouseleave:function () {
                    $(".crcl").removeClass("hover");
                }
            });

            placeHolder.find(".timesofday").off("resize").on("resize", function(){
                if(placeHolder.find(".timesofday").width() >= 690){
                    placeHolder.find(".timesofday table th:nth-child(2n+1)").css({ "visibility": "visible"});
                }else{
                    placeHolder.find(".timesofday table th:nth-child(2n+1)").css({ "visibility": "hidden"});
                }
            })
        }
    }

    function resetWidget(){
        var $singleEventDrop = $("#single-event-dropdown");

        $singleEventDrop.clySelectSetSelection("", "Select event");
    }

    function setWidget(widgetData){
        var apps = widgetData.apps;
        var dataType = widgetData.data_type;
        var events = widgetData.events;

        var $singleAppDrop = $("#single-app-dropdown");
        var $singleEventDrop = $("#single-event-dropdown");
        var $dataTypes = $("#data-types");
        
        $singleAppDrop.clySelectSetSelection(apps[0], countlyGlobal.apps[apps[0]].name);
        
        $dataTypes.find(".opt").removeClass("selected");
        $dataTypes.find(".opt[data-data-type=" + dataType + "]").addClass("selected");
        
        if (events) {
            var eventNames = {},
                deferreds = [];

            for (var i = 0; i < events.length; i++) {
                deferreds.push(countlyDashboards.getEventNameDfd(events[i], eventNames));
            }

            $.when.apply(null, deferreds).done(function() {
                $singleEventDrop.clySelectSetSelection(events[0], eventNames[events[0]]);
            });
        }
    }

    function refreshWidget(widgetEl, widgetData){

    }
});
