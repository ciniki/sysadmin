//
// The app to report on module usage by tenant
//
function ciniki_sysadmin_modules() {
    this.init = function() {
        this.main = new M.panel('Module Usage',
            'ciniki_sysadmin_modules', 'main',
            'mc', 'medium', 'sectioned', 'ciniki.sysadmin.modules.main');
        this.main.data = {};
        this.main.sections = {
            'modules':{'label':'', 'type':'simplegrid', 'num_cols':1,
                'headerValues':['Module'],
                'cellClasses':['multiline'],
                },
        };
        this.main.noData = function(s) { return 'No modules'; }
        this.main.sectionData = function(s) { return this.data; }
        this.main.cellValue = function(s, i, j, d) {
            if( j == 0 ) {
                var tenants = '';
                for(i in d.module.tenants ) {
                    tenants += d.module.tenants[i].tenant.name + ', ';
                }
                tenants = tenants.substring(0, tenants.length-2);
                return '<span class="maintext">' + d.module.name + '</span><span class="subtext">' + tenants + '</span>';
            }
        }
        this.main.rowFn = function(s, i, d) {
            return 'M.ciniki_sysadmin_modules.showModule(\'M.ciniki_sysadmin_modules.showMain();\',\'' + d.module.name + '\');';
        };
        this.main.addClose('Back');

        this.module = new M.panel('Module Usage',
            'ciniki_sysadmin_modules', 'module',
            'mc', 'medium', 'sectioned', 'ciniki.sysadmin.modules.module');
        this.module.data = {};
        this.module.sections = {
            'tenants':{'label':'', 'type':'simplegrid', 'num_cols':2,
                'headerValues':['Tenant', 'Last Change'],
                'cellClasses':['', ''],
                'sortable':'yes', 'sortTypes':['text','date'],
                },
        };
        this.module.cellValue = function(s, i, j, d) {
            switch(j) {
                case 0: return d.tenant.name;
                case 1: return d.tenant.last_change;
            }
        };
        this.module.sectionData = function(s) { return this.data[s]; }
        this.module.addClose('Back');
    }

    this.start = function(cb, ap, aG) {
        args = {};
        if( aG != null ) {
            args = eval(aG);
        }

        //
        // Create the app container if it doesn't exist, and clear it out
        // if it does exist.
        //
        var appContainer = M.createContainer(ap, 'ciniki_sysadmin_modules', 'yes');
        if( appContainer == null ) {
            alert('App Error');
            return false;
        } 

        this.showMain(cb);
    }

    this.showMain = function(cb) {
        //
        // Load module list
        //
        var rsp = M.api.getJSONCb('ciniki.tenants.reportModules', {}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            var p = M.ciniki_sysadmin_modules.main;
            p.data = rsp.modules;
            p.refresh();
            p.show(cb);
        });
    }

    this.showModule = function(cb, mod) {
        //
        // Show the details of last change for each tenant
        //
        for(i in this.main.data) {
            if( this.main.data[i].module.name == mod ) {    
                this.module.data.tenants = this.main.data[i].module.tenants;
            }
        }
        this.module.refresh();
        this.module.show(cb);
    };
};
