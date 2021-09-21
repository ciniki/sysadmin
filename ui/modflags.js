//
// The app to report on module usage by tenant
//
function ciniki_sysadmin_modflags() {
    this.main = new M.panel('Module Usage',
        'ciniki_sysadmin_modflags', 'main',
        'mc', 'medium narrowaside', 'sectioned', 'ciniki.sysadmin.modflags.main');
    this.main.data = {'package':'', 'module':'', 'flags':0};
    this.main.package_selected = '';
    this.main.module_selected = '';
    this.main.flags_selected = 0;
    this.main.sections = {
        '_package':{'label':'Package', 'aside':'yes', 
            'fields': {
                'package':{'label':'Package', 'type':'select', 'options':{},
                    'onchange':'M.ciniki_sysadmin_modflags.main.updateSelection',
                    },
            }},
        '_module':{'label':'Module', 'aside':'yes', 
            'active':function() { return (M.ciniki_sysadmin_modflags.main.data.package != '' ? 'yes' : 'no'); },
            'fields': {
                'module':{'label':'Module', 'type':'select', 'options':{},
                    'onchange':'M.ciniki_sysadmin_modflags.main.updateSelection',
                },
            }},
        '_options':{'label':'Options', 'aside':'yes', 
            'active':function() { return M.ciniki_sysadmin_modflags.main.data.module != '' ? 'yes' : 'no'; },
            'fields': {
            }},
        'tenants':{'label':'Tenants', 'type':'simplegrid', 'num_cols':2,
            'visible':function() { return M.ciniki_sysadmin_modflags.main.data.module != '' ? 'yes' : 'hidden'; },
            'cellClasses':['multiline'],
            },

    }
    this.main.cellValue = function(s, i, j, d) {
        if( s == 'modules' ) {
            return d.package + '.' + d.name;
        }
        if( s == 'tenants' ) {
            switch(j) {
                case 0: return M.multiline(d.name, d.flag_text);
                case 1: return d.status_text;
            }
        }
    }
    this.main.rowFn = function(s, i, d) {
        if( s == 'tenants' ) {
            return 'M.startApp(\'ciniki.sysadmin.tenant\',null,\'M.ciniki_sysadmin_modflags.main.open();\',\'mc\',{\'id\':' + d.id + '});';
        }
    }
    this.main.rowClass = function(s, i, d) {
        if( s == 'modules' && this.package_selected == d.package && this.module_selected == d.name ) {
            return 'highlight';
        }
    }
    this.main.updateSelection = function(s) {
        this.open(null,'yes');
    }
    this.main.open = function(cb,reload) {
        var args = this.serializeForm('yes');
        M.api.postJSONCb('ciniki.sysadmin.moduleUsage', {}, args, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            var p = M.ciniki_sysadmin_modflags.main;
            p.data = rsp;
            p.sections._package.fields.package.options = {};
            for(var i in rsp.packages) {
                p.sections._package.fields.package.options[rsp.packages[i]] = rsp.packages[i];
            }
            p.sections._module.fields.module.options = {};
            for(var i in rsp.modules) {
                p.sections._module.fields.module.options[rsp.modules[i].name] = rsp.modules[i].name;
            }
            p.sections._options.fields = {};
            p.sections._options.visible = 'no';
            p.data.flags_selected = p.flags_selected;
            if( rsp.module_flags != null && rsp.module_flags.length > 0 ) {
                p.sections._options.visible = 'yes';
                for(var i in rsp.module_flags) {
                    p.sections._options.fields[rsp.module_flags[i].flag.bit] = {'label':rsp.module_flags[i].flag.name, 'type':'flagtoggle', 'default':'off', 'bit':Math.pow(2,(rsp.module_flags[i].flag.bit-1)), 'field':'flags', 'onchange':'M.ciniki_sysadmin_modflags.main.updateSelection'};
                }
            }
            p.refresh();
            p.show(cb);
        });
    }
    this.main.addClose('Back');

    this.start = function(cb, ap, aG) {
        args = {};
        if( aG != null ) {
            args = eval(aG);
        }

        //
        // Create the app container if it doesn't exist, and clear it out
        // if it does exist.
        //
        var appContainer = M.createContainer(ap, 'ciniki_sysadmin_modflags', 'yes');
        if( appContainer == null ) {
            M.alert('App Error');
            return false;
        } 

        this.main.open(cb);
    }
}
