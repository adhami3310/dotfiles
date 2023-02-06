const { GObject, St, Clutter, Gio, GLib, Shell, GnomeDesktop } = imports.gi;
const { QuickSlider, QuickToggle, QuickSettingsItem } = imports.ui.quickSettings;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const modifiedSlider = Me.imports.modifiedSlider;


var AndroidQuickSlider = GObject.registerClass({
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
}, class AndroidQuickSlider extends QuickSettingsItem {
    _init(params) {
        super._init({
            style_class: 'quick-slider',
            ...params,
            can_focus: false,
            reactive: false,
            hasMenu: true,
        });

        const box = new St.BoxLayout();
        this.set_child(box);

        const iconProps = {};
        if (this.gicon)
            iconProps['gicon'] = this.gicon;
        if (this.iconName)
            iconProps['icon-name'] = this.iconName;

        this._icon = new St.Icon({
            style_class: 'quick-toggle-icon',
            ...iconProps,
        });
        box.add_child(this._icon);

        // bindings are in the "wrong" direction, so we
        // pick up StIcon's linking of the two properties
        this._icon.bind_property('icon-name',
            this, 'icon-name',
            GObject.BindingFlags.SYNC_CREATE |
            GObject.BindingFlags.BIDIRECTIONAL);
        this._icon.bind_property('gicon',
            this, 'gicon',
            GObject.BindingFlags.SYNC_CREATE |
            GObject.BindingFlags.BIDIRECTIONAL);

        this.slider = new modifiedSlider.ModifiedSlider(0);

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