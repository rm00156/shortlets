$(document).ready(function(){

    var maxGuests = $('#maxGuests').val();

    for( var i = 1 ; i <= maxGuests; i++)
    {
        $('#guests').append('<option value =' + i + '>' + i +'</option>');
    }

    $('#placeOrder').on('click', placeOrder);
})

function placeOrder()
{
    var bookingDate = $('#bookingDate').val();
    var bookingDates = bookingDate.split(' to ');
    var fromDate = bookingDates[0];
    var toDate = bookingDates[1];
    var guests = $('#guests').val();
    console.log(guests);
    if(bookingDate == null || bookingDate == '')
    {
        $('#bookingDateError').text('No date has been set');
    }
    else
    {
        window.location = '/placeOrder?propertyId=' + $('#property').val() + '&guests=' + guests + '&fromDate=' + fromDate + 
                    '&toDate=' + toDate;
    }
}