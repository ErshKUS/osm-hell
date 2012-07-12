OSMHell = function OSMHell(){
	this.cityView = null;
	this.streetView = null;
	this.buildingView = null;
	
	this.cities = {};
	
	this.coordsCache = {};
};

OSMHell.API_URL = 'http://ersh.homelinux.com:8090/api/searchselect';

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

OSMHell.prototype.refreshStreetsData = function(){
	
	if(!this.cities[this.selectedCity].loaded){
		var cityClosure = this.selectedCity;
		$.ajax(OSMHell.API_URL, {
			data: {'action':'addrselect', 'get' : 'street', 'city' : this.selectedCity},
			context : window.osmhell
		}).done(function ( data ) {
			this.applyStreets($.parseJSON(data), cityClosure);
			this.refreshStreetsView();
		});
	} else {
		this.refreshStreetsView();
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

OSMHell.prototype.refreshBuildingsData = function(){
	
	if(!this.cities[this.selectedCity].streets[this.selectedStreet].loaded){
		var cityClosure = this.selectedCity;
		var streetClosure = this.selectedStreet;
		$.ajax(OSMHell.API_URL, {
			data: {'action':'addrselect', 'get' : 'house', 'city' : this.selectedCity, 'street' : this.selectedStreet},
			context : window.osmhell
		}).done(function ( data ) {
			this.applyBuildings($.parseJSON(data), cityClosure, streetClosure);
			this.refreshBuildingsView();
		});
	} else {
		this.refreshBuildingsView();
	}
	
};

OSMHell.prototype.applyBuildings = function(json, city, street){
	
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
	
	var bk = this.getSelectedBuildingKey();
	if(this.coordsCache[bk]){
		this.centerMap(this.coordsCache[bk]);
	}
	else{
		this.loadBuildingCenter();
	}
	
	if(this.buildingView.selectedIndex > 0){
		this.setData(this.buildingInput, this.selectedBuilding);
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

OSMHell.prototype.centerMap = function(lonlat){
	if(console && console.log){
		console.log(lonlat);
	}
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
	
	return;
};

OSMHell.prototype.createFields = function(formId){
	var table = $('#TblGrid_tab', formId);
	var rows=$('tr', table);
	
	for(var i=0; i < rows.length; i++){
		var row = rows[i];
		
		if(row.id == 'tr_city'){
			$('.DataTD', row).after('<td class="support"><select class="help-select FormElement ui-widget-content" id="city_chouse"></select></td>');
		}
		else if(row.id == 'tr_street'){
			$('.DataTD', row).after('<td class="support"><select class="help-select FormElement ui-widget-content" id="street_chouse"></select></td>');
		}
		else if(row.id == 'tr_house'){
			$('.DataTD', row).after('<td class="support"><select class="help-select FormElement ui-widget-content" id="bldng_chouse"></select></td>');
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


