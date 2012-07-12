var hell={};

$(function(){
  L.Icon.Default.imagePath='img';

  map = new L.Map('map');
  var mapnik = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18, attribution: "Map data &copy; <a href='http://osm.org'>OpenStreetMap</a> contributors"});
  
  var krymsk = new L.LatLng(44.915, 38.0);
  map.setView(krymsk, 13).addLayer(mapnik);
  map.markergroup = new L.LayerGroup();
  map.addLayer(map.markergroup);

  // цветные маркеры
  map.mcolors = new Array(new MarkerIcon({markerColor:'red'}), new MarkerIcon({markerColor:'yellow'}), new MarkerIcon({markerColor:'green'}));

  onmapmove(); //load markers from server

  if (location.href.search("map.php")>0)
    return;

  window.osmhell = new OSMHell($('#city_select')[0], $('#street_select')[0], $('#building_select')[0]);
  window.osmhell.loadCityes();
  
  hell.inittab();
});


hell.inittab = function(){
  $("#tab").jqGrid({
      url:'http://ersh.homelinux.com:8092/api/data?action=getdata',
      datatype: "json",
      mtype: "POST",
      colNames:['','Город','Улица','Дом','Квартира','Контактное лицо','Телефон','required','info','Состояние жилья'],
      colModel:[
        {name:'id', index:'id', hidden:true, key:true},
        {name:'city', index:'city', width:25, editable:true},
        {name:'street', index:'street', width:50, editable:true},
        {name:'house', index:'house', width:20, editable:true},
        {name:'flat', index:'flat', width:20, editable:true},
        {name:'contact', index:'contact', width:60, editable:true},
        {name:'phone', index:'phone', width:40, editable:true},
        {name:'required', index:'required', width:55, editable:true},
        {name:'info', index:'info', width:55, editable:true},
        {name:'condition_house', index:'condition_house', width:55, editable:true}
     ],
//      rowNum:30,
      width: 1250,
//      rowList:[30,70],
      pager: '#tabp',
      sortname: 'id',
//      ignoreCase: true,
//      pgbuttons: false,
//      pginput: false,
      height: 250,
      viewrecords: true,
      modal: false,
      jsonReader: { repeatitems: false },
      editurl:"http://ersh.homelinux.com:8092/api/data?action=setdata",
      sortorder: "desc",
 /*     loadComplete: function(){
        $('#more_grid [aria-describedby=more_grid_check]>input').change(function(){
          $("#more_grid").jqGrid().setRowData(
            $(this).closest('tr').attr('id'),
            {check:this.checked}
          )
        })
      },*/
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
  $("#tab").jqGrid('filterToolbar');
  
  $("#tab").jqGrid('navGrid','#tabp',
    {edit:true,add:true,del:false,search:false,refresh:false},
    { //edit
      closeAfterEdit: true,
   /*   afterSubmit: function (response, postdata) {
        var success = true;
        var message = ""
        var json = eval('(' + response.responseText + ')');
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
      }*/
    },
    { //add
      closeAfterAdd : true,
  /*    afterSubmit: function (response, postdata) {
        var success = true;
        var message = ""
        var json = eval('(' + response.responseText + ')');
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
      }*/
    }
  );
  
  
}

onmapmove = function() {
  //var bnds = map.getBounds();
  bnds = new L.LatLngBounds(new L.LatLng(44.57,36.72), new L.LatLng(45.30, 39.04));
  $.ajax({
    url: "http://ersh.homelinux.com:8092/api/data",
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
        map.markergroup.clearLayers();
        for(var i=0;i<json.data.length;i++) {
          // каждую точку сложить в одно сообщение
          var point = json.data[i];
          var marker = new L.Marker(new L.LatLng(point.lat, point.lon));
          marker.bindPopup(point.info);
          marker.setIcon(map.mcolors[0]);
          map.markergroup.addLayer(marker);
        }
      }
    }
  }).fail(function (jqXHR, textStatus) {
    alert("Произошла ошибка при чтении карты");
  });
  setTimeout(onmapmove, 300000);// reload every 5 minutes
}

MarkerIcon = L.Icon.Default.extend({
  createIcon: function() {
    var img = this._createIcon(this.options.markerColor);
    this._setIconStyles(img, 'icon');
    return img;
  }
});
