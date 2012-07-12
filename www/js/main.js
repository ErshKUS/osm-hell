var hell={p:{}};

$(function(){
  hell.p.urlapi='http://ersh.homelinux.com:8092/api';
  L.Icon.Default.imagePath='img';

  hell.map = new L.Map('map');
  var mapnik = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18, attribution: "Map data &copy; <a href='http://osm.org'>OpenStreetMap</a> contributors"});
  
  var krymsk = new L.LatLng(44.915, 38.0);
  hell.map.setView(krymsk, 13).addLayer(mapnik);
  hell.map.markergroup = new L.LayerGroup();
  hell.map.addLayer(hell.map.markergroup);
  hell.map.allmarkers = {};

  // цветные маркеры
  hell.map.mcolors = new Array(new MarkerIcon({markerColor:'icon'}),new MarkerIcon({markerColor:'red'}), new MarkerIcon({markerColor:'yellow'}), new MarkerIcon({markerColor:'green'}));

  updateMarkers(); //load markers from server

  if (location.href.search("map.php")>0)
    return;

  window.osmhell = new OSMHell();
  window.osmhell.loadCityes();
  
  hell.inittab();
  $(window).resize(onresize);
  onresize();
});

onresize = function() {
  $('#tab').jqGrid('setGridHeight', $(window).height()/2-30);
  $('#map').height($(window).height()-$('#table').height()-3);
  hell.map.invalidateSize();
  $('#tab').jqGrid('setGridWidth', $(window).width());
};

hell.inittab = function(){
  $("#tab").jqGrid({
      url: hell.p.urlapi+'/data?action=getdata',
      datatype: "json",
      mtype: "POST",
      colNames:['','Город','Улица','Дом','Квартира','Контактное лицо','Телефон','required','info','Состояние жилья','Статус','',''],
      colModel:[
        {name:'id', index:'id', hidden:true, key:true},
        {name:'city', index:'city', width:25, editable:true},
        {name:'street', index:'street', width:50, editable:true},
        {name:'house', index:'house', width:15, editable:true},
        {name:'flat', index:'flat', width:15, editable:true},
        {name:'contact', index:'contact', width:60, editable:true},
        {name:'phone', index:'phone', width:40, editable:true},
        {name:'required', index:'required', width:55, editable:true},
        {name:'info', index:'info', width:55, editable:true},
        {name:'condition_house', index:'condition_house', width:55, editable:true},
        {name:'status', index:'status', width:55, editable:true,edittype:'select',formatter:'select',editoptions:{value:"1:Новая;2:В работе;3:Закрыта"}},
        {name:'lat', index:'lat', hidden:true, editable:true},
        {name:'lon', index:'lon', hidden:true, editable:true}
     ],
//      rowNum:30,
//      width: 1250,
//      rowList:[30,70],
      caption:"Таблица данных",
      pager: '#tabp',
      sortname: 'id',
//      ignoreCase: true,
//      pgbuttons: false,
//      pginput: false,
      height: 250,
      viewrecords: true,
      modal: false,
      jsonReader: { repeatitems: false },
      editurl: hell.p.urlapi+'/data?action=setdata',
      sortorder: "desc",
 /*     loadComplete: function(){
        $('#more_grid [aria-describedby=more_grid_check]>input').change(function(){
          $("#more_grid").jqGrid().setRowData(
            $(this).closest('tr').attr('id'),
            {check:this.checked}
          )
        })
      },*/
      beforeSelectRow: function(rowid) {
        var marker = hell.map.allmarkers[$('#tab').jqGrid('getRowData',rowid).id];
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
      }
    /*  beforeSelectRow: function(rowid) {
        $("#moreval_grid").jqGrid(
          'setGridParam',{
          url:'http://ersh.homelinux.com:8091/api/data?action=getmoreval&lang='+$("#lang>[name=lang]").val()+'&class='+$("#more_grid").jqGrid('getRowData',rowid).class,
          editurl:'http://ersh.homelinux.com:8091/api/data?action=setmoreval&lang='+$("#lang>[name=lang]").val()+'&class='+$("#more_grid").jqGrid('getRowData',rowid).class,
          datatype:'json'
        }).trigger("reloadGrid");
        $('#gbox_moreval_grid').removeClass('hide');
        return true;
      }*/
  });
  $("#tab").jqGrid('filterToolbar',{searchOnEnter:false});
  
  $("#tab").jqGrid('navGrid','#tabp',
    {edit:true,add:true,del:false,search:false,refresh:true},
    { //edit
      closeAfterEdit: true,
      width :  400,
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
        return [success,message];
      },
      afterShowForm : function (formid) {
    	  window.osmhell.connectToForm(formid);        
      }
    },
    { //add
      closeAfterAdd : true,
      width :  400,
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
        return [success,message,new_id];
      },
      afterShowForm : function (formid) {
    	  window.osmhell.connectToForm(formid);        
      } 
    }
  );
  
  
};

updateMarkers = function() {
  //var bnds = map.getBounds();
  bnds = new L.LatLngBounds(new L.LatLng(44.57,36.72), new L.LatLng(45.30, 39.04));
  var tmpl = "<div><table><tr><td><b>Город</b>:<td>${city}"+
  		    "<tr><td><b>Улица</b>:<td>${street}"+
  		    "<tr><td><b>Дом</b>:<td>${house}"+
  		    "<tr><td><b>Квартира</b>:<td>${flat}"+
  		    "<tr><td><b>Контактное лицо</b>:<td>${contact}"+
  		    "<tr><td><b>Телефон</b>:<td>${phone}"+
  		    "<tr><td><b>Что нужно</b>:<td>${required}"+
  		    "<tr><td><b>Доп. инфо.</b>:<td>${info}"+
  		    "<tr><td><b>Состояние жилья</b>:<td>${condition_house}"+
  	     "</table></div>";
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
          var marker = new L.Marker(new L.LatLng(point.lat, point.lon));
          var popupText = $.tmpl(tmpl, point).html();
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
  setTimeout(updateMarkers, 300000);// reload every 5 minutes
};

MarkerIcon = L.Icon.Default.extend({
  createIcon: function() {
    var img = this._createIcon(this.options.markerColor);
    this._setIconStyles(img, 'icon');
    return img;
  }
});
