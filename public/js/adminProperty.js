var jobs = {};
var numberOfSelectedPictures;
var removePicture2 = false;
var removePicture3 = false;
var removePicture4 = false;
var removePicture5 = false;
var removePicture6 = false;
var removePicture7 = false;
var removePicture8 = false;


var picture1Change = false;
var picture2Change = false;
var picture3Change = false;
var picture4Change = false;
var picture5Change = false;
var picture6Change = false;
var picture7Change = false;
var picture8Change = false;

var property;
var count = 0;
var propertyAmenitiesMap;
var propertyId;
$(document).ready(function(){
    property = JSON.parse($('#property').val());
    $('#city').on('change', selectCity);
    var currentCityId = $('#currentCityId').val();
    $('#city').val(currentCityId);
    $('#city').change();
    
   
    var hide = property.deleteFl;
    console.log(hide)
    if(hide == 1)
        $('#hide').prop("checked",true);
    
    $('#removeDisplayImage2').on('click', removePic);
    $('#removeDisplayImage3').on('click', removePic);
    $('#removeDisplayImage4').on('click', removePic);
    $('#removeDisplayImage5').on('click', removePic);
    $('#removeDisplayImage6').on('click', removePic);
    $('#removeDisplayImage7').on('click', removePic);
    $('#removeDisplayImage8').on('click', removePic);

    $('#picture1').on('change',picture);
    $('#picture2').on('change',picture);
    $('#picture3').on('change',picture);
    $('#picture4').on('change',picture);
    $('#picture5').on('change',picture);
    $('#picture6').on('change',picture);
    $('#picture7').on('change',picture);
    $('#picture8').on('change',picture);

    $('#editProperty').on('click', editProperty);
    $('#availability').on('click', availability);
    $('#newRow').on('click', addRow);
    $('.remove').on('click', removeSync);
    $('#exportCalendar').on('click', exportCalendar);
    $('#closeExport').on('click', closeExport);

    propertyAmenity();
    setInterval(updateJobs, 1000);
});

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

function isPropertyAmenitiesChanged()
{

    var noOfAmenites = $('#noAmenities').val();

    for(var j = 0; j < noOfAmenites; j++ )
    {
        var amenity = $('#amenity' + j);
        var id = amenity.data('id');

        if(amenity.is('checked') != propertyAmenitiesMap.get(id))
            return true;
    }

    return false;
}

function propertyAmenity()
{
    var propertyAmenities = JSON.parse($('#propertyAmenities').val());
    propertyAmenitiesMap = new Map();
    console.log(propertyAmenities)
    for(var i = 0; i < propertyAmenities.length; i++)
    {
        var propertyAmenity = propertyAmenities[i];
        propertyAmenitiesMap.set(propertyAmenity.amenityFk,propertyAmenity.checkedFl == 1);
    }

    var noOfAmenites = $('#noAmenities').val();

    for(var j = 0; j < noOfAmenites; j++ )
    {
        var amenity = $('#amenity' + j);
        var id = amenity.data('id');

        amenity.prop('checked', propertyAmenitiesMap.get(id));
    }
}

function closeExport()
{
    $('#overlay2').css('display','none');
}

function exportCalendar()
{
    $('#overlay2').css('display','block');
}

function removeSync(e)
{
    var syncId = e.currentTarget.getAttribute('data-remove-id');
    console.log(syncId)
    $.ajax({
        url:'/removeSync',
        type:'post',
        data:{id:syncId},
        success:function(data)
        {
            window.location = '/adminProperty?id=' + property.id+"&success=true";
        }
    })
}

