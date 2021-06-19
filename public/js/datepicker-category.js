/**
 * Directory – Directory & Listing Bootstrap Theme v. 2.0.0
 * Homepage: https://themes.getbootstrap.com/product/directory-directory-listing-bootstrap-4-theme/
 * Copyright 2021, Bootstrapious - https://bootstrapious.com
 */

"use strict";

$(function () {
    var singleMonth = false;
    if ($(window).width() < 668) {
        singleMonth = true;
    }

    var dateRangeConfig = {
        autoClose: true,
        startDate: new Date(),
        selectForward: true,
        applyBtnClass: "btn btn-primary",
        container: ".datepicker-container",
        inline: true,
        singleMonth: singleMonth,
        showDateFilter: function (time, date) {
            return (
                '<div style="padding:5px;">\
                            <span style="">' +
                date +
                "</span>\
                        </div>"
            );
        },
        beforeShowDay: function (t) {
            var valid = true; //disable saturday and sunday
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
    $("#bookingDate").dateRangePicker(dateRangeConfig);
});
