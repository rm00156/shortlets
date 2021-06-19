$(document).ready(function(){

    $('#availabiliy').on('click',availability);
    $('#backProperty').on('click',backProperty);
})

function availability()
{
    var propertyId = $('#propertyId').val();
    window.location = '/propertyAvailability?id=' + propertyId;
}

function backProperty()
{
    var propertyId = $('#propertyId').val();
    window.location = '/adminProperty?id=' + propertyId;
}