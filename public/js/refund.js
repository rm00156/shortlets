var refundAmount;
$(document).ready(function(){
    
    $('#refundType').on('change',selectRefundType);
    $('#refundAmount').on('change',refundAmount);

    $('#refund').on('click',refund);
    $('#cancel').on('click',cancel);
    // $('#cancel').on('click',cancel);
    refundAmount = 0;
});

function cancel()
{
    $('#refundButton').removeClass('show');
}

function refundOrder()
{
    $('#refundError').text('');
    $('#overlay2').css('display','block');
}


function selectRefundType(e)
{
    var refundType = $('#refundType option:selected').text();

    if(refundType == 'Partial Refund')
    {
        $('#partial').css('display','');
        $('#totalRefund').css('display','none');
        refundAmount = $('#refundAmount').val();
    }
    else
    {
        $('#totalRefund').css('display','');
        $('#partial').css('display','none');
        refundAmount = $('#refundAmount2').text();
    }  
}

function refund(e)
{
    $('#refundError').text("");
    if(refundAmount == 0 || refundAmount == '' || isNaN(refundAmount))
        return $('#refundError').text("Refund amount must be set and can't be 0 or contain letters");
    
    var refundType = $('#refundType').val();
    var bookingId = e.currentTarget.getAttribute('data-id');
    var data = {refundAmount:refundAmount,refundType:refundType,bookingId:bookingId};
    
    $.ajax({
        type:'post',
        url:'/refund',
        data:data,
        success:function(data)
        {
            var err = data.err;
            if(err)
            {
                $('#refundError').text(err);
            }
            else
            {
                window.location = '/booking?id=' + bookingId;
            }
        }
    })
}

function refundAmount()
{
    refundAmount = parseFloat($('#refundAmount').val());
    var totalAmount = parseFloat($('#totalAmount').val());
    console.log(refundAmount)
    console.log(totalAmount)
    if(refundAmount > totalAmount)
        $('#refundAmount').val(totalAmount);
    
    if(refundAmount < 0)
        $('#refundAmount').val(0);
        console.log(refundAmount)

}