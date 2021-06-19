$(document).ready(function(){
    $('#closeAccount').on('click',closeAccount);
    $('#cancelClose').on('click',cancelClose);
    $('#close').on('click',close);
});

function closeAccount()
{
    $('#overlay').css('display','block');
}

function cancelClose()
{
    $('#overlay').css('display','none');
}

function close()
{
    $('#preloader2').css('display','block');
    $('.loader2').css('display','block');
    $.ajax({
        type:'post',
        url:'/closeAccount',
        success:function()
        {
            window.location = '/';
        }
    })
}
