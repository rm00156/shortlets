var count = 0;
$(document).ready(function(){

    $('#city').on('change', selectCity);

    $('#picture1').on('change',picture);
    $('#picture2').on('change',picture);
    $('#picture3').on('change',picture);
    $('#picture4').on('change',picture);

    $('#addProperty').on('click', addProperty);
    $('#newRow').on('click', addRow);
    // $('.displayAddNewColor').on('click', displayAddNewColor);
    // $('#addNewColor').on('click', addNewColor);
    // $('#cancel').on('click', cancel);

});

function isAnAmenitySelected()
{
    var noAmenities = $('#noAmenities').val();

    for( var i = 0 ; i < noAmenities; i++ )
    {
        var amenity = $('#amenity' + i);
        var isChecked = amenity.is(':checked');
        if(isChecked)
        {
            return true;
        }
        
    }

    return false;
}

function amenities(data)
{
    var noAmenities = $('#noAmenities').val();

    for( var i = 0 ; i < noAmenities; i++ )
    {
        var amenity = $('#amenity' + i);
        var name = amenity.data('name');
        var isChecked = amenity.is(':checked');

        data.append(name, isChecked);
    }
}

function addRow()
{
    var syncName = 'syncName' + count;
    var syncUrl = 'syncUrl' + count;
    var syncNameError = 'syncNameError' + count;
    var syncUrlError = 'syncUrlError' + count;
    $('#calendarSyncRows').append("<div class='row'>" + 
                            "<div class='col-sm-6'><label>Name</label><input class='form-control' id="+ syncName + " required=true, name='syncName', type='text' ></input>" +
                            "<p class='small text-danger' id=" + syncNameError + "></p>"+ "</div>" +
                            "<div class='col-sm-6'><label>Url</label><input class='form-control' id=" + syncUrl + " required=true, name='synUrl', type='text' ></input>"+ 
                            "<p class='small text-danger' id=" + syncUrlError + "></p></div>" + 
                            "</div>");
                            count++;
}

async function validateCalendarSync()
{
    var valid = true;
    console.log('reece ' + count);
    for(var i = 0; i < count; i++)
    {
        var syncName = $('#syncName' + i).val();
        var syncUrl = $('#syncUrl' + i).val();
        $('#syncNameError' + i).text("");
        $('#syncUrlError' + i).text("");

        if(syncName == "" && syncUrl == "")
        {
            continue;
            // error message
        }
        else if( syncName == "")
        {
            valid = false;
            $('#syncNameError' + i).text("Name has not been set.");
        }
        else if( syncUrl == "")
        {
            valid = false;
            
            $('#syncUrlError' + i).text("Url has not been set.");
        }
    

        $.ajax({
            type:'get',
            url:'/validateCalendarSync',
            data:{url:syncUrl},
            success:function(data)
            {
                var success = data.success;

                if(!success)
                {
                    valid = false;
                    $('#syncUrlError' + i).text("Url provided is not valid.");
                }
                
                // error message
            }
        })
        
    }

    return valid;
}

