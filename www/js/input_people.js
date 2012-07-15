$(function(){
	
	OSMHell.prototype.createFields = function(formid){
		$('#city').after('<div><select id="city_chouse"></select></div>');
		$('#street').after('<div><select id="street_chouse"></select></div>');
		$('#house').after('<div><select id="bldng_chouse"></select></div>');
	};
	
	window.osmhell = new OSMHell();
	window.osmhell.loadCityes();
	window.osmhell.connectToForm(window.document.forms[0]);
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


