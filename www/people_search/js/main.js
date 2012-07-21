$(function(){

  hell.map = new L.Map('map');
  var mapnik = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18, attribution: "Map data &copy; <a href='http://osm.org'>OpenStreetMap</a> contributors"});
  
  var krymsk = new L.LatLng(44.9289, 37.9870);
  hell.map.setView(krymsk, 13).addLayer(mapnik);
  hell.map.markergroup = new L.LayerGroup();
  hell.map.addLayer(hell.map.markergroup);
  hell.map.allmarkers = {};

  // цветные маркеры
  hell.map.mcolors = new Array(
  	new MarkerIcon({markerColor:'icon'}),
  	new MarkerIcon({markerColor:'red'}), 
  	new MarkerIcon({markerColor:'yellow'}), 
  	new MarkerIcon({markerColor:'green'})
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
  
  $("#tabptop td.ui-pg-button").hover(
    function(){ $(this).addClass("ui-state-hover") },
    function(){ $(this).removeClass("ui-state-hover") }
  );
  $("#tabptop td.ui-pg-button").click(
    function(e){
      $("#tab .ui-search-toolbar input").val("");
      if (this.textContent=="Все записи") { 
        $("#tabt").each(function(){ this.triggerToolbar() })
      }
      else if (this.textContent=="Погибшие") { 
       $("#tab .ui-search-toolbar [name=status]").val("погиб");
        $("#tabt").each(function(){ this.triggerToolbar() })
      }
      else if (this.textContent=="Открытые заявки") { 
        $("#tabt").each(function(){ 
          this.p.postData.filters='{"groupOp":"AND","rules":[{"field":"ticketstatus","op":"bn","data":"закрыта"}]}';
          this.p.postData._search=true;
          this.p.search = true;
          $(this).trigger("reloadGrid",[{page:1}]);
        })
      }
      else if (this.textContent=="Закрытые заявки") { 
        $("#tab .ui-search-toolbar [name=ticketstatus]").val("закрыта");
        $("#tabt").each(function(){ this.triggerToolbar() })
      }
    }
  );
});

onresize = function() {
  $('#tabt').jqGrid('setGridHeight', $(window).height()*0.6-30);
  $('#map').height($(window).height()-$('#tab').height()-3);
  hell.map.invalidateSize();
  $('#tabt').jqGrid('setGridWidth', $(window).width());
};

