//
//
function ciniki_sysadmin_tenantusers() {
    this.tenants = null;

    this.tenants = new M.panel('Tenant Users',
        'ciniki_sysadmin_tenantusers', 'tenants',
        'mc', 'medium', 'sectioned', 'ciniki.sysadmin.tenant.users');
    this.tenants.sectionData = function(s) { return this.data[s]; }
    this.tenants.liveSearchCb = function(s, i, v) {
        if( v != '' ) {
            M.api.getJSONBgCb('ciniki.tenants.searchTenants', {'tnid':M.curTenantID, 'start_needle':v, 'limit':'15'},
                function(rsp) {
                    M.ciniki_sysadmin_tenantusers.tenants.liveSearchShow(s, null, M.gE(M.ciniki_core_menu.tenants.panelUID + '_' + s), rsp.tenants);
                });
        }
        return true;
    };
    this.tenants.liveSearchResultValue = function(s, f, i, j, d) {
        return d.tenant.name;
    };
    this.tenants.liveSearchResultRowFn = function(s, f, i, j, d) {
        return 'M.startApp(\'ciniki.sysadmin.tenant\',null,\'M.ciniki_sysadmin_tenantusers.tenants.open();\',\'mc\',{\'id\':\'' + d.tenant.id + '\'});'; 
    };
    this.tenants.liveSearchResultRowStyle = function(s, f, i, d) { return ''; };
    this.tenants.cellValue = function(s, i, j, d) { 
        var c = '<span class="maintext">' + d.tenant.name + '</span><span class="subtext">';
        var cm = '';
        for(i in d.tenant.users) {
            c += cm + d.tenant.users[i].user.firstname
                + ' ' + d.tenant.users[i].user.lastname;
            cm = ', ';
        }
        c += '</span>';
        return c;
        if( col == 0 ) { return d.tenant.name; }
        else if( col == 1 ) {
            var b = this.data[i].tenant;
            var p = '';
            var c = '';
            for(j in b.users) {
                p += c + b.users[j].user.firstname
                    + ' ' + b.users[j].user.lastname;
                c = '<br/>';
            }
            return p;
        }
        return '';
    }
    this.tenants.rowFn = function(s, i, d) { 
        return 'M.startApp(\'ciniki.sysadmin.tenant\',null,\'M.ciniki_sysadmin_tenantusers.tenants.open();\',\'mc\',{\'id\':\'' + d.tenant.id + '\'});'; 
    }
    this.tenants.noData = function() { return 'ERROR - No sysadmins'; }
    this.tenants.open = function(cb) {
        M.api.getJSONCb('ciniki.tenants.getAll', {}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err();
                return false;
            }
            var p = M.ciniki_sysadmin_tenantusers.tenants;
            p.data = {};
            p.sections = {
                '0':{'label':'', 'type':'livesearchgrid', 'livesearchcols':1, 'autofocus':'yes',
                    'hint':'Search',
                    'cellClasses':['multiline'],
                    'noData':'No Tenants found',
                    },
                };
            for(i in rsp.categories) {
                p.sections[(i+1)] = {'label':rsp.categories[i].category.name, 'type':'simplegrid', 'num_cols':1,
                    'cellClasses':['multiline'],
                    };
                p.data[(i+1)] = rsp.categories[i].category.tenants;
            }
            p.refresh();
            p.show(cb);
        });
    }
    this.tenants.addClose('Back');


    this.start = function(cb, appPrefix) {
        //  
        // Create the app container if it doesn't exist, and clear it out 
        // if it does exist.
        //  
        var appContainer = M.createContainer(appPrefix, 'ciniki_sysadmin_tenantusers', 'yes');
        if( appContainer == null ) { 
            M.alert('App Error');
            return false;
        }

        this.tenants.open(cb);
    }   

}
