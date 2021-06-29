$(document).ready(function(){

    $('#cancel').on('click', cancel);
    $('#dontCancel').on('click', dontCancel);
});

function cancel(e)
{
    var bookingId = e.currentTarget.getAttribute('data-id');
    $.ajax({
        type:'post',
        data:{bookingId:bookingId},
        url:'/cancelBooking',
        success:function(data)
        {
            window.location = '/customerBooking?id=' + bookingId;
        }
    })
}


function dontCancel()
{
    $('#cancelButton').removeClass('show');
}
