//
//
function ciniki_sysadmin_allusers() {
    this.users = null;

    //  
    // Create the new panel
    //  
    this.users = new M.panel('All Users', 'ciniki_sysadmin_allusers', 'users', 'mc', 'medium', 'sectioned', 'ciniki.sysadmin.allusers.users');
    this.users.sections = {
        'search':{'label':'', 'type':'livesearchgrid', 'livesearchcols':2,
            'cellClasses':['multiline', 'multiline'],
            'noData':'No users found',
            },
        '_':{'label':'', 'type':'simplegrid', 'num_cols':4, 'sortable':'yes',
            'headerValues':['First', 'Last', 'Status', 'Privileges'],
            'sortTypes':['text','text','text','text']
            },
        };
    this.users.sectionData = function(s) { return this.data; }
    this.users.liveSearchCb = function(s, i, value) {
        if( s == 'search' && value != '' ) {
            M.api.getJSONBgCb('ciniki.users.search', {'start_needle':value}, function(rsp) {
                M.ciniki_sysadmin_allusers.users.liveSearchShow('search', null, M.gE(M.ciniki_sysadmin_allusers.users.panelUID + '_' + s), rsp.users);
            });
        }
    };
    this.users.liveSearchResultValue = function(s, f, i, j, d) {
        if( s == 'search' ) {
            switch(j) {
                case 0: return '<span class="maintext">' + d.user.firstname + '</span><span class="subtext">' + d.user.lastname + '</span>';
                case 1: return '<span class="maintext">' + d.user.username + ' <span class="subdue">[' + d.user.display_name + ']</span></span><span class="subtext">' + d.user.email + '</span>';
            }
        }
    };
    this.users.liveSearchResultRowFn = function(s, f, i, j, d) {
        return 'M.startApp(\'ciniki.sysadmin.user\',null,\'M.ciniki_sysadmin_allusers.users.open();\',\'mc\',{\'id\':\'' + d.user.id + '\'});';
    };
    this.users.cellValue = function(s, i, j, d) { 
        if( j == 0 ) { return d.user.firstname; }
        else if( j == 1 ) { return d.user.lastname; }
        else if( j == 2 ) {
            switch(d.user.status) {
                case '1': return 'Active';
                case '10': return 'Locked';
                case '11': return 'Deleted';
            }
            return '';
        }
        else if( j == 3 ) {
            var u = this.data[i].user;
            var p = '';
            var c = '';
            if( (u.perms & 0x01) ) { p += c + 'sysadmin'; c = ', '; }
            if( (u.perms & 0x02) ) { p += c + 'admin'; c = ', '; }
            if( (u.perms & 0x04) ) { p += c + 'www'; c = ', '; }
            return p;
        }
        return '';
    }
    this.users.rowFn = function(s, i, d) { return 'M.startApp(\'ciniki.sysadmin.user\',null,\'M.ciniki_sysadmin_allusers.users.open();\',\'mc\',{\'id\':\'' + d.user.id + '\'});'; }
    this.users.noData = function() { return 'ERROR - No sysadmins'; }
    this.users.open = function(cb) {
        var rsp = M.api.getJSONCb('ciniki.users.getUsers', {}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            var p = M.ciniki_sysadmin_allusers.users;
            p.data = rsp.users;
            p.refresh();
            p.show(cb);
        });
    }
    this.users.addClose('Back');

    this.start = function(cb, appPrefix, args) {
        //  
        // Create the app container if it doesn't exist, and clear it out 
        // if it does exist.
        //  
        var appContainer = M.createContainer(appPrefix, 'ciniki_sysadmin_allusers', 'yes');
        if( appContainer == null ) { 
            M.alert('App Error');
            return false;
        }

        this.users.open(cb);
    }   
}
