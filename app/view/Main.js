Ext.define('SeptaMobi.view.Main', {
    extend: 'Ext.tab.Panel',
    xtype: 'main',
    requires: [
        'SeptaMobi.view.Dashboard',
        'SeptaMobi.view.tripplanner.NavView',
        'SeptaMobi.view.schedule.NavView',
        'SeptaMobi.view.stops.NavView',
        'SeptaMobi.view.TripTplTemp',
        'Ext.TitleBar',
        'SeptaMobi.view.extras.NavView'
    ],

    config: {
        tabBarPosition: 'bottom',

        tabBar: {
            defaults: {
                flex: 1
            }
        },

        items: [{
            title: 'Dashboard',
            iconCls: 'tab-dashboard',
            xtype: 'dashboard'
        }, {
            title: 'Nearby',
            iconCls: 'tab-stops',
            xtype: 'stops-navview'
        }, {
            title: 'Schedule',
            iconCls: 'tab-schedule',
            xtype: 'schedule-navview'
        }, {
            title: 'Trip Planner',
            iconCls: 'tab-trip-planner',
            xtype: 'tripplanner'
        },{
            title: 'Extras',
            iconCls: 'tab-token',
            xtype: 'extrasview'
        }]
    }
}); 