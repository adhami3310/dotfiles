const { Atk, Clutter, GObject, St } = imports.gi;
const BarLevel = imports.ui.barLevel;

var ModifiedBarLevel = GObject.registerClass({

}, class ModifiedBarLevel extends BarLevel.BarLevel {
    vfunc_repaint() {
        let cr = this.get_context();
        let themeNode = this.get_theme_node();
        let [width, height] = this.get_surface_size();
        let barLevelHeight = themeNode.get_length('-barlevel-height');
        let [hasBarLevelInactiveHeight, barLevelInactiveHeight] = themeNode.lookup_length('-barlevel-inactive-height', true);
        if (!hasBarLevelInactiveHeight) {
            barLevelInactiveHeight = barLevelHeight;
        }
        let barLevelBorderRadius = Math.min(width, barLevelHeight) / 2;
        let barLevelInactiveBorderRadius = Math.min(width, barLevelInactiveHeight) / 2;
        let fgColor = themeNode.get_foreground_color();

        let barLevelColor = themeNode.get_color('-barlevel-background-color');
        let barLevelActiveColor = themeNode.get_color('-barlevel-active-background-color');
        let barLevelOverdriveColor = themeNode.get_color('-barlevel-overdrive-color');

        let barLevelBorderWidth = Math.min(themeNode.get_length('-barlevel-border-width'), 1);
        let [hasBorderColor, barLevelBorderColor] =
            themeNode.lookup_color('-barlevel-border-color', false);
        if (!hasBorderColor)
            barLevelBorderColor = barLevelColor;
        let [hasActiveBorderColor, barLevelActiveBorderColor] =
            themeNode.lookup_color('-barlevel-active-border-color', false);
        if (!hasActiveBorderColor)
            barLevelActiveBorderColor = barLevelActiveColor;
        let [hasOverdriveBorderColor, barLevelOverdriveBorderColor] =
            themeNode.lookup_color('-barlevel-overdrive-border-color', false);
        if (!hasOverdriveBorderColor)
            barLevelOverdriveBorderColor = barLevelOverdriveColor;

        const TAU = Math.PI * 2;

        let endX = 0;
        if (this._maxValue > 0)
            endX = barLevelBorderRadius + (width - 2 * barLevelBorderRadius) * this._value / this._maxValue;

        let overdriveSeparatorX = barLevelBorderRadius + (width - 2 * barLevelBorderRadius) * this._overdriveStart / this._maxValue;
        let overdriveActive = this._overdriveStart !== this._maxValue;
        let overdriveSeparatorWidth = 0;
        if (overdriveActive)
            overdriveSeparatorWidth = themeNode.get_length('-barlevel-overdrive-separator-width');

        /* background bar */
        cr.arc(width - barLevelInactiveBorderRadius - barLevelBorderWidth, height / 2, barLevelInactiveBorderRadius, TAU * (3 / 4), TAU * (1 / 4));
        cr.lineTo(endX, (height + barLevelInactiveHeight) / 2);
        cr.lineTo(endX, (height - barLevelInactiveHeight) / 2);
        cr.lineTo(width - barLevelInactiveBorderRadius - barLevelBorderWidth, (height - barLevelInactiveHeight) / 2);
        Clutter.cairo_set_source_color(cr, barLevelColor);
        cr.fillPreserve();
        Clutter.cairo_set_source_color(cr, barLevelBorderColor);
        cr.setLineWidth(barLevelBorderWidth);
        cr.stroke();

        /* normal progress bar */
        let x = Math.min(endX, overdriveSeparatorX - overdriveSeparatorWidth / 2);
        cr.arc(barLevelBorderRadius + barLevelBorderWidth, height / 2, barLevelBorderRadius, TAU * (1 / 4), TAU * (3 / 4));
        cr.lineTo(x, (height - barLevelHeight) / 2);
        cr.lineTo(x, (height + barLevelHeight) / 2);
        cr.lineTo(barLevelBorderRadius + barLevelBorderWidth, (height + barLevelHeight) / 2);
        Clutter.cairo_set_source_color(cr, barLevelActiveColor);
        cr.fillPreserve();
        Clutter.cairo_set_source_color(cr, barLevelActiveBorderColor);
        cr.setLineWidth(barLevelBorderWidth);
        cr.stroke();

        /* overdrive progress barLevel */
        x = Math.min(endX, overdriveSeparatorX) + overdriveSeparatorWidth / 2;
        if (this._value > this._overdriveStart) {
            cr.moveTo(x, (height - barLevelHeight) / 2);
            cr.lineTo(endX, (height - barLevelHeight) / 2);
            cr.lineTo(endX, (height + barLevelHeight) / 2);
            cr.lineTo(x, (height + barLevelHeight) / 2);
            cr.lineTo(x, (height - barLevelHeight) / 2);
            Clutter.cairo_set_source_color(cr, barLevelOverdriveColor);
            cr.fillPreserve();
            Clutter.cairo_set_source_color(cr, barLevelOverdriveBorderColor);
            cr.setLineWidth(barLevelBorderWidth);
            cr.stroke();
        }

        if (this._value <= this._overdriveStart)
            Clutter.cairo_set_source_color(cr, barLevelActiveColor);
        else
            Clutter.cairo_set_source_color(cr, barLevelOverdriveColor);
        cr.arc(endX, height / 2, barLevelBorderRadius, TAU * (3 / 4), TAU * (1 / 4));
        cr.lineTo(Math.floor(endX), (height + barLevelHeight) / 2);
        cr.lineTo(Math.floor(endX), (height - barLevelHeight) / 2);
        cr.lineTo(endX, (height - barLevelHeight) / 2);
        cr.fillPreserve();
        cr.setLineWidth(barLevelBorderWidth);
        cr.stroke();

        /* draw overdrive separator */
        if (overdriveActive) {
            cr.moveTo(overdriveSeparatorX - overdriveSeparatorWidth / 2, (height - barLevelHeight) / 2);
            cr.lineTo(overdriveSeparatorX + overdriveSeparatorWidth / 2, (height - barLevelHeight) / 2);
            cr.lineTo(overdriveSeparatorX + overdriveSeparatorWidth / 2, (height + barLevelHeight) / 2);
            cr.lineTo(overdriveSeparatorX - overdriveSeparatorWidth / 2, (height + barLevelHeight) / 2);
            cr.lineTo(overdriveSeparatorX - overdriveSeparatorWidth / 2, (height - barLevelHeight) / 2);
            if (this._value <= this._overdriveStart)
                Clutter.cairo_set_source_color(cr, fgColor);
            else
                Clutter.cairo_set_source_color(cr, barLevelColor);
            cr.fill();
        }

        cr.$dispose();
    }
});