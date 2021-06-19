$(document).ready(function()
{
    $('#clear').on('click', clear);
})

function clear()
{
    console.log('helo')
    $('#name').val("");
    $('#email').val("");
    $('#fromDate').val("");
    $('#accountTypeId').val("");
    $('.selectpicker').selectpicker('refresh');
}