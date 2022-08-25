
var batch = require('users/fitoprincipe/geetools:batch')

var kingsmillReservoir =
        /* color: #ff0000 */
        /* displayProperties: [
          {
            "type": "rectangle"
          }
        ] */
        ee.Geometry.Polygon(
            [[[-1.2361522857666007, 53.13414463051576],
                [-1.2361522857666007, 53.128222462032326],
                [-1.2243076507568351, 53.128222462032326],
                [-1.2243076507568351, 53.13414463051576]]], null, false);

var carsingtonWater =
     ee.Geometry.Polygon(
        [[[-1.6452855789080267, 53.07764237538199],
            [-1.6452855789080267, 53.044217712507084],
            [-1.608550044240058, 53.044217712507084],
            [-1.608550044240058, 53.07764237538199]]], null, false);

/**
 * Function to mask clouds using the Sentinel-2 QA band
 * @param {ee.Image} image Sentinel-2 image
 * @return {ee.Image} cloud masked Sentinel-2 image
 */
function maskS2clouds(image) {
    var qa = image.select('QA60');

    // Bits 10 and 11 are clouds and cirrus, respectively.
    var cloudBitMask = 1 << 10;
    var cirrusBitMask = 1 << 11;

    // Both flags should be set to zero, indicating clear conditions.
    var mask = qa.bitwiseAnd(cloudBitMask).eq(0)
        .and(qa.bitwiseAnd(cirrusBitMask).eq(0));

    return image.updateMask(mask).select('B.*').copyProperties(image, ['system:time_start'])
}
var roi = ee.FeatureCollection(kingsmillReservoir).geometry();


var dataset = ee.ImageCollection('COPERNICUS/S2_SR')
    .filterDate('2017-07-30', '2022-05-01')
    // Pre-filter to get less cloudy granules.
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 2))
    .filterBounds(kingsmillReservoir)
    .map(maskS2clouds);
// .map(function(image){return image.clip(geometry3)});


var sentine2Visualization = {
    min: 0,
    max: 3000,
    bands: ['B4', 'B3', 'B2'],
};

Map.addLayer(dataset, sentine2Visualization, 'sentinel-2 cloud masked imagery');

Map.setCenter(-1.2292, 53.1318, 14);


//Time series

var dataset = dataset.map(function(img) {
    var doy = ee.Date(img.get('system:time_start')).getRelative('day', 'year');
    return img.set('doy', doy);
});

var distinctDOY = dataset.filterDate('2017-07-30', '2022-05-01');

// Define a filter that identifies which images from the complete collection
// match the DOY from the distinct DOY collection.
var filter = ee.Filter.equals({leftField: 'doy', rightField: 'doy'});

// Define a join.
var join = ee.Join.saveAll('doy_matches');

// Apply the join and convert the resulting FeatureCollection to an
// ImageCollection.
var joinCol = ee.ImageCollection(join.apply(distinctDOY, dataset, filter)).map(maskS2clouds);

// Apply median reduction among matching DOY collections.
var comp = joinCol.map(function(img) {
    var doyCol = ee.ImageCollection.fromImages(
        img.get('doy_matches')
    );
    return doyCol.reduce(ee.Reducer.median());
});

// Define RGB visualization parameters.
var visParams = {
    min: 0,
    max: 3000,
    bands: ['B4_median', 'B3_median', 'B2_median']

};


// Create RGB visualization images for use as animation frames.
var rgbVis = comp.map(function(img) {
    return img.visualize(visParams).clip(roi);
});

// Define GIF visualization parameters.
var gifParams = {
    'region': roi,
    'dimensions': 600,
    'crs': 'EPSG:4326',
    'framesPerSecond': 10
};

// Print the GIF URL to the console.
print(rgbVis.getVideoThumbURL(gifParams));

// Render the GIF animation in the console.
print(ui.Thumbnail(rgbVis, gifParams));





var s2Reservour = dataset.filterBounds(geometry);
print(s2Reservour);



//Add NDVI band to sentinel-2 image

var addNDVI = function(image) {
    var ndvi = image.normalizedDifference(['B8','B4']).rename('NDVI');
    return image.addBands(ndvi);
}

