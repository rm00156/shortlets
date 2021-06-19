document.addEventListener('DOMContentLoaded', function() {
    var calendarEl = document.getElementById('calendar');

    var bookings = JSON.parse($('#bookings').val());
    console.log(bookings);
    var events = new Array();
    for(var i = 0; i < bookings.length; i++)
    {
        var booking = bookings[i];
        var propertySyncFk = booking.propertySyncFk;

        var title;
        if(propertySyncFk == null)
        {
          // internal booking
          title = booking.name + ' - £' + (parseFloat(booking.cost)).toFixed(2);
        }
        else
        {
          // sync
          var status = booking.status;
          if(status == 'Successful')
            title = booking.propertySyncName;
          else if(status == 'Unavailable')
            title = 'Unavailable - ' + booking.propertySyncName; 
          else
            title = 'Unknown - ' + booking.propertySyncName;
        }

        
        var data = {
                    groupId:booking.id,
                    title:title,
                    start: new Date(booking.fromDt),
                    end: new Date(booking.toDt)
        };
        events.push(data);
        
    }
    var calendar = new FullCalendar.Calendar(calendarEl, {
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth'
      },
      initialDate: new Date(),
      navLinks: true, // can click day/week names to navigate views
      selectable: false,
      selectMirror: true,
      select: function(arg) {
        var title = prompt('Event Title:');
        if (title) {
          calendar.addEvent({
            title: title,
            start: arg.start,
            end: arg.end,
            allDay: arg.allDay
          })
        }
        calendar.unselect()
      },
      eventClick: function(arg) {
          var event = arg.event;
          console.log(event._def.groupId);
          window.location = '/booking?id=' + event._def.groupId;
        // // if (confirm('Are you sure you want to delete this event?')) {
        // //   arg.event.remove()
        // }
      },
      editable: false,
      dayMaxEvents: false, // allow "more" link when too many events
      events: events
    //   [
    //     {
    //       title: 'All Day Event',
    //       start: '2020-09-01'
    //     },
    //     {
    //       title: 'Long Event',
    //       start: '2020-09-07',
    //       end: '2020-09-10'
    //     },
    //     {
    //       groupId: 999,
    //       title: 'Repeating Event',
    //       start: '2020-09-09T16:00:00'
    //     },
    //     {
    //       groupId: 999,
    //       title: 'Repeating Event',
    //       start: '2020-09-16T16:00:00'
    //     },
    //     {
    //       title: 'Conference',
    //       start: '2020-09-11',
    //       end: '2020-09-13'
    //     },
    //     {
    //       title: 'Meeting',
    //       start: '2020-09-12T10:30:00',
    //       end: '2020-09-12T12:30:00'
    //     },
    //     {
    //       title: 'Lunch',
    //       start: '2020-09-12T12:00:00'
    //     },
    //     {
    //       title: 'Meeting',
    //       start: '2020-09-12T14:30:00'
    //     },
    //     {
    //       title: 'Happy Hour',
    //       start: '2020-09-12T17:30:00'
    //     },
    //     {
    //       title: 'Dinner',
    //       start: '2020-09-12T20:00:00'
    //     },
    //     {
    //       title: 'Birthday Party',
    //       start: '2020-09-13T07:00:00'
    //     },
    //     {
    //       title: 'Click for Google',
    //       url: 'http://google.com/',
    //       start: '2020-09-28'
    //     }
    //   ]
    });

    calendar.render();
  });