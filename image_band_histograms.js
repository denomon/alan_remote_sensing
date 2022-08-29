
//Image Band Histograms


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
// =========
// Functions 
// =========

/**
 * Calculate and add NDVI band to Landsat 8 image
 * @param  {ee.Image} image - Landsat 8 image
 * @return {ee.Image}       - Landsat 8 image with NDVI band added
 */
var add_ndvi = function(image) {
  var ndvi = image.normalizedDifference(['B5', 'B4']).rename('NDVI');
  return image.addBands(ndvi);
};

/**
 * Calculate and add NDWI band to Landsat 8 image
 * @param  {ee.Image} image - Landsat 8 image
 * @return {ee.Image}       - Landsat 8 image with NDWI band added
 */
var add_ndwi = function(image) {
  var ndvi = image.normalizedDifference(['B3', 'B5']).rename('NDWI');
  return image.addBands(ndvi);
};



// =================================
// Data Acquisition and Prerocessing
// =================================

// Get least cloudy image and clip to AOI
var vermont_l8 = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
  .filterDate('2018-06-01', '2020-08-30')
  .filterBounds(kingsmillReservoir)
  .sort('CLOUD_COVER')
  .first()
  .clip(kingsmillReservoir);

// Add NDVI and NDWI band
vermont_l8 = add_ndwi(add_ndvi(vermont_l8));
print('Landsat 8:', vermont_l8);

// Create histograms 
// B1
var histogram_b1 = ui.Chart.image.histogram({
  image: vermont_l8.select('B1'),
  region: kingsmillReservoir,
  scale: 30,
  minBucketWidth: 50
});
histogram_b1.setOptions({
  title: 'B1'
});

// B2
var histogram_b2 = ui.Chart.image.histogram({
  image: vermont_l8.select('B2'),
  region: kingsmillReservoir,
  scale: 30,
  minBucketWidth: 50
});
histogram_b2.setOptions({
  title: 'B2'
});

// B3
var histogram_b3 = ui.Chart.image.histogram({
  image: vermont_l8.select('B3'),
  region: kingsmillReservoir,
  scale: 30,
  minBucketWidth: 50
});
histogram_b3.setOptions({
  title: 'B3'
});

// B4
var histogram_b4 = ui.Chart.image.histogram({
  image: vermont_l8.select('B4'),
  region: kingsmillReservoir,
  scale: 30,
  minBucketWidth: 50
});
histogram_b4.setOptions({
  title: 'B4'
});

// B5
var histogram_b5 = ui.Chart.image.histogram({
  image: vermont_l8.select('B5'),
  region: kingsmillReservoir,
  scale: 30,
  minBucketWidth: 50
});
histogram_b5.setOptions({
  title: 'B5'
});

// B6
var histogram_b6 = ui.Chart.image.histogram({
  image: vermont_l8.select('B6'),
  region: kingsmillReservoir,
  scale: 30,
  minBucketWidth: 50
});
histogram_b6.setOptions({
  title: 'B6'
});

// B7
var histogram_b7 = ui.Chart.image.histogram({
  image: vermont_l8.select('B7'),
  region: kingsmillReservoir,
  scale: 30,
  minBucketWidth: 50
});
histogram_b7.setOptions({
  title: 'B7'
});

// B10
var histogram_b10 = ui.Chart.image.histogram({
  image: vermont_l8.select('B10'),
  region: kingsmillReservoir,
  scale: 30,
});
histogram_b10.setOptions({
  title: 'Histogram of B10'
});

// B11
var histogram_b11 = ui.Chart.image.histogram({
  image: vermont_l8.select('B11'),
  region: kingsmillReservoir,
  scale: 30,
});
histogram_b11.setOptions({
  title: 'B11'
});

// SR Aerosol
var histogram_sr_aerosol = ui.Chart.image.histogram({
  image: vermont_l8.select('sr_aerosol'),
  region: kingsmillReservoir,
  scale: 30,
});
histogram_sr_aerosol.setOptions({
  title: 'SR Aerosol'
});

// Pixel QA
var histogram_pixel_qa = ui.Chart.image.histogram({
  image: vermont_l8.select('pixel_qa'),
  region: kingsmillReservoir,
  scale: 30,
});
histogram_pixel_qa.setOptions({
  title: 'Pixel QA'
});

// Radsat QA
var histogram_radsat_qa = ui.Chart.image.histogram({
  image: vermont_l8.select('radsat_qa'),
  region: kingsmillReservoir,
  scale: 30,
});
histogram_radsat_qa.setOptions({
  title: 'Radsat QA'
});

// NDVI
var histogram_ndvi = ui.Chart.image.histogram({
  image: vermont_l8.select('NDVI'),
  region: kingsmillReservoir,
  scale: 30,
});
histogram_ndvi.setOptions({
  title: 'NDVI'
});

// NDWI
var histogram_ndwi = ui.Chart.image.histogram({
  image: vermont_l8.select('NDWI'),
  region: kingsmillReservoir,
  scale: 30,
});
histogram_ndwi.setOptions({
  title: 'NDWI'
});


// ===============
// Data Processing
// ===============

// No data processsing in this lab.


// ===============
// Data Postrocessing
// ===============

// No data postpressing in this lab.


// ==================
// Data Visualization
// ==================

// Center and zoom map
Map.setCenter(-1.2292, 53.1318, 10);

// Add RGB image to map
Map.addLayer(
  vermont_l8,
  {'bands': ['B4', 'B3', 'B2'], min: 0, max: 1500}, 
  'Landsat 8 - RGB - July 6, 2020'
);

// Add NDVI to map
Map.addLayer(
  vermont_l8,
  {'bands': ['NDVI'], palette: ['blue', 'white', 'green'], min: -1, max: 1}, 
  'Landsat 8 - NDVI - July 6, 2020',
  false
);

// Add NDWI to map
Map.addLayer(
  vermont_l8,
  {'bands': ['NDWI'], palette: ['00FFFF', '0000FF'], min: -1, max: 1}, 
  'Landsat 8 - NDWI - July 6, 2020',
  false
);


// Add histograms to Console
print(histogram_b1);
print(histogram_b2);
print(histogram_b3);
print(histogram_b4);
print(histogram_b5);
print(histogram_b6);
print(histogram_b7);
print(histogram_b10);
print(histogram_b11);
print(histogram_sr_aerosol);
print(histogram_pixel_qa);
print(histogram_radsat_qa);
print(histogram_ndvi);
print(histogram_ndwi);


