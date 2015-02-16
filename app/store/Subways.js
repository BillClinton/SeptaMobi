Ext.define('SeptaMobi.store.Subways', {
	extend: 'Ext.data.Store',
	requires: ['SeptaMobi.model.Route'],

	config: {
		model: 'SeptaMobi.model.Route',
		data: [{
			//id: 21442,
			id: 13890,
            route_type_slug: 'subways',
            route_id: "13890",
			route_long_name: 'Broad Street Line'
		}, {
			//id: 21442,
			id: 13891,
            route_type_slug: 'subways',
            route_id: "13891",
			route_long_name: 'Market-Frankford Line'
		}]
	}
});
