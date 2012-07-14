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

  hell.p.key = $.getUrlVar('key') || ''

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
});

onresize = function() {
  $('#tabt').jqGrid('setGridHeight', $(window).height()*0.4-30);
  $('#map').height($(window).height()-$('#tab').height()-3);
  hell.map.invalidateSize();
  $('#tabt').jqGrid('setGridWidth', $(window).width());
};

hell.inittab = function(){
  $("#tabt").jqGrid({
      url: hell.p.urlapi+'/data?action=getdata',
      datatype: "json",
      mtype: "POST",
      
      
      

      colNames:['id','Временной шамп','Город','Улица','Дом','Имя человека','Дата рождения','Возраст','Что известно','Подробности о человеке','Источник информации','Кто разыскивает','Способы связи с ищущим','Биографические данные, персональные данные и связи', 'anthropometric', 'psychological', 'medicalinfo', 'ticketstatus', 'infomoderators', 'infovolunteer', 'namevolunteer', 'datechecking','lat','lon'],
      colModel:[
        {name:'id', index:'id', hidden:true, key:true, hidden: true},
        {name:'timestamp', index:'timestamp', width:30, editable:true, hidden: true},
        {name:'city', index:'city', width:25, editable:true},
        {name:'street', index:'street', width:50, editable:true},
        {name:'house', index:'house', width:15, editable:true},
        {name:'nameperson', index:'nameperson', width:60, editable:true},
        {name:'dob', index:'dob', width:40, editable:true},
        {name:'age', index:'age', width:55, editable:true},
        {name:'status', index:'status', width:55, editable:true},
        {name:'details', index:'details', width:55, editable:true},
        {name:'source', index:'source', width:55, editable:true},
        {name:'sourceperson', index:'sourceperson', width:55, editable:true, hidden: true},
        {name:'sourcecontact', index:'sourcecontact', width:55, editable:true, hidden: true},
        {name:'relationship', index:'relationship', width:55, editable:true, hidden: true},
        {name:'anthropometric', index:'anthropometric', width:55, editable:true, hidden: true},
        {name:'psychological', index:'psychological', width:55, editable:true, hidden: true},
        {name:'medicalinfo', index:'medicalinfo', width:55, editable:true, hidden: true},
        {name:'ticketstatus', index:'ticketstatus', width:55, editable:true},
        {name:'infomoderators', index:'infomoderators', width:55, editable:true},
        {name:'infovolunteer', index:'infovolunteer', width:55, editable:true},
        {name:'namevolunteer', index:'namevolunteer', width:55, editable:true},
        {name:'datechecking', index:'datechecking', width:55, editable:true},
        {name:'lat', index:'lat', hidden:true, editable:true, hidden: true, hidden: true},
        {name:'lon', index:'lon', hidden:true, editable:true, hidden: true, hidden: true}
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
      rowNum:50000,
//      width: 1250,
//      rowList:[30,70],
      caption:"Таблица данных",
      pager: '#tabp',
      sortname: 'id',
      ignoreCase: true,
//      pgbuttons: false,
//      pginput: false,
      height: 250,
      viewrecords: true,
      modal: false,
      jsonReader: { repeatitems: false },
      editurl: hell.p.urlapi+'/data?action=setdata&key='+hell.p.key,
      sortorder: "desc",
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
          if (!point.lat || !point.lon)
            continue;
          var marker = new L.Marker(new L.LatLng(point.lat, point.lon));
          var popupText = $.tmpl(hell.popuptempl, point).html();
          marker.bindPopup(popupText);
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
        updateMarkers();
        return [success,message];
      },
      afterShowForm : function (formid) {
    	  window.osmhell.connectToForm(formid);        
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
        updateMarkers();
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
}
hell.putPoint = function(e) {
  $('#map').css('cursor', 'auto');
  hell.map.off('click', hell.putPoint);
  alert(e.latlng.lat);
}

OSMHell = function OSMHell(){
	
	OSMHell.API_URL = hell.p.urlsearch + '/searchselect';

	this.cityView = null;
	this.streetView = null;
	this.buildingView = null;
	
	this.cities = {};
	
	this.coordsCache = {};
};


OSMHell.prototype.loadCityes = function(json){
	$.ajax(OSMHell.API_URL, {
		data: {'action':'addrselect', 'get' : 'city'},
		context : window.osmhell
	}).done(function ( data ) {
		this.applyCityes($.parseJSON(data));
	});
};

OSMHell.prototype.applyCityes = function(json){
	if(json && json.data){
		for(var i in json.data){
			this.addCity(json.data[i].name);
		}
		
		this.refreshCitiesView();
	}
};

OSMHell.prototype.addCity = function(name){
	if(!this.cities[name]){
		this.cities[name] = {};
		this.cities[name]['name'] = name;
		this.cities[name].streets = {};
		this.cities[name].loaded = false;
	}
};

OSMHell.prototype.refreshCitiesView = function(){
	if(this.cityView){
		
		this.cityView.innerHTML = '';
		
		var html = '<option>Указать вручную</option>';
		for(var i in this.cities){
			html += '<option>' + i + '</option>';
		}
		
		this.cityView.innerHTML = html;
	}
};

OSMHell.prototype.cityChange = function(){
	this.selectedCity = this.cityView.options[this.cityView.selectedIndex].text;
	
	if(this.cityView.selectedIndex != 0){
		this.refreshStreetsData();
	}
	
	if(this.cityView.selectedIndex > 0){
		this.setData(this.cityInput, this.selectedCity);
	}
	
	if(this.cityView.selectedIndex == 0){
		this.resetStreetView();
	}
};

OSMHell.prototype.refreshStreetsData = function(doneCallback, context){
	
	if(!this.cities[this.selectedCity].loaded){
		var cityClosure = this.selectedCity;
		$.ajax(OSMHell.API_URL, {
			data: {'action':'addrselect', 'get' : 'street', 'city' : this.selectedCity},
			context : window.osmhell
		}).done(function ( data ) {
			this.applyStreets($.parseJSON(data), cityClosure);
			this.refreshStreetsView();
			
			if(doneCallback){
				doneCallback.apply(context, []);
			}
		});
	} else {
		this.refreshStreetsView();
		
		if(doneCallback){
			doneCallback.apply(context, []);
		}
	}
	
	
};

OSMHell.prototype.applyStreets = function(json, city){
	
	for(var i in json.data){
		this.addStreet(json.data[i].name, city);
	}
	
	this.cities[city].loaded = true;
	
};

OSMHell.prototype.addStreet = function(name, city){
	
	if(this.cities[city]){
		if(!this.cities[city].streets[name]){
			this.cities[city].streets[name] = {};
			this.cities[city].streets[name]['name'] = name;
			this.cities[city].streets[name].buildings = [];
			this.cities[city].streets[name].loaded = false;
		}
	}
	
};

OSMHell.prototype.refreshStreetsView = function(){
	
	this.streetView.innerHTML = '';
	
	var html = '<option>Ввести вручную</option>';
	
	for(var i in this.cities[this.selectedCity].streets){
		html += '<option>' + this.cities[this.selectedCity].streets[i].name + '</option>'; 
	}
	
	this.streetView.innerHTML = html;
	
};

OSMHell.prototype.streetChange = function(){
	
	this.selectedStreet = this.streetView.options[this.streetView.selectedIndex].text;
	
	if(this.streetView.selectedIndex != 0){
		this.refreshBuildingsData();
	}
	
	if(this.streetView.selectedIndex > 0){
		this.setData(this.streetInput, this.selectedStreet);
	}
};

OSMHell.prototype.refreshBuildingsData = function(doneCallback, contex){
	
	if(!this.cities[this.selectedCity].streets[this.selectedStreet].loaded){
		var cityClosure = this.selectedCity;
		var streetClosure = this.selectedStreet;
		$.ajax(OSMHell.API_URL, {
			data: {'action':'addrselect', 'get' : 'house', 'city' : this.selectedCity, 'street' : this.selectedStreet},
			context : window.osmhell
		}).done(function ( data ) {
			this.applyBuildings($.parseJSON(data), cityClosure, streetClosure);
			this.refreshBuildingsView();
			
			if(doneCallback){
				doneCallback.apply(contex, []);
			}
		});
	} else {
		this.refreshBuildingsView();
		
		if(doneCallback){
			doneCallback.apply(contex, []);
		}
	}
	
};

OSMHell.prototype.applyBuildings = function(json, city, street){
	
	json.data.sort(alphanum); // natural order
	for(var i in json.data){
		this.addBuilding(json.data[i].name, city, street);
	}
	
	this.cities[city].streets[street].loaded = true;
	
};

OSMHell.prototype.addBuilding = function(name, city, street){
	
	if(this.cities[city] && this.cities[city].streets[street]){
		//По-хорошему надо проверять что такого адреса еще нет
		this.cities[city].streets[street].buildings.push(name);
	}
	
};

OSMHell.prototype.refreshBuildingsView = function(){
	
	this.buildingView.innerHTML = '';
	
	var html = '<option>Ввести вручную</option>';
	
	for(var i in this.cities[this.selectedCity].streets[this.selectedStreet].buildings){
		html += '<option>' + this.cities[this.selectedCity].streets[this.selectedStreet].buildings[i] + '</option>'; 
	}
	
	this.buildingView.innerHTML = html;
	
};

OSMHell.prototype.buildingChange = function(){
	this.selectedBuilding = this.buildingView.options[this.buildingView.selectedIndex].text;
	
	this.centerSelectedBuilding();
	
	if(this.buildingView.selectedIndex > 0){
		this.setData(this.buildingInput, this.selectedBuilding);
	}
};

OSMHell.prototype.centerSelectedBuilding = function(){
	var bk = this.getSelectedBuildingKey();
	if(this.coordsCache[bk]){
		this.centerMap(this.coordsCache[bk]);
	}
	else{
		this.loadBuildingCenter();
	}
};

OSMHell.prototype.loadBuildingCenter = function(){
	$.ajax(OSMHell.API_URL, {
		data: {'action':'centroid', 'get' : 'house', 'city' : this.selectedCity, 'street' : this.selectedStreet, 'house' : this.selectedBuilding},
		context : window.osmhell
	}).done(function ( data ) {
		var lonLat = $.parseJSON(data);
		var bk = this.getSelectedBuildingKey();
		this.coordsCache[bk] = lonLat;
		this.centerMap(this.coordsCache[bk]);
	});
};

OSMHell.prototype.getSelectedBuildingKey = function(){
	return this.selectedCity + this.selectedStreet + this.selectedBuilding;
};

OSMHell.prototype.centerMap = function(data){
	var lonlat = data['data'][0];
	hell.map.setView(new L.LatLng(lonlat.lat, lonlat.lon), 17);
	
	this.setData(this.lonInput, lonlat.lon);
	this.setData(this.latInput, lonlat.lat);
};

OSMHell.prototype.connectToForm = function(formId){
	
	if($('#city_chouse', formId).length == 0 && this.cityView == null){
		this.createFields(formId);
		this.bindEvents(formId);
		this.refreshCitiesView();
	}
	else {
		this.bindEvents(formId);
	}
	
	this.fillFormFields();
	
};

OSMHell.prototype.bindEvents = function(formId){
	
	this.cityView = $('#city_chouse', formId)[0];
	this.streetView = $('#street_chouse', formId)[0];
	this.buildingView = $('#bldng_chouse', formId)[0];

	this.cityInput = $('#city', formId)[0];
	this.streetInput = $('#street', formId)[0];
	this.buildingInput = $('#house', formId)[0];
	
	var thisClosure = this;
	$(this.cityView).bind('change', function(evnt){thisClosure.cityChange.apply(thisClosure, [evnt]);});
	$(this.streetView).bind('change', function(evnt){thisClosure.streetChange.apply(thisClosure, [evnt]);});
	$(this.buildingView).bind('change', function(evnt){thisClosure.buildingChange.apply(thisClosure, [evnt]);});
	
	this.lonInput = $('#lon', formId)[0];
	this.latInput = $('#lat', formId)[0];
	
	return;
};

OSMHell.prototype.createFields = function(formId){
	var table = $('#TblGrid_tabt', formId);
	var rows=$('tr', table);
	
	for(var i=0; i < rows.length; i++){
		var row = rows[i];
		
		if(row.id == 'tr_city'){
			$('.DataTD', row).after('<td class="support"><select class="help-select FormElement ui-widget-content ui-corner-all" id="city_chouse"></select></td>');
		}
		else if(row.id == 'tr_street'){
			$('.DataTD', row).after('<td class="support"><select class="help-select FormElement ui-widget-content ui-corner-all" id="street_chouse"></select></td>');
		}
		else if(row.id == 'tr_house'){
			$('.DataTD', row).after('<td class="support"><select class="help-select FormElement ui-widget-content ui-corner-all" id="bldng_chouse"></select></td>');
		}
		else{
			$('.DataTD', row).after('<td class="support"></td>');
		}
	}
	
};

OSMHell.prototype.setData = function(input, data){
	if(input){
		input.value = data;
	}
};

OSMHell.prototype.resetStreetView = function(){
	if(this.streetView){
		this.streetView.selectedIndex = 0;
	}
	
	this.resetBuildingView();
};

OSMHell.prototype.resetBuildingView = function(){
	if(this.buildingView){
		this.buildingView.selectedIndex = 0;
	}
};

OSMHell.prototype.fillFormFields = function(){
	
	if(this.cityInput.value == "" && this.selectedCity != null){
		this.setData(this.cityInput, this.selectedCity);
		
		if(this.streetInput.value == "" && this.selectedStreet != null){
			this.setData(this.streetInput, this.selectedStreet);
			
			if(this.buildingInput.value == "" && this.selectedBuilding != null){
				this.setData(this.buildingInput, this.selectedBuilding);
			}
		}
	}
	else if(this.cityInput && this.cityInput.value != null && this.cities[this.cityInput.value] != null){
		this.selectedCity = this.cities[this.cityInput.value].name;
		this.refreshStreetsData(function(){
			
			this.select(this.selectedCity, this.cityView);
			
			if(this.streetInput && this.streetInput.value != null && this.cities[this.selectedCity].streets[this.streetInput.value] != null){
				this.selectedStreet = this.cities[this.selectedCity].streets[this.streetInput.value].name;
				this.refreshBuildingsData(function(){
					this.select(this.selectedStreet, this.streetView);
					
					if(this.buildingInput && this.buildingInput.value && $.inArray(this.buildingInput.value, this.cities[this.selectedCity].streets[this.streetInput.value].buildings) >= 0){
						this.selectedBuilding = this.buildingInput.value;
						this.select(this.selectedBuilding, this.buildingView);
						this.centerSelectedBuilding();
					}
				}, this);
			}
			else{
				this.resetBuildingView();
			}
		}, this);
	}
	else{
		this.resetStreetView();	
	}
};

OSMHell.prototype.select = function(value, sinp){
	var options = $('option', sinp);
	for(var i = 0; i < options.length; i++ ){
		if(options[i].text == value){
			sinp.selectedIndex = i;
			break;
		}
	}
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
