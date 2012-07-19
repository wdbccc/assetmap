var mapStyle = [{
  stylers: [{
    saturation: -65
  }, {
    gamma: 1.52
  }]
}, {
  featureType: "administrative",
  stylers: [{
    saturation: -95
  }, {
    gamma: 2.26
  }]
}, {
  featureType: "water",
  elementType: "labels",
  stylers: [{
    visibility: "off"
  }]
}, {
  featureType: "administrative.locality",
  stylers: [{
    visibility: 'on'
  }]
}, {
  featureType: "road",
  stylers: [{
    visibility: "simplified"
  }, {
    saturation: -99
  }, {
    gamma: 2.22
  }]
}, {
  featureType: "poi",
  elementType: "labels",
  stylers: [{
    visibility: "off"
  }]
}, {
  featureType: "road.arterial",
  stylers: [{
    visibility: 'off'
  }]
}, {
  featureType: "road.local",
  elementType: "labels",
  stylers: [{
    visibility: 'off'
  }]
}, {
  featureType: "transit",
  stylers: [{
    visibility: 'off'
  }]
}, {
  featureType: "road",
  elementType: "labels",
  stylers: [{
    visibility: 'on'
  }]
}, {
  featureType: "poi",
  stylers: [{
    saturation: -55
  }]
}]
var map_options = {
  zoom: 2,
  center: new L.LatLng(55, 0),
  minZoom: 1,
  panControl: false,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  overviewMapControl: false,
  backgroundColor: '#B6DDEE',
  zoomControl: false
};
var infoWindow = null,
  cartodb_leaflet;

function CustomZoomControl(map) {
  var controlDiv = document.createElement('div');
  controlDiv.className = 'custom-zoom';
  var controlZoomIn = document.createElement('div');
  controlZoomIn.className = 'in';
  controlDiv.appendChild(controlZoomIn);
  var controlZoomOut = document.createElement('div');
  controlZoomOut.className = 'out';
  controlDiv.appendChild(controlZoomOut);
  return controlDiv;
}

function setMapPolygons(map, cases) {
  var selectedCountries = _.map(cases, function (model) {
    return model.toJSON().country_iso.toUpperCase();
  });
  var style = "#ogp_countries {";
  _.each(selectedCountries, function (value) {
    style += '[iso_a2="' + value + '"]{polygon-fill:#FFF;line-opacity:1;line-color:#CDCDCD;}';
  });
  style += "}";
  var map = new google.maps.Map(document.getElementById('map'), {
    center: new google.maps.LatLng(20, 0),
    zoom: 3,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false
  });
  map.setOptions({
    styles: mapStyle
  });
  var infowindow = new CartoDBInfowindow(map);
  if (!cartodb_leaflet) {
    cartodb_leaflet = new CartoDBLayer({
      map_canvas: 'map',
      map: map,
      user_name: 'wdbassetmap',
      table_name: 'citylimits_cc',
      interactivity: "cartodb_id, name, census_url, chamber_url, green_url",
      //tile_style:     style,
      infowindow: true,
      //query:          '\"SELECT * FROM {{table_name}}', 
      query: "select l.the_geom, l.the_geom_webmercator, l.cartodb_id, l.name, r.url as census_url, c.url as chamber_url, g.url as green_url from greencorridor as g, chambercomm as c, citylimits_cc as l, census_acs_rpt r where lower(c.name) = lower(l.name) and lower(r.name) = lower(l.name)",
      auto_bound: true,
      debug: false,
      featureClick: function (feature, latlng, pos, data) {
        infowindow.setContent(data);
        infowindow.setPosition(latlng);
        infowindow.open();
      },
      featureOut: function () {
        map.setOptions({
          draggableCursor: null
        });
      },
      featureOver: function (feature, latlng, pos, data) {
        map.setOptions({
          draggableCursor: 'pointer'
        });
      }
    });
    //map.addLayer(cartodb_leaflet);
  } else {
    //cartodb_leaflet.setStyle(style);
  }
}
var OGPIcon = L.Icon.extend({
  iconUrl: '/app/img/marker_single_selected.png',
  shadowUrl: null,
  iconSize: new L.Point(19, 19),
  iconAnchor: new L.Point(9, 9),
  popupAnchor: new L.Point(1, 10)
});

function addMarker(map, case_study) {
  var icon = new OGPIcon();
  var latlon = case_study.getLatLong().coordinates;
  var marker = new L.Marker(new L.LatLng(latlon[1], latlon[0]), {
    icon: icon
  });
  map.addLayer(marker);
  marker.bindPopup(ich.infobox(case_study.toJSON()).html());
  return marker;
}
