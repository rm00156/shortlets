$(document).ready(function(){

	"use strict";

    

        /*==================================

* Author        : "ThemeSine"

* Template Name : Travel HTML Template

* Version       : 1.0

==================================== */


        /*=========== TABLE OF CONTENTS ===========

1. Scroll To Top
2. Range js
3. Countdown timer
4. owl carousel
5. datepicker
6. Smooth Scroll spy
7. Animation support
======================================*/
    

    // 1. Scroll To Top 

		$(window).on('scroll',function () {

			if ($(this).scrollTop() > 600) {

				$('.return-to-top').fadeIn();

			} else {

				$('.return-to-top').fadeOut();

			}

		});

		$('.return-to-top').on('click',function(){

				$('html, body').animate({

				scrollTop: 0

			}, 1500);

			return false;

		});

    // 2. range js
        
        $( "#slider-range" ).slider({
            range: true,
            min: 0,
            max: 12000,
            values: [ 2677, 9241 ],
            slide: function( event, ui ) {
            $( "#amount" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
            }
        });
        $( "#amount" ).val( "$" + $( "#slider-range" ).slider( "values", 0 ) +
        " - $" + $( "#slider-range" ).slider( "values", 1 ) );
        
        
        // Quantity Buttons Shop
    
        $(".qtyplus").on("click", function(){
        var b = $(this).parents(".quantity-form").find("input.qty"),
                c = parseInt(b.val(), 10) + 1,
                d = parseInt(b.attr("max"), 10);
            d || (d = 9999999999), c <= d && (b.val(c), b.change())
        });
        $(".qtyminus").on("click", function(){
            var b = $(this).parents(".quantity-form").find("input.qty"),
                c = parseInt(b.val(), 10) - 1,
                d = parseInt(b.attr("min"), 10);
            d || (d = 1), c >= d && (b.val(c), b.change())
        });


    // 3.Countdown timer 
        
        function makeTimer() {

                var endTime = new Date("March 7, 2019 12:00:00 PDT");            
                var endTime = (Date.parse(endTime)) / 1000;

                var now = new Date();
                var now = (Date.parse(now) / 1000);

                var timeLeft = endTime - now;

                var days = Math.floor(timeLeft / 86400); 
                var hours = Math.floor((timeLeft - (days * 86400)) / 3600);
                var minutes = Math.floor((timeLeft - (days * 86400) - (hours * 3600 )) / 60);
                var seconds = Math.floor((timeLeft - (days * 86400) - (hours * 3600) - (minutes * 60)));

                if (hours < "10") { hours = "0" + hours; }
                if (minutes < "10") { minutes = "0" + minutes; }
                if (seconds < "10") { seconds = "0" + seconds; }

                $("#days").html(days + '<span class="camp">Days</span>');
                $("#hours").html(hours + '<span class="camp">Hour</span>');
                $("#minutes").html(minutes + '<span class="camp">Minute</span>');
                $("#seconds").html(seconds + '<span class="camp">Second</span>');       

        }
        
        setInterval(function() { makeTimer(); }, 1000);

    // 4. owl carousel
    
        // i. #testimonial-carousel
    
        
        var owl=$('#testemonial-carousel');
        owl.owlCarousel({
            items:3,
            margin:0,
            
            loop:true,
            autoplay:true,
            smartSpeed:1000,
            
            //nav:false,
            //navText:["<i class='fa fa-angle-left'></i>","<i class='fa fa-angle-right'></i>"],
            
            dots:true,
            autoplayHoverPause:true,
        
            responsiveClass:true,
                responsive:{
                    0:{
                        items:1
                    },
                    640:{
                        items:1
                    },
                    767:{
                        items:2
                    },
                    992:{
                        items:3
                    }
                }
            
            
        });

    // 5. datepicker
    var dateToday = new Date();
    var dateTomorrow = new Date();
    var endDate = new Date();
    endDate.setDate(endDate.getDate() + 90);
    var endDate2 = new Date();
    endDate2.setDate(endDate2.getDate() + 91);
    dateTomorrow.setDate(dateTomorrow.getDate() + 1);
    var tomorrowDt = dateTomorrow.getFullYear() + '-' + (dateTomorrow.getMonth() < 10 ? '0' + dateTomorrow.getMonth() : dateTomorrow.getMonth())+ '-' + (dateTomorrow.getDate() < 10 ? '0' + dateTomorrow.getDate() :dateTomorrow.getDate() );
    // var endDt = endDate.getFullYear() + '-' + (endDate.getMonth() < 10 ? '0' + endDate.getMonth() : endDate.getMonth())+ '-' + (endDate.getDate() < 10 ? '0' + endDate.getDate() :endDate.getDate() );
           
    $('[data-toggle="datepicker"]').val( (dateToday.getDate() < 10 ? '0' + dateToday.getDate() :dateToday.getDate() ) + '-' + (dateToday.getMonth() < 10 ? '0' + (dateToday.getMonth() + 1) : (dateToday.getMonth() + 1))+ '-' + dateToday.getFullYear());
    $('[data-toggle="datepicker"]').datepicker({
        format:'dd-mm-yyyy',
        date:dateToday,
        endDate:endDate,
        startDate: dateToday,
        date:dateToday,
        filter:function(date, view) {
            // console.log(new Date(date.getFullYear(),date.getMonth() , date.getDate()))
            // var dt = date.getFullYear() + '-' + (date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth())+ '-' + (date.getDate() < 10 ? '0' + date.getDate() :date.getDate() );
            
            // console.log(view)
            // if (dt == tomorrowDt) {
            //   return false; // Disable all Sundays, but still leave months/years, whose first day is a Sunday, enabled.
            // }
        }
    });
    // var dateTomorrow = new Date();
    // dateTomorrow.setDate(dateTomorrow.getDate() + 1);

    $('[data-toggle="datepicker2"]').datepicker({
        format:'dd-mm-yyyy',
        date: endDate2,
        endDate:endDate2,
        startDate: dateTomorrow,
        date:dateTomorrow
    });

    // $('[data-toggle="datepicker2"]').on('pick.datepicker', function (e) {
    //     console.log(e.date)
    //     console.log(new Date($('#fromDt').val()))
    //     if (e.date < new Date($('#fromDt').val())) {
    //         console.log('reece')
    //       e.preventDefault(); // Prevent to pick the date
    //     }
    //   });

    // 6. Smooth Scroll spy
        
        $('.header-area').sticky({
           topSpacing:0
        });
        
        //=============

        $('li.smooth-menu a').bind("click", function(event) {
            event.preventDefault();
            var anchor = $(this);
            $('html, body').stop().animate({
                scrollTop: $(anchor.attr('href')).offset().top - -1
            }, 1200,'easeInOutExpo');
        });
        
        $('body').scrollspy({
            target:'.navbar-collapse',
            offset:0
        });

    // 7.animation support

        $(window).load(function(){

            $(".about-us-txt h2").removeClass("animated fadeInUp").css({'opacity':'0'});
            $(".about-us-txt button").removeClass("animated fadeInDown").css({'opacity':'0'});
        });

        $(window).load(function(){

            $(".about-us-txt h2").addClass("animated fadeInUp").css({'opacity':'0'});
            $(".about-us-txt button").addClass("animated fadeInDown").css({'opacity':'0'});

        });
        

});	

	