async function validateCalendarSync()
{
    var valid = true;
    var skipCount = 0;
    for(var i = 0; i < count; i++)
    {
        var syncName = $('#syncName' + i).val();
        var syncUrl = $('#syncUrl' + i).val();
        $('#syncNameError' + i).text("");
        $('#syncUrlError' + i).text("");

        if(syncName == "" && syncUrl == "")
        {
            skipCount++;
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
    

        await $.ajax({
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

    if(skipCount == count && count != 0)
        return false;
    return valid;
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

            console.log(property.townId)
            $('#town').val(property.townId);
            $('.selectpicker').selectpicker('refresh');
            // $('#town').change();
        }
    })
}

function availability()
{
    window.location = '/propertyAvailability?id='+property.id;
}

function removePic(e)
{
    var index = e.currentTarget.getAttribute('data-index');
    var removePrefix = "removeDisplayImage";
    var picturePrefix = "displayImage";
    if(index == 2)
    {
        removePicture2 = true;
        picture2Change = true;
    }
    else if(index == 3)
    {
        removePicture3 = true;
        picture3Change = true;
    }
    else if(index == 4)
    {
        removePicture4 = true;
        picture4Change = true;
    }
    else if(index == 5)
    {
        removePicture5 = true;
        picture5Change = true;
    }
    else if(index == 6)
    {
        removePicture6 = true;
        picture6Change = true;
    }
    else if(index == 7)
    {
        removePicture7 = true;
        picture7Change = true;
    }
    else if(index == 8)
    {
        removePicture8 = true;
        picture8Change = true;
    }

    var message = "Add Image " + index;
    $('#picArea' + index).empty();
    $('#picArea' + index).append('<div class="dz-message text-muted"><p>' + message +'</p></div>');
    $('#' + removePrefix + index).css('display','none');
    $('#' + picturePrefix + index).css('display','none');
    $('#' + picturePrefix + index).removeAttr('src');
    $('#picture' + index + 'Error').text('');

}

function picture(e)
{
    $('#picture1Error').text('');
    $('#picture2Error').text('');
    $('#picture3Error').text('');
    $('#picture4Error').text('');
    $('#picture5Error').text('');
    $('#picture6Error').text('');
    $('#picture7Error').text('');
    $('#picture8Error').text('');
    var reader = new FileReader();
    var index = e.currentTarget.getAttribute('data-index');
    var removePrefix = "removeDisplayImage";

    if($('#picture' + index).prop('files').length > 0)
    {
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
        // $('#picture' + index + 'Error').text('File Selected');
        
        if(index != 1)
        {
            $('#' + removePrefix + index).css('display','');
            
            if(index == 2)
            {
                removePicture2 = false;
                picture2Change = true;
            }
            else if(index == 3)
            {
                removePicture3 = false;
                picture3Change = true;
            }
            else if(index == 4)
            {
                removePicture4 = false;
                picture4Change = true;
            }
            else if(index == 5)
            {
                removePicture5 = false;
                picture5Change = true;
            }
            else if(index == 6)
            {
                removePicture6 = false;
                picture6Change = true;
            }
            else if(index == 7)
            {
                removePicture7 = false;
                picture7Change = true;
            }
            else if(index == 8)
            {
                removePicture8 = false;
                picture8Change = true;
            }

            $('#removeDisplayImage' + index).css('display','');
        
        }
        else
        {
            picture1Change = true;
        }
    }
}

async function editProperty()
{
    $('#overlay').css('display','block');
    $('#progressBar').css('display','');
    var validCalendarSync = await validateCalendarSync();
    console.log('reece ' + validCalendarSync);
    var propertyName = $('#propertyName').val();
    var pricePerDay = $('#pricePerDay').val();
    var description = $('#description').val();
    var property =  JSON.parse($('#property').val());
    propertyId = property.id;
    var bedrooms = $('#bedrooms').val();
    var beds = $('#beds').val();
    var bathrooms = $('#bathrooms').val();
    var guests = $('#guests').val();
    var advanceNotice = $('#advanceNotice').val();
    var addressLine1 = $('#addressLine1').val();
    var addressLine2 = $('#addressLine2').val();
    var cityId = $('#city').val();
    var townId = $('#town').val();
    var postCode = $('#postCode').val();
    var isAmenitiesChanged = isPropertyAmenitiesChanged();
    var noChange = propertyName == property.name && pricePerDay == parseFloat((property.pricePerDay)).toFixed(2) && description == property.description 
                && bedrooms == property.bedrooms && bathrooms == property.bathrooms && guests == property.guests && beds == property.beds && advanceNotice == property.advanceNotice
                && addressLine1 == property.addressLine1 && (addressLine2 == property.addressLine2 || (addressLine2 == '' && property.addressLine2 == null))
                && postCode == property.postCode && townId == property.townId
                && cityId == property.cityId && property.deleteFl == $('#hide').is(':checked') && picture1Change == false 
                && picture2Change == false && picture3Change == false && picture4Change == false  && picture5Change == false 
                && picture6Change == false  && picture7Change == false  && picture8Change == false && count == 0 && !isAmenitiesChanged;

    if( ( propertyName == '' || pricePerDay == '' || isNaN(pricePerDay) || bedrooms < 1 || bathrooms < 1  || 
            guests < 1 || beds < 1 || advanceNotice < 0 || addressLine1 == '' || cityId == 0 || townId == null || postCode == '' ) || noChange == true || !validCalendarSync )
    {
        
        $('#overlay').css('display','none');
        $('#progressBar').css('display','none');
        console.log('error');
        if(propertyName == '')
        {
            $('#propertyNameError').text('Property name can not be empty');
            location.href = "#propertyName";
            console.log('name');
        }
        
        if(pricePerDay == '')
        {
            $('#pricePerDayError').text('Price Per Day can not be empty');
            location.href = "#pricePerDay";
            console.log('price');
        }

        // console.log(pricePerDay)
        if(isNaN(pricePerDay))
        {
            $('#pricePerDayError').text('Please add a valid number, do not include commas');
            location.href = "#pricePerDay";
            console.log('priceNAn');
        }

        if(bedrooms < 1)
        {
            $('#bedroomError').text('No bedroom has been selected');
            location.href = "#bedrooms";
            console.log('bedrooms');
        }

        if(beds < 1)
        {
            $('#bedsError').text('No beds has been selected');
            location.href = "#beds";
            console.log('beds');
        }

        if(advanceNotice < 1)
        {
            $('#advanceNoticeError').text('Advance Notice must be a positive value');
            location.href = "#advanceNotice";
            console.log('advanceNotice');
        }

        if(bathrooms < 1)
        {
            $('#bathroomError').text('No bathroom has been selected');
            location.href = "#bathrooms";
            console.log('bathrooms');
        }

        if(guests < 1)
        {
            $('#guestError').text('No guests has been selected');
            location.href = "#guests";
            console.log('guests');
        }

        if(addressLine1 == '')
        {
            $('#addressLine1Error').text('Address Line 1 can not be empty, and must be atleast 3 characters in length.');
            location.href = "#addressLine1";
            console.log('addressline1');
        }

        if(cityId == 0)
        {
            $('#cityError').text('No city has been selected');
            location.href = "#cityError";
            console.log('cityId');
        }

        if(townId == null)
        {
            $('#townError').text('No town has been selected');
            location.href = "#townError";
            console.log('town');
        }

        if(postCode == '')
        {
            $('#postCodeError').text('No postCode has been set');
            location.href = "#postCodeError";
            console.log('postCode');
        }

        if(description == '')
        {
            $('#descriptionError').text('No description has been set');
            location.href = "#descriptionError";
            console.log('desciption');
        }

        if(noChange == true)
        {
            $('#noChangeError').text('No changes have been made');
            console.log('no change');
        }
        
        $('#editProperty').css('disabled','');
       
    }
    else
    {
        var data = new FormData();
        var request = new XMLHttpRequest();
        request.responseType = 'json';
        
        numberOfSelectedPictures = 0;
        if(picture1Change == true)
        {
            data.append('picture1', $('#picture1').prop('files')[0]);
            numberOfSelectedPictures++;
        }

        if(picture2Change == true)
        {
            if(removePicture2 == true)
                data.append('removePicture2',true);
            else
            {
                data.append('picture2', $('#picture2').prop('files')[0]);
                numberOfSelectedPictures++;
            }
        }

        if(picture3Change == true)
        {
            if(removePicture3 == true)
                data.append('removePicture3',true);
            else
            {
                data.append('picture3', $('#picture3').prop('files')[0]);
                numberOfSelectedPictures++;
            }
        }

        if(picture4Change == true)
        {
            if(removePicture4 == true)
                data.append('removePicture4',true);
            else
            {
                data.append('picture4', $('#picture4').prop('files')[0]);
                numberOfSelectedPictures++;
            }
                
        }
        if(picture5Change == true)
        {
            if(removePicture5 == true)
                data.append('removePicture5',true);
            else
            {
                data.append('picture5', $('#picture5').prop('files')[0]);
                numberOfSelectedPictures++;
            }
        }
        if(picture6Change == true)
        {
            if(removePicture6 == true)
                data.append('removePicture6',true);
            else
            {
                data.append('picture6', $('#picture6').prop('files')[0]);
                numberOfSelectedPictures++;
            }
        }
        if(picture7Change == true)
        {
            if(removePicture7 == true)
                data.append('removePicture7',true);
            else
            {
                data.append('picture7', $('#picture7').prop('files')[0]);
                numberOfSelectedPictures++;
            }
        }
        if(picture8Change == true)
        {
            if(removePicture8 == true)
                data.append('removePicture8',true);
            else
            {
                data.append('picture8', $('#picture8').prop('files')[0]);
                numberOfSelectedPictures++;
            }
        }

        for(var i = 0; i < count; i++)
        {
            var syncName = $('#syncName' + i).val();
            var syncUrl = $('#syncUrl' + i).val();

            if(syncName == "")
                continue;

            data.append('syncName' + i, syncName);
            data.append('syncUrl' + i, syncUrl);
        }

        data.append('syncCount', count);
        data.append('propertyId', property.id);
        data.append('propertyName', propertyName);
        data.append('pricePerDay',pricePerDay);
        data.append('bedrooms',bedrooms)
        data.append('bathrooms',bathrooms);
        data.append('beds',beds);
        data.append('advanceNotice',advanceNotice);
        data.append('guests',guests);
        data.append('description',description);
        data.append('addressLine1',addressLine1);
        data.append('addressLine2',$('#addressLine2').val());
        data.append('cityId', cityId);
        data.append('townId',townId);
        data.append('postCode', postCode);
        data.append('addressId',property.addressId);
        data.append('hide', $('#hide').is(':checked'));
        amenities(data);
        request.addEventListener('load', function(e){

            var data = request.response;
            console.log(data);
            var error = data.error;

            if(error)
            {
                
                $('#overlay').css('display','none');
                $('#progressBar').css('display','none');
                if(error.name)
                {
                    $('#productNameError').text(error.nAME);
                    $('#editProperty').css('disabled','');
                    location.href = "#propertyName";
                }
            }
            else
            {
                jobs[data.id] = {id: data.id, state: "queued"};
                // change to update the page
            }
        });
        console.log('editproperty')
        request.open('post','/editProperty');
        request.send(data);
    
    }
}

function updateJobs() {
    for (var id of Object.keys(jobs)) {
        var data = {id:id};

        $.ajax({
            type:'get',
            url:'/updateEditPropertyJobs',
            data:data,
            success:function(result)
            {
                if(result.process == 'editProperty')
                {
    
                  var progress = result.progress;
                  var totalSteps = 5 + numberOfSelectedPictures;
            
                  var progressAsPercentage = ((progress/totalSteps) * 100).toFixed(2);
                  console.log(progress)
                  console.log(totalSteps);
                  console.log(progressAsPercentage) 

                  $('#progress').css('width', progressAsPercentage + '%');
                //   $('#overlay').css('display','block');
                  if(progress == totalSteps)
                  {
                    var jobId = result.id;
                    window.location = '/adminProperty?id=' + propertyId + '&success=true';
                    delete jobs[jobId];
                  }
                } 
            }
        })
    }
  }
