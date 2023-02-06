'use strict';

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const QuickSettings = Me.imports.quickSettings;

class Extension {
    constructor () {}
    enable () {
        this.quickSettings = new QuickSettings.Extension();
        this.toggleExtension(this.quickSettings);
    }

    disable() {
        if(this.quickSettings.enabled) this.quickSettings.disable();
        this.quickSettings = null;
    }

    toggleExtension(extension){
        if(!extension.enabled){
            extension.enable();
            extension.enabled = true;
        }else{
            extension.disable();
            extension.enabled = false;
        }
    }
}

function init() {
    return new Extension();
}