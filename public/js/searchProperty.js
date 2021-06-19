var table;

$(document).ready(function(){

    $('#search').on('click', search);
    $('#clear').on('click', clear);
    $('#city').on('change', selectCity);

})

function clear()
{
    $('#propertyName').val('');
    $('#addressLine1').val('');
    $('#postCode').val('');
    $('#minPricePerDay').val('');
    $('#maxPricePerDay').val('');
    $('#city').val(0);
    $('#town').val(0);
}

function search(e)
{
    var propertyName = $('#propertyName').val();
    var cityId = $('#city').val();
    var townId = $('#town').val();
    var minPricePerDay = $('#minPricePerDay').val();
    var maxPricePerDay = $('#maxPricePerDay').val();
    var addressLine1 = $('#addressLine1').val();
    var postCode = $('#postCode').val();

    if(!(table == null || table == undefined))
    {
        table.destroy();
    }

    var data = {propertyName:propertyName,cityId:cityId,townId:townId,
        minPricePerDay:minPricePerDay, maxPricePerDay:maxPricePerDay, addressLine1:addressLine1,postCode:postCode};
    $.ajax({
        type:'get',
        url:'/getProperties',
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
                    $('#searchResultTable tbody').append('<tr class=\'clickable-row\' style="cursor:pointer"  data-propertyid='+ item.id + '>' + 
                    '<td style="height:150px"><img src="' + item.displayImage1   + '" style="object-fit:cover;height:100%"/></td>' +
                    '<td>'+ item.name  + '</td>' +
                    '<td>'+ (parseFloat(item.pricePerDay)).toFixed(2)  + '</td>' +    
                    '<td>'+ item.city  + '</td>' +  
                    '<td>'+ item.town  + '</td>' +
                    '<td>'+ item.postCode  + '</td>' +
                    '</tr>'); 
                }
                else
                {
                    $('#searchResultTable tr:last').after('<tr class=\'clickable-row\' style="cursor:pointer"  data-propertyid='+ item.id + '>' + 
                    '<td style="height:150px"><img src="' + item.displayImage1   + '" style="object-fit:cover;height:100%"/></td>' +
                    '<td>'+ item.name  + '</td>' +  
                    '<td>'+ (parseFloat(item.pricePerDay)).toFixed(2)  + '</td>' +  
                    '<td>'+ item.city  + '</td>' +  
                    '<td>'+ item.town  + '</td>' +
                    '<td>'+ item.postCode  + '</td>' +
                    '</tr>'); 
                }    
            }
            $(".clickable-row").click(function() {
                var propertyId = $(this).data("propertyid");
                window.location = '/adminProperty?id=' + propertyId;
            });
            table = $('#searchResultTable').DataTable();
        }

    });

}

function selectCity(e)
{
    var cityId = $('#city').val();
    console.log(cityId);
    $.ajax({
        type:'get',
        url:'/getTownsForCity',
        data:{id:cityId},
        success:function(data)
        {
                var towns = data.towns;
                $('#town').empty();
                
                for(var i = 0; i < towns.length; i++)
                {
                    var town = towns[i];
                    $('#town').append('<option value="' + town.id + '">' + town.name + '</option>')
                }
        }
    })
}