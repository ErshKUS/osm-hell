<!doctype html>
<html>
<head>
  <title>osm-hell</title>
  <meta content="text/html; charset=UTF-8" http-equiv="Content-Type">
  <link rel="stylesheet" href="css/leaflet.css" />
  <script src="js/leaflet.js"></script>
  <!--[if lte IE 8]><link rel="stylesheet" href="css/leaflet.ie.css" /><![endif]-->    
  <link type="text/css" href="css/main.css" rel="stylesheet" />
  <link type="text/css" href="css/ui-lightness/jquery-ui-1.8.21.custom.css" rel="stylesheet" />
  <link type="text/css" href="css/ui.jqgrid.css" rel="stylesheet" />
  <script type="text/javascript" src="js/jquery.js"></script>
  <script type="text/javascript" src="js/jquery.json-2.3.min.js"></script>
  <script type="text/javascript" src="js/jquery.cookie.js"></script>
  <script type="text/javascript" src="js/jquery.tmpl.min.js"></script>
  <script type="text/javascript" src="js/jquery-ui-1.8.21.custom.min.js"></script>
  <script type="text/javascript" src="js/i18n/grid.locale-ru.js"></script>
  <script type="text/javascript" src="js/jquery.jqGrid.min.js"></script>
  <script type="text/javascript" src="js/OSMHell.js"></script>
      
  <script type="text/javascript" src="js/main.js"></script>
    
</head>
<body onload="init();">
  <div style="width:100%;height:35%">
    <table id="tab"></table>
    <div id="tabp"></div>
  
  
    <form action="/">
	<table width="400">
	    <tr>
		<td>Город</td><td><select id="city_select"></select></td>
	    </tr>
	    <tr>
		<td>Улица</td><td><select id="street_select"></select></td>
	    </tr>
	    <tr>
		<td>Дом</td><td><select id="building_select"></select></td>
	    </tr>
	    <tr>
		<td>Квартира</td><td><input type="text"></input></td>
	    </tr>
	    <tr>
		<td>Контактное лицо</td><td><input type="text"></input></td>
	    </tr>
	    <tr>
		<td>Телефон</td><td><input type="text"></input></td>
	    </tr>
	    <tr>
		<td>Что требуется</td><td><input type="text"></input></td>
	    </tr>
	    <tr>
		<td>Дополнительная информация</td>
		<td><input type="text"></input></td>
	    </tr>

	</table>
    </form>
  </div>
  <div id="map" style="height:65%;">
  </div>
  <script type="text/javascript">
    window.osmhell = new OSMHell($('#city_select')[0], $('#street_select')[0], $('#building_select')[0]);
    function init(){
	$.ajax(OSMHell.API_URL, {
	    data: {'action':'addrselect', 'get' : 'city'},
	    context : window.osmhell
	}).done(function ( data ) {
	    this.applyCityes($.parseJSON(data));
	});
    }
    </script>
</body>
</html>
