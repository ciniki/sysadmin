//
// 
//
function ciniki_sysadmin_resellers() {
    this.menu = new M.panel('Resellers', 'ciniki_sysadmin_resellers', 'menu', 'mc', 'medium mediumaside', 'sectioned', 'ciniki.sysadmin.resellers.menu');
    this.menu.reseller_id = 0;
    this.menu.sections = {
        'resellers':{'label':'Resellers', 'type':'simplegrid', 'num_cols':1, 'aside':'yes',
            },
        'search':{'label':'Search', 'type':'livesearchgrid', 'livesearchcols':1, 'autofocus':'yes',
            'cellClasses':['multiline'],
            'noData':'No Tenants found',
            },
        'tenants':{'label':'Tenants', 'type':'simplegrid', 'num_cols':1,
            },
        }
    this.menu.sectionData = function(s) { return this.data[s]; }
    this.menu.liveSearchCb = function(s, i, v) {
        if( v != '' ) {
            M.api.getJSONBgCb('ciniki.tenants.searchTenants', {'tnid':M.curTenantID, 'start_needle':v, 'limit':'15'},
                function(rsp) {
                    M.ciniki_sysadmin_resellers.menu.liveSearchShow(s, null, M.gE(M.ciniki_core_menu.tenants.panelUID + '_' + s), rsp.tenants);
                });
        }
        return true;
    };
    this.menu.liveSearchResultValue = function(s, f, i, j, d) {
        return d.tenant.name;
    };
    this.menu.liveSearchResultRowFn = function(s, f, i, j, d) {
        return 'M.startApp(\'ciniki.sysadmin.tenant\',null,\'M.ciniki_sysadmin_resellers.menu.open();\',\'mc\',{\'id\':\'' + d.tenant.id + '\'});'; 
    };
    this.menu.liveSearchResultRowStyle = function(s, f, i, d) { return ''; };
    this.menu.cellValue = function(s, i, j, d) { 
        if( s == 'resellers' ) {
            return d.name + '<span class="count">' + d.num_tenants + '</span>';
        }
        if( s == 'tenants' ) {
            switch(j) {
                case 0: return d.name;
            }
        }
        return '';
    }
    this.menu.rowClass = function(s, i, d) {
        if( d.id == this.reseller_id ) {
            return 'highlight';
        }
        return '';
    }
    this.menu.rowFn = function(s, i, d) { 
        if( s == 'resellers' ) {
            return 'M.ciniki_sysadmin_resellers.menu.open(null,' + d.id + ');';
        }
        if( s == 'tenants' ) {
            return 'M.startApp(\'ciniki.sysadmin.tenant\',null,\'M.ciniki_sysadmin_resellers.menu.open();\',\'mc\',{\'id\':\'' + d.id + '\'});'; 
        }
    }
    this.menu.noData = function() { return 'ERROR - No sysadmins'; }
    this.menu.open = function(cb, rid) {
        if( rid != null ) { this.reseller_id = rid; }
        if( this.reseller_id == 0 ) {
            this.reseller_id = M.masterTenantID;
        }
        M.api.getJSONCb('ciniki.sysadmin.resellers', {'reseller_id':rid}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err();
                return false;
            }
            var p = M.ciniki_sysadmin_resellers.menu;
            p.data = rsp;
            p.refresh();
            p.show(cb);
        });
    }
    this.menu.addClose('Back');

    this.start = function(cb, appPrefix) {
        //  
        // Create the app container if it doesn't exist, and clear it out 
        // if it does exist.
        //  
        var appContainer = M.createContainer(appPrefix, 'ciniki_sysadmin_resellers', 'yes');
        if( appContainer == null ) { 
            M.alert('App Error');
            return false;
        }

        this.menu.open(cb);
    }   
}
