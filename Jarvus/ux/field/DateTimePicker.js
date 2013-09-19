/**
 * @aside guide forms
 *
 * This is a specialized field which shows a {@link Jarvus.ux.picker.DateTime} when tapped. If it has a predefined value,
 * or a value is selected in the {@link Jarvus.ux.picker.DateTime}, it will be displayed like a normal {@link Ext.field.Text}
 * (but not selectable/changable).
 *
 *     Ext.create('Ext.ux.field.DateTimePicker', {
 *         label: 'Birthday',
 *         value: new Date()
 *     });
 *
 * {@link Ext.ux.field.DateTimePicker} fields are very simple to implement, and have no required configurations.
 *
 * ## Examples
 *
 * It can be very useful to set a default {@link #value} configuration on {@link Ext.ux.field.DateTimePicker} fields. In
 * this example, we set the {@link #value} to be the current date. You can also use the {@link #setValue} method to
 * update the value at any time.
 *
 *     @example miniphone preview
 *     Ext.create('Ext.form.Panel', {
 *         fullscreen: true,
 *         items: [
 *             {
 *                 xtype: 'fieldset',
 *                 items: [
 *                     {
 *                         xtype: 'datetimepickerfield',
 *                         label: 'Birthday',
 *                         name: 'birthday',
 *                         value: new Date()
 *                     }
 *                 ]
 *             },
 *             {
 *                 xtype: 'toolbar',
 *                 docked: 'bottom',
 *                 items: [
 *                     { xtype: 'spacer' },
 *                     {
 *                         text: 'setValue',
 *                         handler: function() {
 *                             var datetimepickerfield = Ext.ComponentQuery.query('datetimepickerfield')[0];
 *
 *                             var randomNumber = function(from, to) {
 *                                 return Math.floor(Math.random() * (to - from + 1) + from);
 *                             };
 *
 *                             datetimepickerfield.setValue({
 *                                 month: randomNumber(0, 11),
 *                                 day  : randomNumber(0, 28),
 *                                 year : randomNumber(1980, 2011)
 *                             });
 *                         }
 *                     },
 *                     { xtype: 'spacer' }
 *                 ]
 *             }
 *         ]
 *     });
 *
 * When you need to retrieve the date from the {@link Ext.ux.field.DateTimePicker}, you can either use the {@link #getValue} or
 * {@link #getFormattedValue} methods:
 *
 *     @example preview
 *     Ext.create('Ext.form.Panel', {
 *         fullscreen: true,
 *         items: [
 *             {
 *                 xtype: 'fieldset',
 *                 items: [
 *                     {
 *                         xtype: 'datetimepickerfield',
 *                         label: 'Birthday',
 *                         name: 'birthday',
 *                         value: new Date()
 *                     }
 *                 ]
 *             },
 *             {
 *                 xtype: 'toolbar',
 *                 docked: 'bottom',
 *                 items: [
 *                     {
 *                         text: 'getValue',
 *                         handler: function() {
 *                             var datetimepickerfield = Ext.ComponentQuery.query('datetimepickerfield')[0];
 *                             Ext.Msg.alert(null, datetimepickerfield.getValue());
 *                         }
 *                     },
 *                     { xtype: 'spacer' },
 *                     {
 *                         text: 'getFormattedValue',
 *                         handler: function() {
 *                             var datetimepickerfield = Ext.ComponentQuery.query('datetimepickerfield')[0];
 *                             Ext.Msg.alert(null, datetimepickerfield.getFormattedValue());
 *                         }
 *                     }
 *                 ]
 *             }
 *         ]
 *     });
 *
 *
 */

