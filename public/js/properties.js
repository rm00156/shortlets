var fromDt = new Date();
var toDt;
$(document).ready(function(){

    $('#city').on('change', selectCity);
    $('#search').on('click', search);
    $('#city').val($('#cityId').val());
    
    $('.selectpicker').selectpicker('refresh');
    $('#city').change();
    $('#reset').on('click', reset);
    // $('[data-toggle="datepicker"]').on('pick.datepicker', datePicker );
    // $('[data-toggle="datepicker2"]').on('pick.datepicker', datePicker2 );
})

// function datePicker(e) {
//     fromDt = e.date;
//     // console.log(e.date)
//     // console.log(new Date($('#fromDt').val()))
//     // if (e.date < new Date($('#fromDt').val())) {
//     //     console.log('reece')
//     //   e.preventDefault(); // Prevent to pick the date
//     // }
//   }

//   function datePicker2(e) {
//     console.log(e.date)
//     console.log(fromDt)
//     if (e.date <= new Date(fromDt) || fromDt == undefined) {
//         console.log('reece')
//       e.preventDefault(); // Prevent to pick the date
//     }
//     else
//     {
//         toDt = e.date;
//     }
//   }


function reset()
{
    $('#propertyName').val("");
    $('#city').val("");
    $('#town').val("");
    $('.selectpicker').selectpicker('refresh');
    $('#city').change();
    $('#addressLine1').val("");
    $('#postCode').val("");
    
}


function selectCity(e)
{
    console.log('home')
    var cityId = $('#city').val();
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
                $('#town').append('<option value="' + town.id + '">' + town.name + '</option>').selectpicker('refresh');
            }
        }
    })
}

function search(e)
{
    
    var bookingDates = ($('#bookingDate').val());
    console.log(bookingDates)
    var bookingDatesArray = bookingDates.split(" to ");
    
    if(bookingDatesArray.length > 0)
    {
        fromDt = bookingDatesArray[0];
        toDt = bookingDatesArray[1];
    }

    $('#cityError').text('');
    var townId = $('#town').val();
    var cityId = $('#city').val();
    
    var guests = $('#guests').val();
    var bedrooms = $('#bedrooms').val();
    var bathrooms = $('#bathrooms').val();
    var beds = $('#beds').val();

    if(cityId == 0)
    {
        $('#city option:eq(0)').text('Select City *');
        $('#city').attr('style','border:0.5px solid red !important')
        // window.location = "#city";
        
    }
    else
        window.location = '/properties?townId='+townId+'&cityId='+cityId+'&fromDt='+fromDt+'&toDt='+toDt+'&guests='+guests +
            '&bathrooms=' + bathrooms + '&bedrooms=' + bedrooms + '&beds=' + beds;

}