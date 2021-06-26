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

    var propertyAvailabilityDates = JSON.parse($('#propertyAvailabilityDates').val());
    var advanceNoticeDates = JSON.parse($('#advanceNoticeDates').val());
    console.log(propertyAvailabilityDates);
    console.log(advanceNoticeDates);
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
                '<div style="padding:0 5px;">\
                            <span style="">' +
                date +
                '</span></div>'
                //             <div class="day-subtitle">$' +
                // Math.round(Math.random() * 999) +
                // "</div>\
                //         </div>"
            );
        },
        beforeShowDay: function (t) {
            var month = t.getMonth();
            var day = t.getDate();
            var year = t.getFullYear();
            var date = year + '-' + month + '-' + day;

            var valid = advanceNoticeDates.includes(date) || propertyAvailabilityDates.includes(date) ? false : true; //disable saturday and sunday
            var _class = "";
            var _tooltip = valid ? "" : "Booked";
            return [valid, _class, _tooltip];
        },
        customOpenAnimation: function (cb) {
            $(this).fadeIn(300, cb);
        },
        customCloseAnimation: function (cb) {
            $(this).fadeOut(300, cb);
        },
    };
    $("#bookingDate")
        .dateRangePicker(dateRangeConfig)
        .bind("datepicker-opened", function () {
            /* This event will be triggered after date range picker open animation */
            //$('.date-picker-wrapper').css('top', 0);
        });
});
