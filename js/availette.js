!function(global) {
    'use strict';
 
    // Wrapper function that allows us to pass it to define later
    var wrap = function($) {
 
        $.fn.availette = function (config) {
            var elem = this,
                currMonth = new Date(),
                busyDates = [];
                
            if (!config || !config.googleCalendarUrl) throw "googleCalendarUrl config property must be specified.";
            config.googleCalendarUrl.replace('/basic', '/full');

            $(elem).addClass('availette calendar clearfix')
                .empty()
                .append('<header><a href="javascript:void(0);" class="pull-left previous month"><i class="icon-arrow-left"></i></a><time datetime=\'\'></time><a class=\'next month pull-right\'><i class="icon-arrow-right"></i></a></header>')
                .append('<ul class=\'days head clearfix\'><li>s</li><li>m</li><li>t</li><li>w</li><li>t</li><li>f</li><li>s</li></ul')
                .append('<ul class=\'days body clearfix\'></ul');

            function fetchBusyDates(month) {
                var monthMoment = moment(month);
        
                $.ajax({
                    url: config.googleCalendarUrl,
                    data: {
                        alt: 'json',
                        'start-min': monthMoment.startOf('month').format(),
                        'start-max': monthMoment.endOf('month').format()
                    },
                    success: function(r){
                        if(r.feed && r.feed.entry) {
                            $.each(r.feed.entry, function() {
                                var currMoment = moment(this['gd$when'][0].startTime),
                                    endMoment = moment(this['gd$when'][0].endTime);
                                while(!currMoment.isSame(endMoment)) {
                                    $('#'+currMoment.format('YYYY-MM-DD')).removeClass('free').addClass('busy');
                                    currMoment.add('d',1);
                                }    
                            });
                        }
                    },
                    error: function() {
                        if(console && console.log) { console.log('Google calendar url returned bad response.') }
                    }
                });
            }
    
            function redraw(month) {
                month.setDate(1);
        
                var firstDayOfMonth = month.getDay(),
                    monthMoment = moment(month),
                    dowI = firstDayOfMonth,
                    day,
                    li;
            
                fetchBusyDates(month);
            
                //Set month header
                $(elem).find('header time').text(monthMoment.format('MMMM YYYY'));
        
                //Clear existing
                $(elem).find('ul.days.body').empty();
        
                //Populate 
                for(var i = 1; i<= monthMoment.daysInMonth(); i++) {
                    dowI += dowI == 6 ? -6 : 1;
                    day = (i<=9?('0'+i):i);
            
                    li = $('<li id="'+monthMoment.format('YYYY-MM-'+day)+'" class="dow'+dowI+'">'+day+'</li>');
            
                    if(i == 1 && firstDayOfMonth != 0) {
                        li.addClass('offset'+firstDayOfMonth);
                    }                                         
            
                    //set availability
                    li.addClass('free');
            
                    $(elem).find('ul.days.body').append(li);
                }
            }
    
            //Event handlers
            $(elem).find('a.month').click(function(){
                if($(this).hasClass('previous')) {
                    currMonth.setMonth(currMonth.getMonth() - 1);
                }else {
                    currMonth.setMonth(currMonth.getMonth() + 1);
                }
        
                redraw(currMonth);
            });
    
            //First render
            redraw(currMonth);

        }
    };
 
    // Check for the presence of an AMD loader and if so pass the wrap function to define
    // We can safely assume 'jquery' is the module name as it is a named module already - http://goo.gl/PWyOV
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], wrap);
    } else {
        // Otherwise we assume jQuery was loaded the old fashioned way and just pass the jQuery object to wrap
        wrap(global.jQuery);
    }
}(this);














