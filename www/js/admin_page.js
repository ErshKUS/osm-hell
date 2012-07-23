$.extend({
  getUrlVars: function(){
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  },
  getUrlVar: function(name){
    return $.getUrlVars()[name];
  }
});

$(function(){

  hell.p.key = $.getUrlVar('key') || '';

  hell.map = new L.Map('map');
  var mapnik = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18, attribution: "Map data &copy; <a href='http://osm.org'>OpenStreetMap</a> contributors"});

  var layerdefs = {
		  gsat: { name: "Google", js: ["http://maps.google.com/maps/api/js?v=3.2&sensor=false&callback=L.Google.asyncInitialize", "js/llplugins/Google.js"],
			  init: function() {return new L.Google(); }
		  },
		  ysat: { name: "Yandex", js: ["http://api-maps.yandex.ru/2.0/?load=package.map&lang=ru-RU", "js/llplugins/Yandex.js"],
			  init: function() {return new L.Yandex("satellite"); }
		  },
		  bing: { name: "Bing", js: ["js/llplugins/Bing.js"],
			  init: function() {return new L.BingLayer("Anqm0F_JjIZvT0P3abS6KONpaBaKuTnITRrnYuiJCE0WOhH6ZbE4DzeT6brvKVR5");}
		  }
  };

  var yandex = new L.DeferredLayer(layerdefs.ysat);
  var google = new L.DeferredLayer(layerdefs.gsat);
  var bing = new L.DeferredLayer(layerdefs.bing);

  hell.lswtcher = new L.Control.Layers({'OSM':mapnik, 'Google': google, 'Yandex': yandex, 'Bing': bing});
  hell.map.addControl(hell.lswtcher);

  var krymsk = new L.LatLng(44.9289, 37.9870);
  hell.map.setView(krymsk, 13).addLayer(mapnik);
  hell.map.markergroup = new L.LayerGroup();
  hell.map.addLayer(hell.map.markergroup);
  hell.map.allmarkers = {};

  // цветные маркеры
  hell.map.mcolors = new Array(
  	new MarkerIcon({markerColor:'icon'}),
  	new MarkerIcon({markerColor:'icon'}),
  	new MarkerIcon({markerColor:'red'}),
  	new MarkerIcon({markerColor:'green'}),
  	new MarkerIcon({markerColor:'yellow'})
  );

  if (location.href.search("map.php")>0) {
    updateMarkers(); //load markers from server
    return;
  }

  window.osmhell = new OSMHell();
  window.osmhell.loadCityes();

  hell.inittab();
  $(window).resize(onresize);
  onresize();
});

onresize = function() {
  $('#tabt').jqGrid('setGridHeight', $(window).height()*0.5-30);
  $('#map').height($(window).height()-$('#tab').height()-3);
  hell.map.invalidateSize();
  $('#tabt').jqGrid('setGridWidth', $(window).width());
};

