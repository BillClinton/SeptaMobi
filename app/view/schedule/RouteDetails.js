Ext.define('SeptaMobi.view.schedule.RouteDetails', {
	extend: 'Ext.tab.Panel',
	xtype: 'schedule-routedetails',
	requires: [
	   'Jarvus.touch.ux.LeafletMap'
	],

	config: {
		// stops: null,
		stopMarkers: [],
		encodedPoints: [],
		routePolyLine: null,
		busMarkers: [],

		title: 'Route Details',
		cls: 'schedule',
		items: [{
			xtype: 'dataview',
			title: 'Stops',
			cls: 'list-style',
			itemTpl: [
				'<div>',
					'<span>{name}</span>',
				'</div>'
			],
			store: 'Stops'
		}, {
			xtype: 'leafletmap',
			title: 'Map',
	        tileLayerOptions: { detectRetina: true},
			useCurrentLocation: true,
			autoMapCenter: false,
			enableOwnPositionMarker: true,
			mapOptions: {
				zoom: 15
			}
		}]
	},
	
	// updateStops: function(stops) {
	// 	var data = Ext.Array.map(stops.getRange(), function(r) { return r.getData(); });

	// 	this.down('dataview').setData(data);
	// },

	removeBusMarkers: function() {
		var mapCmp = this.down('leafletmap'),
			map = mapCmp.getMap(),
			busMarkers = this.getBusMarkers(),
			marker;

		while(marker = busMarkers.pop()) {
			map.removeLayer(marker);
		}
	}
});