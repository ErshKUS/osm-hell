$(function(){
	
	OSMHell.prototype.createFields = function(formid){
		$('#city').after('<div><select id="city_chouse"></select></div>');
		$('#street').after('<div><select id="street_chouse"></select></div>');
		$('#house').after('<div><select id="bldng_chouse"></select></div>');
	};
	
	window.osmhell = new OSMHell();
	window.osmhell.loadCityes();
	window.osmhell.connectToForm(window.document.forms[0]);
  
  hell.map = new L.Map('map');
  var mapnik = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18, attribution: "Map data &copy; <a href='http://osm.org'>OpenStreetMap</a> contributors"});
  var krymsk = new L.LatLng(44.9289, 37.9870);
  hell.map.setView(krymsk, 13).addLayer(mapnik);
  hell.map.markergroup = new L.LayerGroup();
  hell.map.addLayer(hell.map.markergroup);
  
  $('#map').css('cursor', 'crosshair');
  hell.map.on('click', hell.putPoint);  
});

hell.putPoint = function(e) {
  hell.map.markergroup.clearLayers();
  $("#form [name=lat]").val(e.latlng.lat);
  $("#form [name=lon]").val(e.latlng.lng);
  var marker = new L.Marker(new L.LatLng(e.latlng.lat, e.latlng.lng));
  hell.map.markergroup.addLayer(marker);
};

//natural order sorting
function alphanum(a, b) {
  function chunkify(t) {
    var tz = [], x = 0, y = -1, n = 0, i, j;

    while (i = (j = t.charAt(x++)).charCodeAt(0)) {
      var m = (i == 46 || (i >=48 && i <= 57));
      if (m !== n) {
        tz[++y] = "";
        n = m;
      }
      tz[y] += j;
    }
    return tz;
  }

  var aa = chunkify(a.name);
  var bb = chunkify(b.name);

  for (x = 0; aa[x] && bb[x]; x++) {
    if (aa[x] !== bb[x]) {
      var c = Number(aa[x]), d = Number(bb[x]);
      if (c == aa[x] && d == bb[x]) {
        return c - d;
      } else return (aa[x] > bb[x]) ? 1 : -1;
    }
  }
  return aa.length - bb.length;
}