//map NDVI over image collection
var reservourNDVI = dataset.map(addNDVI);

// // var batch = require('users/fitoprincipe/geetools:batch');
// // Map.centerObject(Reservour,6)
// batch.Download.ImageCollection.toDrive(rgbVis, "test", {region:geometry, crs: 'EPSG:32630'});


//charting NDVI over time at the reservour
var chart = ui.Chart.image.series(reservourNDVI.select('NDVI'),geometry);

//chart options
var chartOPtions = {
    title:' Sentinel2 NDVI ranges (Kingsmill Reservoir)',
    hAxis:{title:'Time'},
    VAxis:{title:'NDVI'},
    series:{0: {color:'green'}}
};
chart = chart.setOptions(chartOPtions);





//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//ALAN



var roi = ee.FeatureCollection(geometry).geometry();

var alaDataset = ee.ImageCollection('NOAA/VIIRS/DNB/MONTHLY_V1/VCMSLCFG')
    .filter(ee.Filter.date('2018-01-01', '2022-07-30'))
    .filterBounds(roi);




Map.setCenter(-1.2292, 53.1318, 14);


//Time series

var alaDataset = alaDataset.map(function(img) {
    var doy = ee.Date(img.get('system:time_start')).getRelative('day', 'year');
    return img.set('doy', doy);
});

var alanDistinctDOY = alaDataset.filterDate('2015-07-30', '2021-05-01');

// Define a filter that identifies which images from the complete collection
// match the DOY from the distinct DOY collection.
var alanFilter = ee.Filter.equals({leftField: 'doy', rightField: 'doy'});

// Define a join.
var alanJoin = ee.Join.saveAll('doy_matches');

// Apply the join and convert the resulting FeatureCollection to an
// ImageCollection.
var alanJoinCol = ee.ImageCollection(alanJoin.apply(alanDistinctDOY, alaDataset, alanFilter));

// Apply median reduction among matching DOY collections.
var alanComp = alanJoinCol.map(function(img) {
    var doyCol = ee.ImageCollection.fromImages(
        img.get('doy_matches')
    );
    return doyCol.reduce(ee.Reducer.median());
});

// Define RGB visualization parameters.
var alanMapVisParams = {
    min: 0.0,
    max: 60.0,
    bands: ['avg_rad'],

};

//add night time light imager
var nighttime = alaDataset.select('avg_rad');
Map.addLayer(nighttime, alanMapVisParams, 'Nighttime',false);


// Define RGB visualization parameters.
var alanVisParams = {
    min: 0.0,
    max: 60.0,
    bands: ['avg_rad_median'],

};
// Create RGB visualization images for use as animation frames.
var alanRgbVis = alanComp.map(function(img) {
    return img.visualize(alanVisParams).clip(roi);
});

// Define GIF visualization parameters.
var alanGifParams = {
    'region': roi,
    'dimensions': 600,
    'crs': 'EPSG:4326',
    'framesPerSecond': 2
};

// Print the GIF URL to the console.
print(alanRgbVis.getVideoThumbURL(alanGifParams));

// Render the GIF animation in the console.
print(ui.Thumbnail(alanRgbVis, alanGifParams));




//charting NDVI over time at the reservour
var alanChart = ui.Chart.image.series(alaDataset.select('avg_rad'),geometry);

//chart options
var alanCchartOPtions = {
    title:'Avarage Radiance (Kingsmill Reservoir)',
    hAxis:{title:'Time'},
    VAxis:{title:'NDVI'},
    series:{0: {color:'green'}}
};
alanChart = alanChart.setOptions(alanCchartOPtions);

//Print Sentinel Chart
print(chart);

//Print ALAN chart
print(alanChart);


//Combined Chart
// //NDVI featureCollection just for kingsmillReservour
//define a chart for kingsmillReservour
// var kingsmillReservourChart = ui.Chart.image.seriesByRegion(reservourNDVI,features,ee.Reducer.mean(),'NDVI',10,'system:time_start','label');
// kingsmillReservourChart = kingsmillReservourChart.setOptions(chartOPtions);
// print(kingsmillReservourChart);


