const { GObject, St, Clutter, Gio, GLib, Shell, GnomeDesktop } = imports.gi;
const { QuickSlider, QuickToggle, QuickSettingsItem } = imports.ui.quickSettings;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const modifiedSlider = Me.imports.modifiedSlider;


var IconAndroidQuickSlider = GObject.registerClass({
    Properties: {
        'icon-name': GObject.ParamSpec.override('icon-name', St.Button),
        'gicon': GObject.ParamSpec.object('gicon', '', '',
            GObject.ParamFlags.READWRITE,
            Gio.Icon),
        'menu-enabled': GObject.ParamSpec.boolean(
            'menu-enabled', '', '',
            GObject.ParamFlags.READWRITE,
            false),
    },
}, class IconAndroidQuickSlider extends QuickSettingsItem {
    _init(iconFunction, params) {
        super._init({
            style_class: 'quick-slider',
            ...params,
            can_focus: false,
            reactive: false,
            hasMenu: true,
        });

        const box = new St.BoxLayout();
        this.set_child(box);

        this.slider = new modifiedSlider.ModifiedSlider(0, iconFunction);
        // for focus indication
        const sliderBin = new St.Bin({
            style_class: 'slider-bin',
            child: this.slider,
            reactive: true,
            can_focus: true,
            x_expand: true,
            y_align: Clutter.ActorAlign.CENTER,
        });
        box.add_child(sliderBin);

        sliderBin.set_accessible(this.slider.get_accessible());
        sliderBin.connect('event', (bin, event) => this.slider.event(event, false));

        this._menuButton = new St.Button({
            child: new St.Icon({icon_name: 'go-next-symbolic'}),
            style_class: 'icon-button flat',
            can_focus: true,
            x_expand: false,
            y_expand: true,
        });
        box.add_child(this._menuButton);

        this.bind_property('menu-enabled',
            this._menuButton, 'visible',
            GObject.BindingFlags.SYNC_CREATE);
        this._menuButton.connect('clicked', () => this.menu.open());
        this.slider.connect('popup-menu', () => {
            if (this.menuEnabled)
                this.menu.open();
        });

    }
});