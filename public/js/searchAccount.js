var table;

$(document).ready(function(){

    $('#search').on('click', search);
    $('#clear').on('click', clear);
})

function clear()
{
    $('#accountType').val(0);
    $('#fromDt').val('');
    $('#toDt').val('');
    $('#email').val('');
}

function search(e)
{
    var accountType = $('#accountType').val();
    var fromDt = $('#fromDt').val();
    var toDt = $('#toDt').val();
    var email = $('#email').val();

    if(!(table == null || table == undefined))
    {
        table.destroy();
    }

    var data = {accountType:accountType,fromDt:fromDt,
            toDt:toDt, email:email};
    $.ajax({
        type:'get',
        url:'/getAccounts',
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
                    $('#searchResultTable tbody').append('<tr class=\'clickable-row\' style="cursor:pointer"  data-accountid='+ item.id + '>' + 
                    '<td>'+ item.email + '</td>' +  
                    '<td>'+ item.type  + '</td>' +  
                    '<td>'+ item.createdDttm  + '</td>' +
                    '<td>'+ (item.deleteFl == true ? 'Closed' : 'Active')  + '</td>' +
                    '</tr>'); 
                }
                else
                {
                    $('#searchResultTable tr:last').after('<tr class=\'clickable-row\' style="cursor:pointer"  data-accountid='+ item.id + '>' + 
                    '<td>'+ item.email + '</td>' +  
                    '<td>'+ item.type  + '</td>' +  
                    '<td>'+ item.createdDttm  + '</td>' +
                    '<td>'+ (item.deleteFl == true ? 'Closed' : 'Active')  + '</td>' +
                    '</tr>'); 
                }    
            }
            $(".clickable-row").click(function() {
                var accountid = $(this).data("accountid");
                window.location = '/adminAccount?id=' + accountid;
            });
            table = $('#searchResultTable').DataTable();
        }

    });

}