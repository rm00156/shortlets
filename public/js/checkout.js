var stripe = Stripe('pk_test_5cQWxxaMq14oogwEPGeNiiCG00naQUtjyS');
$(document).ready(function(){


    $('#checkout').on('click', checkout);
})

function checkout(e)
{
    $('#checkout').prop("disabled", true);
    var propertyId = $('#propertyId').val();
    var fromDate = $('#fromDate').val();
    var toDate = $('#toDate').val();
    var totalCost = e.currentTarget.getAttribute('data-total');
    var guests = e.currentTarget.getAttribute('data-guests');
    var nights = $('#dayDiff').val();
    var data = {propertyId:propertyId,fromDate:fromDate,toDate:toDate,totalCost:totalCost,guests:guests,nights:nights};
    var url = window.location.host;
    var href = window.location.href;
    var data = {propertyId:propertyId,fromDate:fromDate,toDate:toDate,totalCost:totalCost,guests:guests,nights:nights,url:url};
    console.log(url)
    if(href.includes('https') || href.includes('localhost'))
    {
        $.ajax({
            type:'post',
            url:'/stripeCheckout',
            data:data,
            success:function(data)
            {
                console.log(data.session);
                stripe.redirectToCheckout({
                    // Make the id field from the Checkout Session creation API response
                    // available to this file, so you can provide it as parameter here
                    // instead of the {{CHECKOUT_SESSION_ID}} placeholder.
                    sessionId: data.session.id
                }).then(function (result) {
                    // If `redirectToCheckout` fails due to a browser or network
                    // error, display the localized error message to your customer
                    // using `result.error.message`.
    
                    console.log(result)
                });
            }
        })
    }
    else
    {
        $('#checkout').prop("disabled", false);
    }
}