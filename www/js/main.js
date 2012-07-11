var hell={};

$(function(){
  map = new L.Map('map');
  var mapnik = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 18, attribution: "Map data &copy; <a href='http://osm.org'>OpenStreetMap</a> contributors"});
  
  var krymsk = new L.LatLng(44.915, 38.0);
  map.setView(krymsk, 13).addLayer(mapnik);
  
  window.osmhell = new OSMHell($('#city_select')[0], $('#street_select')[0], $('#building_select')[0]);
  window.osmhell.loadCityes();
  
  hell.inittab();
});


hell.inittab = function(){
  $("#tab").jqGrid({
      url:'http://ersh.homelinux.com:8092/api/data?action=getdata',
      datatype: "json",
      mtype: "POST",
      colNames:['','city','street','house','flat','contact','phone','required','info','condition_house'],
      colModel:[
        {name:'id', index:'id', hidden:true, key:true},
        {name:'city', index:'city', width:55, editable:true},
        {name:'street', index:'street', width:55, editable:true},
        {name:'house', index:'house', width:55, editable:true},
        {name:'flat', index:'flat', width:55, editable:true},
        {name:'contact', index:'contact', width:55, editable:true},
        {name:'phone', index:'phone', width:55, editable:true},
        {name:'required', index:'required', width:55, editable:true},
        {name:'info', index:'info', width:55, editable:true},
        {name:'condition_house', index:'condition_house', width:55, editable:true}
     ],
//      rowNum:30,
      width: 1500,
//      rowList:[30,70],
      pager: '#tab',
      sortname: 'id',
//      ignoreCase: true,
      pgbuttons: false,
      pginput: false,
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
}
