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
const { QuickSlider, QuickToggle, QuickSettingsItem, QuickSettingsMenu } = imports.ui.quickSettings;
const { loadInterfaceXML } = imports.misc.fileUtils;
const DisplayDeviceInterface = loadInterfaceXML('org.freedesktop.UPower.Device');
const PowerManagerProxy = Gio.DBusProxy.makeProxyWrapper(DisplayDeviceInterface);

const NIGHT_LIGHT_MAX = 4700;
const NIGHT_LIGHT_MIN = 1400;
const sliders = ["OutputStreamSlider", "InputStreamSlider", "BrightnessItem"];
const removedItems = ["NMWiredToggle", "NMWirelessToggle", "NMModemToggle", "NMBluetoothToggle", "NMVpnToggle"];

var Extension = class Extension {
    constructor() {
        this.qs = Main.panel.statusArea.quickSettings;
    }

    enable() {
        this.qs = Main.panel.statusArea.quickSettings;
        this._buildModifiedUI();
    }

    _buildModifiedUI() {
        let N_QUICK_SETTINGS_COLUMNS = 2;

        this.qs.remove_all_children();

        this._indicators = new St.BoxLayout({
            style_class: 'panel-status-indicators-box',
        });

        this.qs.setMenu(new QuickSettingsMenu(this.qs, N_QUICK_SETTINGS_COLUMNS));

        if (Config.HAVE_NETWORKMANAGER)
            this._network = new imports.ui.status.network.Indicator();
        else
            this._network = null;

        if (Config.HAVE_BLUETOOTH)
            this._bluetooth = new imports.ui.status.bluetooth.Indicator();
        else
            this._bluetooth = null;

        this._system = new imports.ui.status.system.Indicator();
        this._volume = new Volume.Indicator();
        this._brightness = new Brightness.Indicator();
        this._remoteAccess = new imports.ui.status.remoteAccess.RemoteAccessApplet();
        this._location = new imports.ui.status.location.Indicator();
        this._thunderbolt = new imports.ui.status.thunderbolt.Indicator();
        this._nightLight = new imports.ui.status.nightLight.Indicator();
        this._darkMode = new imports.ui.status.darkMode.Indicator();
        this._powerProfiles = new imports.ui.status.powerProfiles.Indicator();
        this._rfkill = new imports.ui.status.rfkill.Indicator();
        this._autoRotate = new imports.ui.status.autoRotate.Indicator();
        // this._unsafeMode = new UnsafeModeIndicator();
        this._backgroundApps = new imports.ui.status.backgroundApps.Indicator();



        this._indicators.add_child(this._brightness);
        this._indicators.add_child(this._remoteAccess);
        this._indicators.add_child(this._thunderbolt);
        this._indicators.add_child(this._location);
        this._indicators.add_child(this._nightLight);
        if (this._network)
            this._indicators.add_child(this._network);
        this._indicators.add_child(this._darkMode);
        this._indicators.add_child(this._powerProfiles);
        if (this._bluetooth)
            this._indicators.add_child(this._bluetooth);
        this._indicators.add_child(this._rfkill);
        this._indicators.add_child(this._autoRotate);
        this._indicators.add_child(this._volume);
        // this._indicators.add_child(this._unsafeMode);
        this._indicators.add_child(this._system);
        this.qs.add_child(this._indicators);



        this._addItems(this._system.quickSettingsItems, N_QUICK_SETTINGS_COLUMNS);
        this._addItems(this._volume.quickSettingsItems, N_QUICK_SETTINGS_COLUMNS);
        this._addItems(this._brightness.quickSettingsItems, N_QUICK_SETTINGS_COLUMNS);

        this._addItems(this._remoteAccess.quickSettingsItems);
        this._addItems(this._thunderbolt.quickSettingsItems);
        this._addItems(this._location.quickSettingsItems);
        if (this._network)
            this._addItems(this._network.quickSettingsItems);
        if (this._bluetooth)
            this._addItems(this._bluetooth.quickSettingsItems);
        this._addItems(this._powerProfiles.quickSettingsItems);
        this._addItems(this._nightLight.quickSettingsItems);
        this._addItems(this._darkMode.quickSettingsItems);
        this._addItems(this._rfkill.quickSettingsItems);
        this._addItems(this._autoRotate.quickSettingsItems);
        // this._addItems(this._unsafeMode.quickSettingsItems);

        this._addItems(this._backgroundApps.quickSettingsItems, N_QUICK_SETTINGS_COLUMNS);
    }

    _buildNormalUI() {
        let N_QUICK_SETTINGS_COLUMNS = 2;

        this.qs.remove_all_children();

        this._indicators = new St.BoxLayout({
            style_class: 'panel-status-indicators-box',
        });

        //GNOME shell code
        this.qs.setMenu(new QuickSettingsMenu(this.qs, N_QUICK_SETTINGS_COLUMNS));

        if (Config.HAVE_NETWORKMANAGER)
            this._network = new imports.ui.status.network.Indicator();
        else
            this._network = null;

        if (Config.HAVE_BLUETOOTH)
            this._bluetooth = new imports.ui.status.bluetooth.Indicator();
        else
            this._bluetooth = null;

        this._system = new imports.ui.status.system.Indicator();
        this._volume = new imports.ui.status.volume.Indicator();
        this._brightness = new imports.ui.status.brightness.Indicator();
        this._remoteAccess = new imports.ui.status.remoteAccess.RemoteAccessApplet();
        this._location = new imports.ui.status.location.Indicator();
        this._thunderbolt = new imports.ui.status.thunderbolt.Indicator();
        this._nightLight = new imports.ui.status.nightLight.Indicator();
        this._darkMode = new imports.ui.status.darkMode.Indicator();
        this._powerProfiles = new imports.ui.status.powerProfiles.Indicator();
        this._rfkill = new imports.ui.status.rfkill.Indicator();
        this._autoRotate = new imports.ui.status.autoRotate.Indicator();
        // this._unsafeMode = new UnsafeModeIndicator();
        this._backgroundApps = new imports.ui.status.backgroundApps.Indicator();


        this._indicators.add_child(this._brightness);
        this._indicators.add_child(this._remoteAccess);
        this._indicators.add_child(this._thunderbolt);
        this._indicators.add_child(this._location);
        this._indicators.add_child(this._nightLight);
        if (this._network)
            this._indicators.add_child(this._network);
        this._indicators.add_child(this._darkMode);
        this._indicators.add_child(this._powerProfiles);
        if (this._bluetooth)
            this._indicators.add_child(this._bluetooth);
        this._indicators.add_child(this._rfkill);
        this._indicators.add_child(this._autoRotate);
        this._indicators.add_child(this._volume);
        // this._indicators.add_child(this._unsafeMode);
        this._indicators.add_child(this._system);
        this.qs.add_child(this._indicators);


        this._addItems(this._system.quickSettingsItems, N_QUICK_SETTINGS_COLUMNS);
        this._addItems(this._volume.quickSettingsItems, N_QUICK_SETTINGS_COLUMNS);
        this._addItems(this._brightness.quickSettingsItems, N_QUICK_SETTINGS_COLUMNS);

        this._addItems(this._remoteAccess.quickSettingsItems);
        this._addItems(this._thunderbolt.quickSettingsItems);
        this._addItems(this._location.quickSettingsItems);
        if (this._network)
            this._addItems(this._network.quickSettingsItems);
        if (this._bluetooth)
            this._addItems(this._bluetooth.quickSettingsItems);
        this._addItems(this._powerProfiles.quickSettingsItems);
        this._addItems(this._nightLight.quickSettingsItems);
        this._addItems(this._darkMode.quickSettingsItems);
        this._addItems(this._rfkill.quickSettingsItems);
        this._addItems(this._autoRotate.quickSettingsItems);
        // this._addItems(this._unsafeMode.quickSettingsItems);

        this._addItems(this._backgroundApps.quickSettingsItems, N_QUICK_SETTINGS_COLUMNS);
    }

    _addItems(items, colSpan = 1) {
        items.forEach(item => this.qs.menu.addItem(item, colSpan));
    }

    disable() {
        this.qs = Main.panel.statusArea.quickSettings;
        this._buildNormalUI();
    }
}