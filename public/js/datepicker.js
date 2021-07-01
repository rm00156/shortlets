/**
 * Directory – Directory & Listing Bootstrap Theme v. 2.0.0
 * Homepage: https://themes.getbootstrap.com/product/directory-directory-listing-bootstrap-4-theme/
 * Copyright 2021, Bootstrapious - https://bootstrapious.com
 */

"use strict";

$(function () {
    var singleMonth = false;
    if ($(window).width() < 767) {
        singleMonth = true;
    }

    var dateRangeConfig = {
        singleDate: true,
        autoClose: true,
        selectForward: true,
        applyBtnClass: "btn btn-primary",
        container: ".datepicker-container",
        inline: true,
        singleMonth: singleMonth,
        showDateFilter: function (time, date) {
            return (
                '<div style="padding:0 5px;">\
                            <span style="">' +
                date +
                '</span></div>'
            );
        },
        beforeShowDay: function (t) {
            var month = t.getMonth();
            var day = t.getDate();
            var year = t.getFullYear();
            var date = year + '-' + month + '-' + day;

            var valid =  true; //disable saturday and sunday
            var _class = "";
            var _tooltip = "";
            return [valid, _class, _tooltip];
        },
        customOpenAnimation: function (cb) {
            $(this).fadeIn(300, cb);
        },
        customCloseAnimation: function (cb) {
            $(this).fadeOut(300, cb);
        },
    };

    $("#bookedFromDt")
        .dateRangePicker(dateRangeConfig)
        .bind("datepicker-opened", function () {
            
    });

    var dateRangeConfig2 = {
        singleDate: true,
        autoClose: true,
        selectForward: true,
        applyBtnClass: "btn btn-primary",
        container: ".datepicker-container2",
        inline: true,
        singleMonth: singleMonth,
        showDateFilter: function (time, date) {
            return (
                '<div style="padding:0 5px;">\
                            <span style="">' +
                date +
                '</span></div>'
            );
        },
        beforeShowDay: function (t) {
            var month = t.getMonth();
            var day = t.getDate();
            var year = t.getFullYear();
            var date = year + '-' + month + '-' + day;

            var valid =  true; //disable saturday and sunday
            var _class = "";
            var _tooltip = "";
            return [valid, _class, _tooltip];
        },
        customOpenAnimation: function (cb) {
            $(this).fadeIn(300, cb);
        },
        customCloseAnimation: function (cb) {
            $(this).fadeOut(300, cb);
        },
    };    
    $("#bookedToDt")
        .dateRangePicker(dateRangeConfig2)
        .bind("datepicker-opened", function () {
            /* This event will be triggered after date range picker open animation */
            //$('.date-picker-wrapper').css('top', 0);
    });

    var dateRangeConfig3 = {
        singleDate: true,
        autoClose: true,
        selectForward: true,
        applyBtnClass: "btn btn-primary",
        container: ".datepicker-container3",
        inline: true,
        singleMonth: singleMonth,
        showDateFilter: function (time, date) {
            return (
                '<div style="padding:0 5px;">\
                            <span style="">' +
                date +
                '</span></div>'
            );
        },
        beforeShowDay: function (t) {
            var month = t.getMonth();
            var day = t.getDate();
            var year = t.getFullYear();
            var date = year + '-' + month + '-' + day;

            var valid =  true; //disable saturday and sunday
            var _class = "";
            var _tooltip = "";
            return [valid, _class, _tooltip];
        },
        customOpenAnimation: function (cb) {
            $(this).fadeIn(300, cb);
        },
        customCloseAnimation: function (cb) {
            $(this).fadeOut(300, cb);
        },
    };    
    $("#checkinFromDt")
        .dateRangePicker(dateRangeConfig3)
        .bind("datepicker-opened", function () {
            /* This event will be triggered after date range picker open animation */
            //$('.date-picker-wrapper').css('top', 0);
    });
    
    var dateRangeConfig4 = {
        singleDate: true,
        autoClose: true,
        selectForward: true,
        applyBtnClass: "btn btn-primary",
        container: ".datepicker-container4",
        inline: true,
        singleMonth: singleMonth,
        showDateFilter: function (time, date) {
            return (
                '<div style="padding:0 5px;">\
                            <span style="">' +
                date +
                '</span></div>'
            );
        },
        beforeShowDay: function (t) {
            var month = t.getMonth();
            var day = t.getDate();
            var year = t.getFullYear();
            var date = year + '-' + month + '-' + day;

            var valid =  true; //disable saturday and sunday
            var _class = "";
            var _tooltip = "";
            return [valid, _class, _tooltip];
        },
        customOpenAnimation: function (cb) {
            $(this).fadeIn(300, cb);
        },
        customCloseAnimation: function (cb) {
            $(this).fadeOut(300, cb);
        },
    };    
    $("#checkinToDt")
        .dateRangePicker(dateRangeConfig4)
        .bind("datepicker-opened", function () {
            /* This event will be triggered after date range picker open animation */
            //$('.date-picker-wrapper').css('top', 0);
    });

    var dateRangeConfig5 = {
        singleDate: true,
        autoClose: true,
        selectForward: true,
        applyBtnClass: "btn btn-primary",
        container: ".datepicker-container5",
        inline: true,
        singleMonth: singleMonth,
        showDateFilter: function (time, date) {
            return (
                '<div style="padding:0 5px;">\
                            <span style="">' +
                date +
                '</span></div>'
            );
        },
        beforeShowDay: function (t) {
            var month = t.getMonth();
            var day = t.getDate();
            var year = t.getFullYear();
            var date = year + '-' + month + '-' + day;

            var valid =  true; //disable saturday and sunday
            var _class = "";
            var _tooltip = "";
            return [valid, _class, _tooltip];
        },
        customOpenAnimation: function (cb) {
            $(this).fadeIn(300, cb);
        },
        customCloseAnimation: function (cb) {
            $(this).fadeOut(300, cb);
        },
    };    
    $("#checkoutFromDt")
        .dateRangePicker(dateRangeConfig5)
        .bind("datepicker-opened", function () {
            /* This event will be triggered after date range picker open animation */
            //$('.date-picker-wrapper').css('top', 0);
    });


    var dateRangeConfig6 = {
        singleDate: true,
        autoClose: true,
        selectForward: true,
        applyBtnClass: "btn btn-primary",
        container: ".datepicker-container6",
        inline: true,
        singleMonth: singleMonth,
        showDateFilter: function (time, date) {
            return (
                '<div style="padding:0 5px;">\
                            <span style="">' +
                date +
                '</span></div>'
            );
        },
        beforeShowDay: function (t) {
            var month = t.getMonth();
            var day = t.getDate();
            var year = t.getFullYear();
            var date = year + '-' + month + '-' + day;

            var valid =  true; //disable saturday and sunday
            var _class = "";
            var _tooltip = "";
            return [valid, _class, _tooltip];
        },
        customOpenAnimation: function (cb) {
            $(this).fadeIn(300, cb);
        },
        customCloseAnimation: function (cb) {
            $(this).fadeOut(300, cb);
        },
    };    
    $("#checkoutToDt")
        .dateRangePicker(dateRangeConfig6)
        .bind("datepicker-opened", function () {
            /* This event will be triggered after date range picker open animation */
            //$('.date-picker-wrapper').css('top', 0);
    });
});