/* exported QuickToggle, QuickMenuToggle, QuickSlider, QuickSettingsMenu, SystemIndicator */
const { GObject, St, Clutter, Gio, GLib, Shell, GnomeDesktop, UPowerGlib: UPower } = imports.gi;
const Config = imports.misc.config;
const Main = imports.ui.main;
const SystemActions = imports.misc.systemActions;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Mainloop = imports.mainloop;
const Calendar = imports.ui.calendar;

const Network = imports.ui.status.network;
const Bluetooth = imports.ui.status.bluetooth;
const NightLight = imports.ui.status.nightLight;
const DarkMode = imports.ui.status.darkMode;
const PowerProfiles = imports.ui.status.powerProfiles;

const Volume = Me.imports.androidVolume;
const Brightness = Me.imports.androidBrightness;
const System = imports.ui.status.system;
const { QuickSlider, QuickToggle, QuickSettingsItem } = imports.ui.quickSettings;
const { loadInterfaceXML } = imports.misc.fileUtils;
const DisplayDeviceInterface = loadInterfaceXML('org.freedesktop.UPower.Device');
const PowerManagerProxy = Gio.DBusProxy.makeProxyWrapper(DisplayDeviceInterface);

const NIGHT_LIGHT_MAX = 4700;
const NIGHT_LIGHT_MIN = 1400;
const sliders = ["OutputStreamSlider","InputStreamSlider","BrightnessItem"];
const removedItems = ["NMWiredToggle","NMWirelessToggle","NMModemToggle","NMBluetoothToggle","NMVpnToggle"];

var Extension = class Extension {
    constructor() {
    }

    enable() {
        this.qs = Main.panel.statusArea.quickSettings;
        this.box = this.qs.menu.box.get_children()[0];
        this._buildUI();

        let maxHeight = Main.layoutManager.primaryMonitor.height - Main.panel.height -20;
        this.qs.menu.box.style = `max-height: ${maxHeight}px; `;
    }

    _buildUI(){
        this.bbChildren = this.box.get_children();
        this.box.remove_all_children();
        this.bbChildren.forEach((ch,i) => {
            if (i < 2) {
                this.qs.menu.addItem(ch, 2);
            }
            if (i == 2) {
                this.volume = new Volume.Indicator();
                this.brightness = new Brightness.Indicator();
        
                this._addItems(this.volume.quickSettingsItems, 2);
                this._addItems(this.brightness.quickSettingsItems, 2);        
            }
            if(i >= 5) {
                const name = ch.constructor.name.toString();
                if(name && removedItems.includes(name)){
                    return;
                }    
                this.qs.menu.addItem(ch, 1);
            }
        });
    }

    _addItems(items, colSpan = 1){
        items.forEach(item => this.qs.menu.addItem(item, colSpan));
    }

    disable() {
        this.box.remove_all_children();
        this.qs.menu.box.style = '';
        this.bbChildren.forEach((ch,i) => {
            const name = ch.constructor.name.toString();
            if(name && removedItems.includes(name)){
                return;
            }
            if (i < 5) {
                this.qs.menu.addItem(ch, 2);
            } else if (i >= 5) this.qs.menu.addItem(ch);
        });
    }
}