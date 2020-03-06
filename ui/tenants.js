//
//
function ciniki_sysadmin_tenants() {

    this.menu = new M.panel('Tenant Users',
        'ciniki_sysadmin_tenants', 'menu',
        'mc', 'medium narrowaside', 'sectioned', 'ciniki.sysadmin.tenants.menu');
    this.menu.category = '';
    this.menu.sections = {
        'categories':{'label':'Categories', 'aside':'yes', 'type':'simplegrid', 'num_cols':1,
            },
        'search':{'label':'', 'type':'livesearchgrid', 'livesearchcols':1, 'autofocus':'yes',
            'hint':'Search',
            'cellClasses':['multiline'],
            'noData':'No Tenants found',
            },
        'tenants':{'label':'Tenants', 'type':'simplegrid', 'num_cols':2,
            'cellClasses':['multiline'],
        },
    }
    this.menu.sectionData = function(s) { 
        return this.data[s]; 
    }
    this.menu.liveSearchCb = function(s, i, v) {
        if( v != '' ) {
            M.api.getJSONBgCb('ciniki.tenants.searchTenants', {'tnid':M.curTenantID, 'start_needle':v, 'limit':'15'},
                function(rsp) {
                    M.ciniki_sysadmin_tenants.menu.liveSearchShow(s, null, M.gE(M.ciniki_core_menu.tenants.panelUID + '_' + s), rsp.tenants);
                });
        }
        return true;
    };
    this.menu.liveSearchResultValue = function(s, f, i, j, d) {
        return d.tenant.name;
    };
    this.menu.liveSearchResultRowFn = function(s, f, i, j, d) {
        return 'M.startApp(\'ciniki.sysadmin.tenant\',null,\'M.ciniki_sysadmin_tenants.tenants.open();\',\'mc\',{\'id\':\'' + d.tenant.id + '\'});'; 
    };
    this.menu.liveSearchResultRowStyle = function(s, f, i, d) { return ''; };
    this.menu.cellValue = function(s, i, j, d) { 
        if( s == 'categories' ) {
            switch(j) {
                case 0: return d.name;
            }
        }
        if( s == 'tenants' ) {
            switch(j) {
                case 0: return '<span class="maintext">' + d.name + '</span><span class="subtext">' + d.userlist + '</span>';
                case 1: return '<span class="maintext">' + d.status_text + '</span><span class="subtext">' + '</span>';
            }
        }
        return '';
    }
    this.menu.rowClass = function(s, i, d) {
        if( s == 'categories' && this.category == d.name ) {
            return 'highlight';
        }
        return '';
    }
    this.menu.switchCategory = function(category) {
        this.category = category;
        for(var i in this.data.categories) {
            if( this.data.categories[i].name == this.category || this.category == '' ) {
                this.data.tenants = this.data.categories[i].tenants;
                break;
            }
        }
        this.refreshSection('categories');
        this.refreshSection('tenants');
    }
    this.menu.rowFn = function(s, i, d) { 
        if( s == 'categories' ) {
            return 'M.ciniki_sysadmin_tenants.menu.switchCategory("' + d.name + '");';
        }
        if( s == 'tenants' ) {
            return 'M.startApp(\'ciniki.sysadmin.tenant\',null,\'M.ciniki_sysadmin_tenants.menu.open();\',\'mc\',{\'id\':\'' + d.id + '\'});'; 
        }
    }
    this.menu.noData = function() { return 'ERROR - No sysadmins'; }
    this.menu.open = function(cb) {
        M.api.getJSONCb('ciniki.sysadmin.tenantList', {}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err();
                return false;
            }
            var p = M.ciniki_sysadmin_tenants.menu;
            p.data = rsp;
            if( p.category == '' && rsp.categories[0] != null ) {
                p.category = rsp.categories[0].name;
            }
            p.refresh();
            p.show(cb);
            p.switchCategory(p.category);
        });
    }
    this.menu.addClose('Back');


    this.start = function(cb, appPrefix) {
        //  
        // Create the app container if it doesn't exist, and clear it out 
        // if it does exist.
        //  
        var appContainer = M.createContainer(appPrefix, 'ciniki_sysadmin_tenants', 'yes');
        if( appContainer == null ) { 
            alert('App Error');
            return false;
        }

        this.menu.open(cb);
    }   
}
