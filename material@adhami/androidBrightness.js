// -*- mode: js; js-indent-level: 4; indent-tabs-mode: nil -*-
/* exported Indicator */

const {Gio, Clutter, GObject} = imports.gi;
const { SystemIndicator} = imports.ui.quickSettings;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const iconAndroidQuickSlider = Me.imports.iconAndroidQuickSlider;
const {loadInterfaceXML} = imports.misc.fileUtils;

const BUS_NAME = 'org.gnome.SettingsDaemon.Power';
const OBJECT_PATH = '/org/gnome/SettingsDaemon/Power';

const BrightnessInterface = loadInterfaceXML('org.gnome.SettingsDaemon.Power.Screen');
const BrightnessProxy = Gio.DBusProxy.makeProxyWrapper(BrightnessInterface);

function iconFunction(cr, handleX, handleY, color) {
    Clutter.cairo_set_source_color(cr, color);
    cr.arc(handleX, handleY, 5, 0, 2 * Math.PI);
    cr.fill();
    for (let i = 0; i < 8; i += 1) {
        cr.setLineWidth(2);
        cr.setLineCap(1);
        cr.moveTo(handleX+Math.cos(i / 4 * Math.PI)*8,handleY+Math.sin(i / 4 * Math.PI)*8);
        cr.lineTo(handleX+Math.cos(i / 4 * Math.PI)*10,handleY+Math.sin(i / 4 * Math.PI)*10);
        cr.stroke();
    }
}

const AndroidBrightnessItem = GObject.registerClass(
class AndroidBrightnessItem extends iconAndroidQuickSlider.IconAndroidQuickSlider {
    _init() {
        super._init(iconFunction, {
            iconName: 'display-brightness-symbolic',
        });

        this._proxy = new BrightnessProxy(Gio.DBus.session, BUS_NAME, OBJECT_PATH,
            (proxy, error) => {
                if (error)
                    console.error(error.message);
                else
                    this._proxy.connect('g-properties-changed', () => this._sync());
                this._sync();
            });

        this._sliderChangedId = this.slider.connect('notify::value',
            this._sliderChanged.bind(this));
        this.slider.accessible_name = _('Brightness');
    }

    _sliderChanged() {
        const percent = this.slider.value * 100;
        this._proxy.Brightness = percent;
    }

    _changeSlider(value) {
        this.slider.block_signal_handler(this._sliderChangedId);
        this.slider.value = value;
        this.slider.unblock_signal_handler(this._sliderChangedId);
    }

    _sync() {
        const brightness = this._proxy.Brightness;
        const visible = Number.isInteger(brightness) && brightness >= 0;
        this.visible = visible;
        if (visible)
            this._changeSlider(this._proxy.Brightness / 100.0);
    }
});

var Indicator = GObject.registerClass(
class Indicator extends SystemIndicator {
    _init() {
        super._init();

        this.quickSettingsItems.push(new AndroidBrightnessItem());
    }
});