async function addProperty()
{
    var validCalendarSync = await validateCalendarSync();
    $('#preloader2').css('display','block');
    $('.loader2').css('display','block');
    $('#addProduct').css('disabled','disabled');
    $('#propertyNameError').text('');
    $('#pricePerDayError').text('');
    $('#bedroomError').text('');
    $('#bathroomError').text('');
    $('#bedsError').text('');
    $('#guestError').text('');
    $('#addressLine1Error').text('');
    $('#cityError').text('');
    $('#townError').text('');
    $('#postCodeError').text('');

    $('#descriptionError').text('');
    $('#picture1Error').text('');
    // check that product name, price, category and type not null
    var propertyName = $('#propertyName').val();
    var pricePerDay = $('#pricePerDay').val();
    var bedroom = $('#bedrooms').val();
    var beds = $('#beds').val();
    var bathroom = $('#bathrooms').val();
    var guest = $('#guests').val();
    var advanceNotice = $('#advanceNotice').val();
    var picture1Fl = $('#picture1').prop('files').length == 0;
    var addressLine1 = $('#addressLine1').val();
    var cityId = $('#city').val();
    var townId = $('#town').val();
    var postCode = $('#postCode').val();
    var description = $('#description').val();
    var isAmenitySelected = isAnAmenitySelected();
    if( propertyName == '' || pricePerDay == '' || isNaN(pricePerDay) || bedroom < 1 || bathroom < 1  || beds < 1  || 
        guest < 1 || picture1Fl == true || addressLine1 == '' || cityId == 0 || townId == null ||
           postCode == '' || !validCalendarSync || !isAmenitySelected || advanceNotice < 0 )
    {
        // error
        // determine the error display the necessary message
       console.log('error');
        if(propertyName == '')
        {
            $('#propertyNameError').text('Property name can not be empty');
            location.href = "#propertyName";
        }
        
        if(pricePerDay == '')
        {
            $('#pricePerDayError').text('Price Per Day can not be empty');
            location.href = "#pricePerDay";
        }

        if(isNaN(pricePerDay))
        {
            $('#pricePerDayError').text('Please add a valid number, do not include commas');
            location.href = "#pricePerDay";
        }

        if(bedroom < 1)
        {
            $('#bedroomError').text('No bedroom has been selected');
            location.href = "#bedrooms";
        }

        if(bathroom < 1)
        {
            $('#bathroomError').text('No bathroom has been selected');
            location.href = "#bathrooms";
        }

        if(guest < 1)
        {
            $('#guestError').text('No guests has been selected');
            location.href = "#guests";
        }

        if(beds < 1)
        {
            $('#bedsError').text('No beds has been selected');
            location.href = "#beds";
        }

        if(advanceNotice < 0)
        {
            $('#advanceNoticeError').text('Advance Notice must be a positive number');
            location.href = "#advanceNotice";
        }

        if(picture1Fl == true)
        {
            $('#picture1Error').text('No Main Picture has been selected');
            location.href = "#picture1";
            
        }

        if(addressLine1 == '')
        {
            $('#addressLine1Error').text('Address Line 1 can not be empty, and must be atleast 3 characters in length.');
            location.href = "#addressLine1";
        }

        if(cityId == 0)
        {
            $('#cityError').text('No city has been selected');
            location.href = "#cityError";
        }

        if(townId == null)
        {
            $('#townError').text('No town has been selected');
            location.href = "#townError";
        }

        if(postCode == '')
        {
            $('#postCodeError').text('No postCode has been set');
            location.href = "#postCodeError";
        }

        if(description == '')
        {
            $('#descriptionError').text('No description has been set');
            location.href = "#descriptionError";
        }

        if(!isAmenitySelected)
        {
            $('#amenitiesError').text('No Amenity has been selected');
        }
        $('#addProperty').css('disabled','');
        console.log('error');
        $('#preloader2').css('display','none');
        $('.loader2').css('display','none');
    }
    else
    {
        // should be good to fire off to the server for further validation
        console.log('success');

        var data = new FormData();
        var request = new XMLHttpRequest();
        request.responseType = 'json';
        data.append('propertyName', propertyName);
        data.append('pricePerDay',pricePerDay);
        data.append('bedroom',bedroom)
        data.append('bathroom',bathroom);
        data.append('beds',beds);
        data.append('guest',guest);
        data.append('advanceNotice', advanceNotice);
        data.append('picture1',($('#picture1').prop('files'))[0]);
        data.append('picture2',($('#picture2').prop('files'))[0]);
        data.append('picture3',($('#picture3').prop('files'))[0]);
        data.append('picture4',($('#picture4').prop('files'))[0]);
        data.append('description',description);
        data.append('addressLine1',addressLine1);
        data.append('addressLine2',$('#addressLine2').val());
        data.append('cityId', cityId);
        data.append('townId',townId);
        data.append('postCode', postCode);

        for(var i = 0; i < count; i++)
        {
            var syncName = $('#syncName' + i).val();
            var syncUrl = $('#syncUrl' + i).val();

            if(syncName == "")
                continue;

            data.append('syncName' + i, syncName);
            data.append('syncUrl' + i, syncUrl);
        }

        amenities(data);

        data.append('syncCount', count);
        
        request.addEventListener('load', function(e){

            var data = request.response;
            console.log(data);
            var error = data.error;

            if(error)
            {
                if(error.propertyName)
                {
                    $('#productNameError').text(error.productName);
                    $('#addProperty').css('disabled','');
                    location.href = "#propertyName";
                }

                if(error.postCode)
                {
                    $('#postCodeError').text(error.postCode);
                    $('#addProperty').css('disabled','');
                    location.href = "#postCode";
                }

                $('#preloader2').css('display','none');
                $('.loader2').css('display','none');
            }
            else
            {
                window.location = '/addProperty?success=true';
                // change to update the page
            }
        });

        request.open('post','/addProperty');
        request.send(data);
    }
}


