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
  <script type="text/javascript" src="js/jquery-ui-1.8.21.custom.min.js"></script>
  <script type="text/javascript" src="js/jquery.json-2.3.min.js"></script>
  <script type="text/javascript" src="js/jquery.cookie.js"></script>
  <script type="text/javascript" src="js/i18n/grid.locale-ru.js"></script>
  <script type="text/javascript" src="js/jquery.jqGrid.src.js"></script>
      
  <script type="text/javascript" src="js/jquery.tmpl.min.js"></script>
  <script type="text/javascript" src="js/conf.js"></script>
  <script type="text/javascript" src="js/main.js"></script>
  <script type="text/javascript" src="js/form-customization.js"></script>
    
</head>
<body>
  <div style="height:100%;width:100%;">
	  <div id="tab">
      <div id="tabptop" class="ui-jqgrid">
        <div class="ui-state-default ui-jqgrid-pager ui-corner-bottom">
          <table class="ui-pg-table navtable"><tr>
            <td class="ui-pg-button ui-corner-all"><span class="ui-icon ui-icon-document-b"></span>Фильтр 1</td>
            <td class="ui-pg-button ui-corner-all"><span class="ui-icon ui-icon-document-b"></span>Фильтр 2</td>
          <tr></table>
        </div>
      </div>
	    <table id="tabt"></table>
	    <div id="tabp"></div>  
	  </div>
	  <div id="map" style="">
	  </div>
  </div>  
</body>
</html>
