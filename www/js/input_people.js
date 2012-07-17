$(function(){
	
	OSMHell.prototype.createFields = function(formid){
		$('#city').after('<div><select id="city_chouse" style="width: 25ex;"></select></div>');
		$('#street').after('<div><select id="street_chouse" style="width: 25ex;"></select></div>');
		$('#house').after('<div><select id="bldng_chouse" style="width: 15ex;"></select></div>');
	};
	
	OSMHell.prototype.centerMapData = function(data){
		var lonlat = data['data'][0];
		if(hell && hell.map){
			hell.map.setView(new L.LatLng(lonlat.lat, lonlat.lon), 17);
			
			hell.map.markergroup.clearLayers();
			var marker = new L.Marker(new L.LatLng(lonlat.lat, lonlat.lon));
			hell.map.markergroup.addLayer(marker);
		}
		
		this.setData(this.lonInput, lonlat.lon);
		this.setData(this.latInput, lonlat.lat);
	};
	
	OSMHell.prototype.mapClick = function(e){
		if(this.formActive){
			var latlng = e.latlng;
			this.setData(this.latInput, latlng.lat);
			this.setData(this.lonInput, latlng.lng);
			if(hell && hell.map){
				hell.map.setView(latlng, 17);
				
				hell.map.markergroup.clearLayers();
				var marker = new L.Marker(latlng);
				hell.map.markergroup.addLayer(marker);
			}
		}
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
  
  window.osmhell.attachMap(hell.map);
  
});

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