function picture(e)
{
    $('#picture1Error').text('');
    $('#picture2Error').text('');
    $('#picture3Error').text('');
    $('#picture4Error').text('');
    
    var reader = new FileReader();
    var index = e.currentTarget.getAttribute('data-index');
    var link = 'displayLink' + index;
    var image = 'displayImage' + index;
    $('#picArea' + index).empty();
    $('#picArea' + index).append('<a id=' + link + ' data-fancybox="gallery" title="Outside">' +
            '<img id=' + image + ' class="img-fluid"></></a>');
    reader.onload = function (e) {
        $('#displayImage' + index)
            .attr('src', e.target.result).css('display','');
        $('#displayLink' + index)
            .attr('href', e.target.result)
    };

    reader.readAsDataURL($('#picture' + index).prop('files')[0]);

    // if($('#picture1').prop('files').length > 0)
    // {
    //     $('#picture1Error').text('File Selected');
    // }

    // if($('#picture2').prop('files').length > 0)
    // {
    //     $('#picture2Error').text('File Selected');
    // }
    // if($('#picture3').prop('files').length > 0)
    // {
    //     $('#picture3Error').text('File Selected');
    // }
    // if($('#picture4').prop('files').length > 0)
    // {
    //     $('#picture4Error').text('File Selected');
    // }
    
}


function setupColorSection()
{
    for(var i = 1; i <= 3; i++)
    {
        $('#color' + i).on('change', selectColor);
    }
}

function selectColor(e)
{
    var number = e.currentTarget.getAttribute('data-number');
    $('#color' + number +'Section').css('display', $('#color' + number).val() == 0 ? 'none' : ''); 
    $('#sizeQuantitySection' + number).css('display', $('#color' + number).val() == 0 ? 'none' : ''); 
    $('#color' + number + 'Hex').css('background-color', $("#color" + number + " option:selected" ).data('hex') == undefined ? '' : $("#color" + number + " option:selected" ).data('hex'));
}

function selectCity(e)
{
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
                    $('#town').append('<option value="' + town.id + '">' + town.name + '</option>')
                }

                
            $('.selectpicker').selectpicker('refresh');
        }
    })
}

function displayAddNewColor()
{
    $('#overlay2').css('display','block');
}

function addNewColor()
{
    var newColorName = $('#newColorName').val();
    var newColor = $('#newColor').val();

    if(newColorName == '')
    {
        $('#newColorError').text('A Color Name must be set.');
    }
    else
    {
        var data = {newColorName:newColorName,newColor:newColor};
        $.ajax({
            type:'post',
            url:'/addNewColor',
            data:data,
            success:function(data)
            {
                var error = data.error;

                if(error)
                {
                    $('#newColorError').text(error);
                }
                else
                {
                    var color = data.color;
                    $('.colorSelect').append("<option value='" + color.id + "' data-hex='" + color.hexColor + "'>" +color.color + "</option>");
                    
                    console.log(data.color);
                }

                $('#overlay2').css('display', 'none');
                // return the new colors id then for the each color list append to the end so will have to define 
                // the list as class im guessing
            }
        })
    }
}

function cancel()
{
    $('#overlay2').css('display','none');
    $('#newColorName').val('');
    $('#newColorError').text('');
}