hell.inittab = function(){
  $("#tabt").jqGrid({
      url: hell.p.urlapi+'/data?action=getdata',
      datatype: "json",
      mtype: "POST",

      colNames:['', 'id','Город','Улица','Дом','Квартира','Состав семьи','Контактное лицо','Телефон','Требуется','Доп.информация','Состояние жилья','Статус','Сделано','lat','lon'],
      colModel:[
        {name:'check', index:'check', width:15, editable:false, search:true, edittype:'checkbox', editoptions:{value:"True:False"}, formatter:"checkbox", formatoptions:{disabled:false}},
        {name:'id', index:'id', hidden:true, key:true},
        {name:'city', index:'city', width:70, editable:true},
        {name:'street', index:'street', width:100, editable:true},
        {name:'house', index:'house', width:38, editable:true},
        {name:'flat', index:'flat', width:35, editable:true},
        {name:'compositionfamily', index:'compositionfamily', width:150, editable:true},
        {name:'contact', index:'contact', width:90, editable:true},
        {name:'phone', index:'phone', width:70, editable:true},
        {name:'required', index:'required', width:200, editable:true, edittype:'textarea'},
        {name:'info', index:'info', width:200, editable:true, edittype:'textarea'},
        {name:'condition_house', index:'condition_house', width:150, editable:true},
        {name:'status', index:'status', width:45, editable:true,edittype:'select',formatter:'select',editoptions:{value:"1:В работе;2:Cрочная помощь;3:Помощь не требуется"}},
        {name:'done', index:'done', width:200, edittype:'textarea', editable:true},
        {name:'lat', index:'lat', hidden:true, editable:true},
        {name:'lon', index:'lon', hidden:true, editable:true}
     ],

      rowNum:5000,
//      width: 1250,
//      rowList:[30,70],
      caption:"Таблица данных",
      pager: '#tabp',
      sortname: 'id',
      viewsortcols: true,
      ignoreCase: true,
      shrinkToFit: false,
//      pgbuttons: false,
//      pginput: false,
      height: 250,
      viewrecords: true,
      modal: false,
      jsonReader: { repeatitems: false },
      editurl: hell.p.urlapi+'/data?action=setdata&_key='+hell.p.key,
      sortorder: "desc",
      loadComplete: function(){
        changecheck = function(data){
          $("#tabt").jqGrid().setRowData(
            $(data).closest('tr').attr('id'),
            {check:data.checked}
          );
          hell.updateMarkers();
          $('#tabt [aria-describedby=tabt_check]>input').change(function(){changecheck(this)});
        }
        $('#tabt [aria-describedby=tabt_check]>input').change(function(){changecheck(this)});
      },
      beforeSelectRow: function(rowid) {
        var marker = hell.map.allmarkers[$('#tabt').jqGrid('getRowData',rowid).id];
        if (!marker) {
          hell.map.closePopup();
          return true;
        }

        hell.map.panTo(marker.getLatLng());
        marker.openPopup();
        return true;
      },
      onHeaderClick: function() {
        onresize();
      },
      gridComplete: function() {
        var data = $('#tabt').getRowData();
        hell.map.markergroup.clearLayers();
        for(var i=0;i<data.length;i++) {
          // каждую точку сложить в одно сообщение
          var point = data[i];
          if (!parseFloat(point.lat) || !parseFloat(point.lon))
            continue;
          var marker = new L.Marker(new L.LatLng(point.lat, point.lon));
          var popupText = $.tmpl(hell.popuptempl, point).html();
          marker.bindPopup(popupText);
          //marker.rowid=point.id
          //marker.on('click',function(e){
          //  $("#tabt").jqGrid('setSelection',e.target.rowid);
          //})
          var icon = hell.map.mcolors[point.status];
          if (icon)
            marker.setIcon(icon);
          hell.map.markergroup.addLayer(marker);
          hell.map.allmarkers[point.id] = marker;
          marker._json = point;
        }
      }
  });
  $("#tabt").jqGrid('filterToolbar',{searchOnEnter:false});

  $("#tabt").jqGrid('navGrid','#tabp',
    {edit:true,add:true,del:false,search:false,refresh:true,view:true},
    { //edit
      closeAfterEdit: true,
      width :  500,
      afterSubmit: function (response, postdata) {
        var success = true;
        var message = "";
        var json = jQuery.parseJSON(response.responseText);
        if(json.errors) {
          success = false;
          for(i=0; i < json.errors.length; i++) {
            message += json.errors[i] + '<br/>';
          }
        }
        if(json.error) {
          success = false;
          message +=json.error;
        }
        $(this).jqGrid('setGridParam', {datatype:'json'});
        //updateMarkers();
        return [success,message];
      },
      afterShowForm : function (formid) {
        $('div.ui-widget-overlay').zIndex('99');
    	  window.osmhell.hideOverlay();
    	  window.osmhell.attachMap(hell.map);
    	  window.osmhell.connectToForm(formid);
      },
      onClose : function(){
    	  window.osmhell.formActive = false;
    	  return true;
      }
    },
    { //add
      closeAfterAdd : true,
      width :  500,
      afterSubmit: function (response, postdata) {
        var success = true;
        var message = "";
        var json = jQuery.parseJSON(response.responseText);
        if(json.errors) {
          success = false;
          for(i=0; i < json.errors.length; i++) {
            message += json.errors[i] + '<br/>';
          }
        }
        if(json.error) {
          success = false;
          message +=json.error;
        }
        var new_id = "1";
        $(this).jqGrid('setGridParam', {datatype:'json'});
        //updateMarkers();
        return [success,message,new_id];
      },
      afterShowForm : function (formid) {
        $('div.ui-widget-overlay').zIndex('99');
    	  window.osmhell.hideOverlay();
    	  window.osmhell.attachMap(hell.map);
    	  window.osmhell.connectToForm(formid);
      },
      onClose : function(){
    	  window.osmhell.formActive = false;
    	  return true;
      }
    }
  );

/*  $("#tabt")
    .navButtonAdd('#tabp',{
      caption:"Распечатать выбранные",
      buttonicon:"ui-icon-print",
      onClickButton: function(){
        a=1;
        this.p.postData.filters='{"groupOp":"AND","rules":[{"field":"ticketstatus","op":"bn","data":"закрыта"}]}';
        this.p.postData._search=true;
        $(this).trigger("reloadGrid",[{page:1}]);
      },
      position:"last"
    })*/


};

updateMarkers = function() {
  //var bnds = map.getBounds();
  bnds = new L.LatLngBounds(new L.LatLng(44.57,36.72), new L.LatLng(45.30, 39.04));
  $.ajax({
    url: hell.p.urlapi+"/data",
    type: "GET",
    data: {
      action: "getpoint",
      maxlat: bnds.getNorthEast().lat,
      maxlon: bnds.getNorthEast().lng,
      minlat: bnds.getSouthWest().lat,
      minlon: bnds.getSouthWest().lng
    },
    dataType: "json",
    success: function(json, text, jqXHR) {
      if (json.hasOwnProperty("error")) {
        alert("Произошла ошибка!\n"+json.error);
      } else {
        hell.map.markergroup.clearLayers();
        for(var i=0;i<json.data.length;i++) {
          // каждую точку сложить в одно сообщение
          var point = json.data[i];
          if (!point.lat || !point.lon)
            continue;
          var marker = new L.Marker(new L.LatLng(point.lat, point.lon));
          var popupText = $.tmpl(hell.popuptempl, point).html();
          marker.bindPopup(popupText);
          marker.setIcon(hell.map.mcolors[point.status]);
          hell.map.markergroup.addLayer(marker);
          hell.map.allmarkers[point.id] = marker;
          marker._json = point;
        }
      }
    }
  }).fail(function (jqXHR, textStatus) {
    alert("Произошла ошибка при чтении карты");
  });
  //setTimeout(updateMarkers, 300000);// reload every 5 minutes
};

MarkerIcon = L.Icon.Default.extend({
  createIcon: function() {
    var img = this._createIcon(this.options.markerColor);
    this._setIconStyles(img, 'icon');
    return img;
  }
});

hell.askPoint = function() {
  $('#map').css('cursor', 'crosshair');
  hell.map.on('click', hell.putPoint);
};

hell.putPoint = function(e) {
  $('#map').css('cursor', 'auto');
  hell.map.off('click', hell.putPoint);
  alert(e.latlng.lat);
};

// natural order sorting
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
