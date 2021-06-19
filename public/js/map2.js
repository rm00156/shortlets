$(document).ready(function(){

    var longitude = $('#longitude').val();
    var latitude = $('#latitude').val();
    // createDetailMap({
    //     mapId: 'detailSideMap',
    //     mapZoom: 18,
    //     mapCenter: [latitude,longitude],
    //     markerShow: true,
    //     markerPosition: [latitude,longitude],
    //     markerPath: 'img/marker.svg',
    //     });
    createDetailMap({
        mapId: 'detailMap',
        mapZoom: 14,
        mapCenter: [latitude,longitude],
        circleShow: true,
        circlePosition: [latitude,longitude]
        })
})