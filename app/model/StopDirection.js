Ext.define('SeptaMobi.model.StopDirection', {
    extend: 'Ext.data.Model',

    config: {
        fields: [{
			name: 'routeId',
			type: 'string'
		}, {
            name: 'name',
            type: 'string'
        }, {
            name: 'direction',
            type: 'int'
        }]
    }
});