Ext.define('Jarvus.ux.field.DateTimePicker', {
    extend: 'Ext.field.Text',
    alternateClassName: 'Ext.form.DateTimePicker',
    xtype: 'datetimepickerfield',
    requires: [
        'Jarvus.ux.picker.DateTime',
        'Ext.DateExtras'
    ],

    /**
     * @event change
     * Fires when a date is selected
     * @param {Ext.ux.field.DateTimePicker} this
     * @param {Date} date The new date
     */

    config: {
        ui: 'select',

        /**
         * @cfg {Object/Jarvus.ux.picker.DateTime} picker
         * An object that is used when creating the internal {@link Jarvus.ux.picker.DateTime} component or a direct instance of {@link Jarvus.ux.picker.DateTime}
         * Defaults to true
         * @accessor
         */
        picker: true,

        /**
         * @cfg {Boolean}
         * @hide
         * @accessor
         */
        clearIcon: false,

        /**
         * @cfg {Object/Date} value
         * Default value for the field and the internal {@link Jarvus.ux.picker.DateTime} component. Accepts an object of 'year',
         * 'month' and 'day' values, all of which should be numbers, or a {@link Date}.
         *
         * Example: {year: 1989, day: 1, month: 5} = 1st May 1989 or new Date()
         * @accessor
         */

        /**
         * @cfg {Boolean} destroyPickerOnHide
         * Whether or not to destroy the picker widget on hide. This save memory if it's not used frequently,
         * but increase delay time on the next show due to re-instantiation. Defaults to false
         * @accessor
         */
        destroyPickerOnHide: false,

        /**
         * @cfg {String} dateTimeFormat The format to be used when displaying the date in this field.
         * Accepts any valid datetime format. You can view formats over in the {@link Ext.Date} documentation.
         * Defaults to `Ext.util.Format.defaultDateFormat`.
         */
        dateTimeFormat: 'm/d/Y h:i:A',
        /**
         * @cfg {Object}
         * @hide
         */
        component: {
            useMask: true
        }
    },

    initialize: function() {
        this.callParent();

        this.getComponent().on({
            scope: this,

            masktap: 'onMaskTap'
        });

        this.getComponent().input.dom.disabled = true;
    },

    syncEmptyCls: Ext.emptyFn,

    applyValue: function(value) {
        if (!Ext.isDate(value) && !Ext.isObject(value)) {
            value = null;
        }

        if (Ext.isObject(value)) {
            value = new Date(value.year, value.month - 1, value.day,value.hour,value.minute);
        }

        return value;
    },

    updateValue: function(newValue) {
        var picker = this._picker;
        if (picker && picker.isPicker) {
            picker.setValue(newValue);
        }

        // Ext.Date.format expects a Date
        if (newValue !== null) {
            this.getComponent().setValue(Ext.Date.format(newValue, this.getDateTimeFormat() || Ext.util.Format.defaultDateFormat));
        } else {
            this.getComponent().setValue('');
        }

        if (this._picker && this._picker instanceof Jarvus.ux.picker.DateTime) {
            this._picker.setValue(newValue);
        }
    },

    /**
     * Updates the date format in the field.
     * @private
     */
    updateDateFormat: function(newDateFormat, oldDateFormat) {
        var value = this.getValue();
        if (newDateFormat != oldDateFormat && Ext.isDate(value) && this._picker && this._picker instanceof Jarvus.ux.picker.DateTime) {
            this.getComponent().setValue(Ext.Date.format(value, newDateFormat || Ext.util.Format.defaultDateFormat));
        }
    },

    /**
     * Returns the {@link Date} value of this field.
     * If you wanted a formated date
     * @return {Date} The date selected
     */
    getValue: function() {
        if (this._picker && this._picker instanceof Jarvus.ux.picker.DateTime) {
            return this._picker.getValue();
        }

        return this._value;
    },

    /**
     * Returns the value of the field formatted using the specified format. If it is not specified, it will default to
     * {@link #dateFormat} and then {@link Ext.util.Format#defaultDateFormat}.
     * @param {String} format The format to be returned
     * @return {String} The formatted date
     */
    getFormattedValue: function(format) {
        var value = this.getValue();

        return (Ext.isDate(value)) ? Ext.Date.format(value, format || this.getDateTimeFormat() || Ext.util.Format.defaultDateFormat) : value;
    },

    applyPicker: function(picker, pickerInstance) {
        if (pickerInstance && pickerInstance.isPicker) {
            picker = pickerInstance.setConfig(picker);
        }

        return picker;
    },

    getPicker: function() {
        var picker = this._picker,
            value = this.getValue();

        if (picker && !picker.isPicker) {
            picker = Ext.factory(picker, Jarvus.ux.picker.DateTime);
            picker.on({
                scope: this,
                cancel: 'onPickerCancel',
                change: 'onPickerChange',
                hide  : 'onPickerHide'
            });
            
            if (value !== null) {
                picker.setValue(value);
            }
            
            Ext.Viewport.add(picker);
            this._picker = picker;
        }

        return picker;
    },

    /**
     * @private
     * Listener to the tap event of the mask element. Shows the internal DatePicker component when the button has been tapped.
     */
    onMaskTap: function() {
        if (this.getDisabled()) {
            return false;
        }

        if (this.getReadOnly()) {
            return false;
        }

        this.getPicker().show();

        return false;
    },
    
    /**
     * @private
     * Revert internal date so field won't appear changed
     */
    onPickerCancel: function(picker, options) {
        this._picker = this._picker.config;
        picker.destroy();
        return true;
    },
    
    /**
     * Called when the picker changes its value
     * @param {Jarvus.ux.picker.DateTime} picker The date picker
     * @param {Object} value The new value from the date picker
     * @private
     */
    onPickerChange: function(picker, value) {
        var me = this;

        me.setValue(value);
        me.fireEvent('change', me, me.getValue());
    },

    /**
     * Destroys the picker when it is hidden, if
     * {@link Ext.ux.field.DateTimePicker#destroyPickerOnHide destroyPickerOnHide} is set to true
     * @private
     */
    onPickerHide: function() {
        var picker = this.getPicker();
        if (this.getDestroyPickerOnHide() && picker) {
            picker.destroy();
            this._picker = true;
        }
    },

    reset: function() {
        this.setValue(this.originalValue);
    },

    // @private
    destroy: function() {
        var picker = this.getPicker();

        if (picker && picker.isPicker) {
            picker.destroy();
        }

        this.callParent(arguments);
    }
    //<deprecated product=touch since=2.0>
}, function() {
    this.override({
        getValue: function(format) {
            if (format) {
                //<debug warn>
                Ext.Logger.deprecate("format argument of the getValue method is deprecated, please use getFormattedValue instead", this);
                //</debug>
                return this.getFormattedValue(format);
            }
            return this.callOverridden();
        }
    });

    /**
     * @method getDatePicker
     * @inheritdoc Ext.ux.field.DateTimePicker#getPicker
     * @deprecated 2.0.0 Please use #getPicker instead
     */
    Ext.deprecateMethod(this, 'getDatePicker', 'getPicker');
    //</deprecated>
});