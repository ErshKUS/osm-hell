OSMHell = function OSMHell(){
	
	OSMHell.API_URL = hell.p.urlsearch + '/searchselect';

	this.cityView = null;
	this.streetView = null;
	this.buildingView = null;
	
	this.cities = {};
	
	this.coordsCache = {};
};

OSMHell.prototype.loadCityes = function(json){
	loadData({'action':'addrselect', 'get' : 'city'}, window.osmhell, this.loadCityesCallback);
};

OSMHell.prototype.loadCityesCallback = function ( data ) {
	this.applyCityes($.parseJSON(data));
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
		loadData({'action':'addrselect', 'get' : 'street', 'city' : this.selectedCity}, window.osmhell, function(data){
			this.refreshStreetsDataCallback(data, cityClosure);
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

OSMHell.prototype.refreshStreetsDataCallback = function (data, city) {
	this.applyStreets($.parseJSON(data), city);
	this.refreshStreetsView();
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
		loadData({'action':'addrselect', 'get' : 'house', 'city' : this.selectedCity, 'street' : this.selectedStreet}, window.osmhell, function(data){
			this.refreshBuildingsDataCallback(data, cityClosure, streetClosure);
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

OSMHell.prototype.refreshBuildingsDataCallback = function(data, city, street){
	this.applyBuildings($.parseJSON(data), city, street);
	this.refreshBuildingsView();
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
		this.centerMapData(this.coordsCache[bk]);
	}
	else{
		this.loadBuildingCenter();
	}
};

OSMHell.prototype.loadBuildingCenter = function(){
	$.ajax(OSMHell.API_URL, {
		data: {'action':'centroid', 'get' : 'house', 'city' : this.selectedCity, 'street' : this.selectedStreet, 'house' : this.selectedBuilding},
		context : window.osmhell
	}).done(this.loadBuildingCenterCallback);
};

OSMHell.prototype.loadBuildingCenterCallback = function(data){
	var lonLat = $.parseJSON(data);
	var bk = this.getSelectedBuildingKey();
	this.coordsCache[bk] = lonLat;
	this.centerMapData(this.coordsCache[bk]);
};



OSMHell.prototype.getSelectedBuildingKey = function(){
	return this.selectedCity + this.selectedStreet + this.selectedBuilding;
};

OSMHell.prototype.centerMapData = function(data){
	var lonlat = data['data'][0];
	if(hell && hell.map){
		hell.map.setView(new L.LatLng(lonlat.lat, lonlat.lon), 17);
	}
	
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
	this.formActive = true;
	
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

OSMHell.prototype.hideOverlay = function(){
	var overlay = $('.ui-widget-overlay')[0];
	if(overlay){
		overlay.style.zIndex = 0;
	}
};

OSMHell.prototype.attachMap = function(map){
	var thisClosure = this;
	if(map){
		map.on('click', function(e){
			thisClosure.mapClick.apply(thisClosure, [e]);
		});
	}
};

OSMHell.prototype.mapClick = function(e){
	if(this.formActive){
		var latlng = e.latlng;
		this.setData(this.latInput, latlng.lat);
		this.setData(this.lonInput, latlng.lng);
		if(hell && hell.map){
			hell.map.setView(latlng, 17);
		}
	}
};

function loadData(params, context, cb){
//	$.ajax(OSMHell.API_URL, {
//		data: params,
//		'context' : context
//	}).done(cb);
	
	jsonp.fetch(OSMHell.API_URL + '?' + jQuery.param(params) + '&' + '&callback=JSONPCallback', function(answer){cb.apply(context, [answer]);});
}

var jsonp = {
    callbackCounter: 0,

    fetch: function(url, callback) {
        var fn = 'JSONPCallback_' + this.callbackCounter++;
        window[fn] = this.evalJSONP(callback);
        url = url.replace('=JSONPCallback', '=' + fn);

        var scriptTag = document.createElement('SCRIPT');
        scriptTag.charset='utf8';
        scriptTag.src = url;
        document.getElementsByTagName('HEAD')[0].appendChild(scriptTag);
    },

    evalJSONP: function(callback) {
        return function(data) {
        	callback(data);
        };
    }
};