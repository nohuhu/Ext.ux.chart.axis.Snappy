/*
 * Ext.ux.chart.axis.Snappy demo application.
 *  
 * Copyright (C) 2011-2012 Alexander Tokarev.
 *  
 * This code is licensed under the terms of the Open Source LGPL 3.0 license.
 * Commercial use is permitted to the extent that the code/component(s) do NOT
 * become part of another Open Source or Commercially licensed development library
 * or toolkit without explicit permission.
 * 
 * License details: http://www.gnu.org/licenses/lgpl.html
 */

Ext.onReady(function () {
    var min = 0,
        max = 100,
        store = Ext.create('Ext.data.Store', {
        fields: [ 'name', 'data' ]
    });
    
    var generateData = function() {
        var random = Math.random,
            round  = Math.round,
            records;
        
        records = [
            { name: 'Field 0',  data: min + round( random() * (max - min) ) },
            { name: 'Field 1',  data: min + round( random() * (max - min) ) }
        ];
        
        store.loadData(records);
    };
    
    var panel = Ext.create('widget.panel', {
        width: 400,
        height: 300,
        renderTo: Ext.getBody(),
        position: 'absolute',
        x: 100,
        y: 100,
        layout: 'fit',
        tbar: [{
            xtype: 'button',
            text:  'Reload data',
            handler: generateData
        }],
        bbar: [{
            xtype: 'tbtext',
            text:  'Minimum:'
        }, {
            hideLabel: true,
            id: 'minField',
            xtype: 'textfield',
            width: 110,
            emptyText: 'Minimum value',
            listeners: {
                specialkey: function(field, event) {
                    if ( event.getKey() === event.ENTER ) {
                        Ext.getCmp('minmaxButton').handler('min');
                    };
                }
            }
        }, {
            hideLabel: true,
            id: 'maxField',
            xtype: 'textfield',
            width: 110,
            emptyText: 'Maximum value',
            listeners: {
                specialkey: function(field, event) {
                    if ( event.getKey() === event.ENTER ) {
                        Ext.getCmp('minmaxButton').handler('max');
                    };
                }
            }
        }, {
            id: 'minmaxButton',
            text: 'Set',
            handler: function(which) {
                var field, axis;
                
                field = which == 'min' ? Ext.getCmp('minField')
                      :                  Ext.getCmp('maxField')
                      ;
                      
                axis = chart.axes.getAt(1);
                
                which == 'min'         ? min = axis.minimum = +field.getValue()
                      :                  max = axis.maximum = +field.getValue()
                      ;
                
                generateData();
            }
        }],
        items: {
            xtype: 'chart',
            insetPadding: 5,
            store: store,
            theme: 'Base:gradients',
            animate: true,
            axes: [{
                position: 'bottom',
                fields:   [ 'name' ],
                type:     'Category'
            }, {
                position: 'left',
                fields:   [ 'data' ],
                type:     'Snappy',
                minimum: min,
                maximum: max
            }],
            series: [{
                type:   'column',
                axis:   'left',
                xField: 'name',
                yField: 'data',
                showInLegend: false,
                label: {
                    display: 'insideEnd',
                    'text-anchor': 'middle',
                    field: 'data',
                    renderer: Ext.util.Format.numberRenderer('0'),
                    orientation: 'horizontal',
                    color: '#333'
                }
            }]
        }
    });
    
    var chart = panel.down('chart');
    
    generateData();
});
