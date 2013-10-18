Ext.define('SeptaMobi.view.schedule.RouteDirections', {
	extend: 'Ext.dataview.DataView',
	xtype: 'schedule-routedirections',

	config: {
		title: 'Route Directions',
		cls: 'list-style schedule',

		itemTpl: [
			'<div>',
			'<span>to {name}</span>',
			'</div>'
		]
	}
});