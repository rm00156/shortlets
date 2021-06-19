var table;

$(document).ready(function(){

    $('#search').on('click', search);
    $('#clear').on('click', clear);
})

function clear()
{
    $('#bookingNumber').val('');
    $('#bookedFromDt').val('');
    $('#bookedToDt').val('');
    $('#checkinFromDt').val('');
    $('#checkinToDt').val('');
    $('#checkoutFromDt').val('');
    $('#checkoutToDt').val('');
    $('#status').val(0);
}

function search(e)
{
    var bookingNumber = $('#bookingNumber').val();
    var bookedFromDt = $('#bookedFromDt').val();
    var bookedToDt = $('#bookedToDt').val();
    var checkinFromDt = $('#checkinFromDt').val();
    var checkinToDt = $('#checkinToDt').val();
    var checkoutFromDt = $('#checkoutFromDt').val();
    var checkoutToDt = $('#checkoutToDt').val();
    var status = $('#status').val();

    if(!(table == null || table == undefined))
    {
        table.destroy();
    }

    var data = {
            bookingNumber:bookingNumber,
            bookedFromDt:bookedFromDt,
            bookedToDt:bookedToDt,
            checkinFromDt:checkinFromDt,
            checkinToDt:checkinToDt,
            checkoutFromDt:checkoutFromDt,
            checkinToDt:checkoutToDt,
            status:status
        };
    $.ajax({
        type:'get',
        url:'/getBookings',
        data:data,
        success:function(data)
        {
            console.log(data);
            var searchArray = data.result;
            $("#searchResultTable").find("tr:gt(0)").remove();
            for( var i = 0; i < searchArray.length; i++ )
            {
                var item = searchArray[i];
                    
                if(i== 0)
                {
                    $('#searchResultTable tbody').append('<tr class=\'clickable-row\' style="cursor:pointer"  data-bookingid='+ item.id +'>' + 
                    '<td>'+ item.customerName + '</td>' +  
                    '<td>'+ item.checkinDt  + '</td>' +  
                    '<td>'+ item.checkoutDt  + '</td>' + 
                    '<td>'+ item.bookingDt  + '</td>' + 
                    '<td>'+ item.propertyName  + '</td>' + 
                    '<td>£'+ item.cost + '</td>' +
                    '</tr>'); 
                }
                else
                {
                    $('#searchResultTable tr:last').append('<tr class=\'clickable-row\' style="cursor:pointer"  data-bookingid='+ item.id +'>' + 
                    '<td>'+ item.customerName + '</td>' +  
                    '<td>'+ item.checkinDt  + '</td>' +  
                    '<td>'+ item.checkoutDt  + '</td>' + 
                    '<td>'+ item.bookingDt  + '</td>' + 
                    '<td>'+ item.propertyName  + '</td>' + 
                    '<td>£'+ item.cost + '</td>' +
                    '</tr>'); 
                }    
            }
            $(".clickable-row").click(function() {
                var bookingid = $(this).data("bookingid");
                window.location = '/booking?id=' + bookingid;
            });
            table = $('#searchResultTable').DataTable();
        }

    });

}