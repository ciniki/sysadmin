//
//
function ciniki_sysadmin_businessusers() {
    this.businesses = null;

    this.businesses = new M.panel('Business Users',
        'ciniki_sysadmin_businessusers', 'businesses',
        'mc', 'medium', 'sectioned', 'ciniki.sysadmin.business.users');
    this.businesses.sectionData = function(s) { return this.data[s]; }
    this.businesses.liveSearchCb = function(s, i, v) {
        if( v != '' ) {
            M.api.getJSONBgCb('ciniki.businesses.searchBusinesses', {'business_id':M.curBusinessID, 'start_needle':v, 'limit':'15'},
                function(rsp) {
                    M.ciniki_sysadmin_businessusers.businesses.liveSearchShow(s, null, M.gE(M.ciniki_core_menu.businesses.panelUID + '_' + s), rsp.businesses);
                });
        }
        return true;
    };
    this.businesses.liveSearchResultValue = function(s, f, i, j, d) {
        return d.business.name;
    };
    this.businesses.liveSearchResultRowFn = function(s, f, i, j, d) {
        return 'M.startApp(\'ciniki.sysadmin.business\',null,\'M.ciniki_sysadmin_businessusers.businesses.open();\',\'mc\',{\'id\':\'' + d.business.id + '\'});'; 
    };
    this.businesses.liveSearchResultRowStyle = function(s, f, i, d) { return ''; };
    this.businesses.cellValue = function(s, i, j, d) { 
        var c = '<span class="maintext">' + d.business.name + '</span><span class="subtext">';
        var cm = '';
        for(i in d.business.users) {
            c += cm + d.business.users[i].user.firstname
                + ' ' + d.business.users[i].user.lastname;
            cm = ', ';
        }
        c += '</span>';
        return c;
        if( col == 0 ) { return d.business.name; }
        else if( col == 1 ) {
            var b = this.data[i].business;
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
    this.businesses.rowFn = function(s, i, d) { 
        return 'M.startApp(\'ciniki.sysadmin.business\',null,\'M.ciniki_sysadmin_businessusers.businesses.open();\',\'mc\',{\'id\':\'' + d.business.id + '\'});'; 
    }
    this.businesses.noData = function() { return 'ERROR - No sysadmins'; }
    this.businesses.open = function(cb) {
        M.api.getJSONCb('ciniki.businesses.getAll', {}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err();
                return false;
            }
            var p = M.ciniki_sysadmin_businessusers.businesses;
            p.data = {};
            p.sections = {
                '0':{'label':'', 'type':'livesearchgrid', 'livesearchcols':1, 'autofocus':'yes',
                    'hint':'Search',
                    'cellClasses':['multiline'],
                    'noData':'No Businesses found',
                    },
                };
            for(i in rsp.categories) {
                p.sections[(i+1)] = {'label':rsp.categories[i].category.name, 'type':'simplegrid', 'num_cols':1,
                    'cellClasses':['multiline'],
                    };
                p.data[i] = rsp.categories[i].category.businesses;
            }
            p.refresh();
            p.show(cb);
        });
    }
    this.businesses.addClose('Back');


    this.start = function(cb, appPrefix) {
        //  
        // Create the app container if it doesn't exist, and clear it out 
        // if it does exist.
        //  
        var appContainer = M.createContainer(appPrefix, 'ciniki_sysadmin_businessusers', 'yes');
        if( appContainer == null ) { 
            alert('App Error');
            return false;
        }

        this.businesses.open(cb);
    }   

}
