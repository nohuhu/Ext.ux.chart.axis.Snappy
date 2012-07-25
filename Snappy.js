/*
 * This is an attempt at creating numeric chart Axis with predictable placement
 * of major ticks. Axis ends are calculated based on user provided min and max
 * values, snapping at the nearest logical (or sometimes not) points.
 *
 * Usage: like ordinary Axis, except min and max values should be set explicitly.
 * See demo application for more details.
 *
 * Version 0.99, compatible with Ext JS 4.1.1.
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

Ext.define('Ext.ux.chart.axis.Snappy', {
    extend: 'Ext.chart.axis.Numeric',
    alternateClassName: 'Ext.chart.SnappyAxis',
    alias: 'axis.snappy',
    
    requires: [ 'Ext.util.Format' ],
    
    // Used to control parameters explicitly
    power: false,
    steps: false,
    step:  false,
    
    constructor: function(config) {
        var me = this;
        
        me.callParent(arguments);
        
        // Forged identity to make mom think I'm her kid! Heh, heh.
        me.type = 'Numeric';
    },
    
    /**
     * @private
     * Creates a structure with start, end and step points. Tries hard to
     * place the labels so that they look über pikaboo.
     *
     * Note that part of being predictable is to rely on user to set
     * minimum and maximum values explicitly.
     */
    calcEnds: function() {
        var me = this,
            min, max, diff, power, step;
            
        if ( Ext.isNumber(me.majorTickSteps) ) {    // Signal to back off
            return me.callParent(arguments);
        };
    
        diff = me.calcAxisDiff();
        
        if ( isNaN(diff) || diff === 0 ) {
            return {
                from:  0,
                to:    0,
                power: 0,
                step:  0,
                steps: 0
            };
        };
        
        if ( me.power && me.steps && me.step ) {    // In user we trust
            return {
                from:  me.minimum,
                to:    me.maximum,
                power: me.power,
                steps: me.steps,
                step:  me.step
            };
        };
        
        // JS doesn't have list context. Yuck.
        var powst = me.calcPowerStep(diff);
        power = powst.power;
        step  = powst.step;
        
        me.minimum = min = me.customRound(me.minimum, power, step);
        me.maximum = max = me.customRound(me.maximum, power, step);
        
        // Honor minimum/maximum adjustment instructions
        me.minimum -= (me.adjustMinimumByMajorUnit ? step : 0);
        me.maximum += (me.adjustMaximumByMajorUnit ? step : 0);
                
        // Recalc the diff
        diff = me.calcAxisDiff();
        
        // Now see how many steps can be stuffed into a diff
        steps = Ext.util.Format.round( diff / step, 0 );

        return {
            from:  min,
            to:    max,
            power: power,      // Is it ever used anywhere? Not clear on this one
            step:  step,
            steps: steps
        };
    },
    
    /**
     * @private
     * Returns difference between minimum and maximum allowed values on numeric axis.
     */
    calcAxisDiff: function() {
        var me = this,
            mabs = Math.abs,
            min, max, diff;
        
        min = me.minimum;
        max = me.maximum;
        
        diff = min < 0 && max < 0   ? mabs(max) - mabs(min)
             : min < 0 && max >= 0  ? max + mabs(min)
             : min >= 0 && max >= 0 ? max - min
             :                        0
             ;
        
        return diff;
    },
    
    /**
     * @private
     * Calculates power and step from difference between minimum and maximum
     * axis values.
     */
    calcPowerStep: function(diff) {
        var me = this,
            mpow = Math.pow,
            power, step;
        
        if ( diff > 3 ) {
        
            // I feel smart!
            var exp = Number(diff).toExponential(1).match(/^(\d\.\d)e([+-]\d+)$/);
            power = +exp[2];
            step  = +exp[1] > 5   ? mpow(10, power) 
                  : +exp[1] > 2   ? mpow(10, power - 1) * 5
                  : +exp[1] > 1.2 ? mpow(10, power - 1) * 2
                  : +exp[1] >= 1  ? mpow(10, power - 1)
                  :                 mpow(10, power - 1) / 2
                  ;
        }
        else {              // Special case
            power = 1;
            step  = 0.5;
        };
        
        return { power: power, step: step };
    },
        
    /**
     * @private
     * Rounds value with specified power and step
     */
    customRound: function(value, power, step) {
        var negative, rounded;
        
        // Ugh. This is WIP so that should suffice for now.
        negative = value > 0 ? false : true,
        value    = Math.abs(value);
        rounded  = Ext.util.Format.round(value, -power);    // Power turned off on purpose
        
        if ( rounded > value ) {
            while ( (rounded - step) >= value ) {
                rounded -= step;
            };
        }
        else if ( rounded < value ) {
            while ( (rounded + step) < value ) {
                rounded += step;
            };
            rounded = rounded + step;
        };
        // Else rounded == value
        
        return negative ? -rounded : rounded;
    }
});