hell.inittab = function(){
  $("#tabt").jqGrid({
      url: hell.p.urlapi+'/people_search?action=getdata',
      datatype: "json",
      mtype: "POST",
      

      colNames:['','id','Город','Улица','Дом','Имя человека','Дата рождения','Возраст','Что известно','Подробности о человеке','Источник информации','Кто разыскивает','Способы связи с ищущим','Биографические данные, персональные данные и связи', 'Медицинские сведения', 'Антропометрические сведения', 'Психологические и поведенческие особенности', 'Статус заявки', 'Информация от модераторов списка', 'Информация от волонтеров с места', 'Кто проверял, телефон', 'Дата проверки','Временной шамп','lat','lon'],
      colModel:[
        {name:'check', index:'check', width:15, editable:false, search:true, edittype:'checkbox', editoptions:{value:"True:False"}, formatter:"checkbox", formatoptions:{disabled:false}},      
        {name:'id', index:'id', hidden:true, key:true, hidden: true},
        {name:'city', index:'city', width:50, editable:true},
        {name:'street', index:'street', width:70, editable:true},
        {name:'house', index:'house', width:25, editable:true},
        {name:'nameperson', index:'nameperson', width:150, editable:true},
        {name:'dob', index:'dob', width:60, editable:true},
        {name:'age', index:'age', width:50, editable:true},
        {name:'status', index:'status', width:70, editable:true},
        {name:'details', index:'details', width:150, editable:true},
        {name:'source', index:'source', width:90, editable:true},
        {name:'sourceperson', index:'sourceperson', width:200, editable:true},
        {name:'sourcecontact', index:'sourcecontact', width:200, editable:true},
        {name:'relationship', index:'relationship', width:200, editable:true},
        {name:'medicalinfo', index:'medicalinfo', width:200, editable:true},
        {name:'anthropometric', index:'anthropometric', width:200, editable:true},
        {name:'psychological', index:'psychological', width:200, editable:true},
        {name:'ticketstatus', index:'ticketstatus', width:70, editable:true},
        {name:'infomoderators', index:'infomoderators', width:150, editable:true},
        {name:'infovolunteer', index:'infovolunteer', width:150, editable:true},
        {name:'namevolunteer', index:'namevolunteer', width:100, editable:true},
        {name:'datechecking', index:'datechecking', width:55, editable:true},
        {name:'timestamp', index:'timestamp', hidden:true, width:30, editable:true},
        {name:'lat', index:'lat', hidden:true, editable:true},
        {name:'lon', index:'lon', hidden:true, editable:true}
     ],
      
      /*
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
     */
      rowNum:500,
//      width: 1250,
//      rowList:[30,70],
      caption:"Таблица данных",
      pager: '#tabp',
      sortname: 'id',
      viewsortcols: [true],
      ignoreCase: true,
//      pgbuttons: false,
//      pginput: false,
      height: 250,
      viewrecords: true,
      shrinkToFit: false,
      modal: false,
      loadonce: true,
      jsonReader: { repeatitems: false },
      editurl: hell.p.urlapi+'/people_search?action=setdata',
      sortorder: "desc",
      loadComplete: function(){
        $('#tabt [aria-describedby=tabt_check]>input').change(function(){
          $("#tabt").jqGrid().setRowData(
            $(this).closest('tr').attr('id'),
            {check:this.checked}
          );
          hell.updateMarkers();
        })
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
        hell.updateMarkers();
      }
  });
  $("#tabt").jqGrid('filterToolbar',{searchOnEnter:false});

  $("#tabt")
    .navGrid('#tabp',{edit:false,add:false,del:false,search:false,refresh:false})
  /*  .navButtonAdd('#tabp',{
      caption:"Распечатать выбранные", 
      buttonicon:"ui-icon-print", 
      onClickButton: function(){
        
      }, 
      position:"last"
    })
    .navButtonAdd('#tabp',{
      caption:"Распечатать выбранные", 
      buttonicon:"ui-icon-print", 
      onClickButton: function(){
        
      }, 
      position:"last"
    });*/
  
 // jQuery("#tabt").jqGrid('searchGrid', {multipleSearch:true} );
  
/* 
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
        updateMarkers();
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
        updateMarkers();
        return [success,message,new_id];
      },
      afterShowForm : function (formid) {
    	  window.osmhell.connectToForm(formid);        
      }
    }
  );
  */
  
};

hell.updateMarkers = function() {
  var data = $('#tabt').getRowData();
  var check = false;
  hell.map.markergroup.clearLayers();
  for(var i=0;i<data.length;i++) {if (data[i].check == "True") check=true}
  for(var i=0;i<data.length;i++) {
    // каждую точку сложить в одно сообщение
    var point = data[i];
    if (!parseFloat(point.lat) || !parseFloat(point.lon))
      continue;
    if (check && !(point.check == "True"))
      continue;
    var marker = new L.Marker(new L.LatLng(point.lat, point.lon));
    //var popupText = $.tmpl(hell.popuptempl, point).html();
    //marker.bindPopup(popupText);
    var icon = hell.map.mcolors[point.status];
    if (icon)
      marker.setIcon(icon);
    hell.map.markergroup.addLayer(marker);
    hell.map.allmarkers[point.id] = marker;
    marker._json = point;
  }
}

/*
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
  setTimeout(updateMarkers, 300000);// reload every 5 minutes
};*/

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
