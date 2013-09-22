Ext.define('SeptaMobi.controller.TripPlanner', {
	extend: 'Ext.app.Controller',

	requires: [
		'Ext.util.Geolocation',
		'SeptaMobi.API'
	],

	config: {
		toAddress: null,
		fromAddress: null,
		tripData: null,

		views: [
			'TripPlanner.NavView',
			'TripPlanner.SelectAddress',
			'TripPlanner.TripDetail',
			'TripPlanner.TripList'
		],
		stores: [
			'AutocompleteAddress',
			'Itineraries'
		],
		refs: {
			tripPlannerView: 'tripplanner',
			fromField: 'tripplanner #fromField',
			toField: 'tripplanner #toField',
			fromUseCurrent: 'tripplanner #fromUseCurrent',
			toUseCurrent: 'tripplanner #toUseCurrent',
			tripPlannerDatetimeField: 'tripplanner datetimepickerfield',
			selectAddressPanel: {
				selector: 'selectaddresspanel',
				autoCreate: true,

				xtype: 'selectaddresspanel'
			},
			tripList: {
				selector: 'triplist',
				autoCreate: true,

				xtype: 'triplist'
			},
			tripDetail: {
				selector: 'tripdetail',
				autoCreate: true,

				xtype: 'tripdetail'
			},
			tripDetailMap: 'tripdetail leafletmap'
		},
		control: {
			'tripplanner #fromField': {
				focus: 'onAddressFieldFocus',
				keyup: 'onAddressFieldKeyUp'
			},
			'tripplanner #toField': {
				focus: 'onAddressFieldFocus',
				keyup: 'onAddressFieldKeyUp'
			},
			'tripplanner #fromUseCurrent': {
				tap: 'onUseCurrentTap'
			},
			'tripplanner #toUseCurrent': {
				tap: 'onUseCurrentTap'
			},
			'tripplanner button[action=reverse]': {
				tap: 'onReverseTap'
			},
			'tripplanner button[action=route]': {
				tap: 'onRouteTap'
			},
			'selectaddresspanel button[action=cancel]': {
				tap: 'onSelectAddressPanelCancelTap'
			},
			'selectaddresspanel dataview': {
				select: 'onSelectAddressPanelAddressSelect'
			},
			'triplist dataview': {
				select: 'onTripSelect'
			},
			'tripdetail leafletmap': {
				maprender: 'onTripDetailMapRender'
			}
		}
	},

	onAddressFieldFocus: function(field) {
		var me = this,
			autocompleteAddressStore = Ext.getStore('AutocompleteAddress'),
			selectAddressPanel = me.getSelectAddressPanel();

		autocompleteAddressStore.getProxy().setExtraParam('prefix', field.getValue());
		autocompleteAddressStore.load();

		selectAddressPanel.setField(field);
		selectAddressPanel.showBy(field);
	},

	onAddressFieldKeyUp: function(field) {
		var me = this,
			autocompleteAddressStore = Ext.getStore('AutocompleteAddress');

		autocompleteAddressStore.getProxy().setExtraParam('prefix', field.getValue());
		autocompleteAddressStore.load();
	},

	onUseCurrentTap: function(checkButton) {
		var me = this,
			newValue = checkButton.getCls().indexOf('x-pressed') == -1,
			fromCheckButton = me.getFromUseCurrent(),
			fromTextField = me.getFromField(),
			toCheckButton = me.getToUseCurrent(),
			toTextField = me.getToField(),
			otherCheckButton, textField, otherTextField;

		if (checkButton == fromCheckButton) {
			otherCheckButton = toCheckButton;
			textField = fromTextField;
			otherTextField = toTextField;
		} else if (checkButton == toCheckButton) {
			otherCheckButton = fromCheckButton;
			textField = toTextField;
			otherTextField = fromTextField;
		}
		
		if (newValue) {
			checkButton.addCls('x-pressed');
			otherCheckButton.removeCls('x-pressed');
			textField.setValue('Current Location');
			textField.disable();
			
			if (otherTextField.isDisabled()) {
				otherTextField.enable();
				otherTextField.setValue('');
			}
		} else {
			checkButton.removeCls('x-pressed');
			textField.setValue('');
			textField.enable();
		}

		if (!me.geo) {
			me.geo = Ext.create('Ext.util.Geolocation', {
				autoUpdate: false,
				listeners: {
					locationupdate: function(geo) {
						me[checkButton == fromCheckButton ? 'setFromAddress' : 'setToAddress'](Ext.create('SeptaMobi.model.Address', {
							lat: geo.getLatitude(),
							lon: geo.getLongitude(),
							text: 'Current Location'
						}));
					},
					locationerror: function(geo, bTimeout, bPermissionDenied, bLocationUnavailable, message) {
						if (bTimeout) {
							alert('Timeout occurred.');
						} else {
							alert('Error occurred.');
						}
					}
				}
			});
		}

		me.geo.updateLocation();
	},

	onReverseTap: function() {
		var me = this,
			fromField = me.getFromField(),
			toField = me.getToField(),
			toUseCurrent = me.getToUseCurrent(),
			fromUseCurrent = me.getFromUseCurrent(),
			originalFromAddress = me.getFromAddress(),
			originalFromValue = fromField.getValue(),
			originalFromUseCurrentValue = fromUseCurrent.getChecked();

		fromField.setValue(toField.getValue());
		fromUseCurrent.setChecked(toUseCurrent.getChecked());

		toField.setValue(originalFromValue);
		toUseCurrent.setChecked(originalFromUseCurrentValue);

		me.setFromAddress(me.getToAddress());
		me.setToAddress(originalFromAddress);
	},

	onRouteTap: function() {
		var me = this,
			fromAddress = me.getFromAddress(),
			toAddress = me.getToAddress(),
			tripPlannerView = me.getTripPlannerView(),
			tripPlannerDatetimeField = me.getTripPlannerDatetimeField(),
			departTime = tripPlannerDatetimeField.getValue(),
			tripList = me.getTripList(),
			itinerariesStore = Ext.getStore('Itineraries'),
			tripPlan, lat, lon;

		//Validate
		if (!fromAddress) {
			Ext.Msg.alert('Please enter a valid from address');
			return;
		}
		if (!toAddress) {
			Ext.Msg.alert('Please enter a valid from address');
			return;
		}

		if (!me.validateAddress(fromAddress)) {
			tripPlannerView.setMasked(false);
			return;
		}
		if (!me.validateAddress(toAddress)) {
			tripPlannerView.setMasked(false);
			return;
		}

		tripPlannerView.setMasked({
			xtype: 'loadmask',
			message: 'Loading Routes&hellip;'
		});

		SeptaMobi.API.getDirections(fromAddress, toAddress, departTime, function(options, success, response) {
			if (success) {
				tripPlan = {
					toName: toAddress.get('text'),
					fromName: fromAddress.get('text'),
					departTime: departTime
				};
				
				tripList.setTripPlan(tripPlan);		
				
				me.setTripData(tripPlan);

				itinerariesStore.setData(response.data.plan.itineraries);
				
				tripPlannerView.push(tripList);
			} else {
				Ext.Msg.alert('Could not load directions, please try again later');
				//TODO Deal with error
			}
			tripPlannerView.setMasked(false);
		});
	},

	validateAddress: function(address) {
		var me = this,
			tripPlannerView = me.getTripPlannerView(),
			data;

		if (!address.get('lat') || !address.get('lon')) {
			tripPlannerView.setMasked({
				xtype: 'loadmask',
				message: 'Geocoding Address&hellip;'
			});

			SeptaMobi.API.getGeocode(address, function(options, success, response) {
				if (success && response.data && response.data.length > 0 && response.data[0].metadata.latitude &&
					response.data[0].metadata.longitude) {
					data = response.data[0]; 

					lat = data.metadata.latitude;
					lon = data.metadata.longitude;

					address.set('lon', lon);
					address.set('lat', lat);
					address.set('text', data.delivery_line_1 + ", " + data.last_line);

					me.onRouteTap();
				} else {
					Ext.Msg.alert('Could not geocode from address: ' + address.get('text'));
				}
			}, me);

			return false;
		}
		return true;
	},

	onSelectAddressPanelCancelTap: function() {
		this.getSelectAddressPanel().hide();
	},

	onSelectAddressPanelAddressSelect: function(dataview, record) {
		var me = this,
			selectAddressPanel = me.getSelectAddressPanel(),
			selectAddressPanelField = selectAddressPanel.getField(),
			toField = me.getToField(),
			fromField = me.getFromField();

		if (selectAddressPanelField) {
			selectAddressPanelField.setValue(record.get('text'));

			if (selectAddressPanelField == toField) {
				me.setToAddress(record);
			} else if (selectAddressPanelField == fromField) {
				me.setFromAddress(record);
			}
		}

		me.getSelectAddressPanel().hide();
	},

	onTripSelect: function(list, record, eOpts) {
		var me = this,
			tripPlannerView = me.getTripPlannerView(),
			tripDetail = me.getTripDetail(),
			tripData = me.getTripData();

		tripData.duration = record.get('duration');

		record.set('fromName', tripData.fromName);
		record.set('toName', tripData.toName);
		
		tripDetail.setTripData(tripData, record);
		tripPlannerView.push(tripDetail);
	},

	onTripDetailMapRender: function() {
		var me = this,
			mapCmp = me.getTripDetailMap(),
			map = mapCmp.getMap(),
			tripDetail = me.getTripDetail(),
			itenerary = tripDetail.getItenerary(),
			legsLength = itenerary.legs.length,
			i = 0, startPoint, markers = [], decodedPoints;

		for(; i < legsLength; i++) {
			decodedPoints = mapCmp.decode(itenerary.legs[i].legGeometry.points);
			markers.push(L.polyline(decodedPoints).addTo(map));
			if(i == 0) {
				startPoint = decodedPoints[0]
			}
		}

		tripDetail.setCurrentMarkers(markers);

		Ext.defer(function() {
			map.panTo(startPoint);
		}, 1000, me);
	}
});