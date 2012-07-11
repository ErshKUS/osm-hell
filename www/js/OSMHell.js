OSMHell = function OSMHell(city, street, building){
	this.cityView = city;
	this.streetView = street;
	this.buildingView = building;
	
	this.cities = {};
	
	var thisClosure = this;
	$(this.cityView).bind('change', function(evnt){thisClosure.cityChange.apply(thisClosure, [evnt])});
	$(this.streetView).bind('change', function(evnt){thisClosure.streetChange.apply(thisClosure, [evnt])});
	$(this.buildingView).bind('change', function(evnt){thisClosure.buildingChange.apply(thisClosure, [evnt])});
	
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
	if(json && json.rows){
		for(var i in json.rows){
			this.addCity(json.rows[i].name);
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
	
	for(var i in json.rows){
		this.addStreet(json.rows[i].name, city);
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
	
	for(var i in json.rows){
		this.addBuilding(json.rows[i].name, city, street);
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



