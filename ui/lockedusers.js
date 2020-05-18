//
//
function ciniki_sysadmin_lockedusers() {
    this.users = null;
    this.details = null;

    this.init = function() {
        //  
        // Create the new panel
        //  
        this.users = new M.panel('Locked Users',
            'ciniki_sysadmin_lockedusers', 'users',
            'mc', 'medium', 'sectioned', 'ciniki.sysadmin.privileged.users');
        this.users.sections = {
            '_':{'label':'', 'type':'simplegrid', 'num_cols':2, 
                'headerValues':['Name', 'Privileges'],
                },
            };
        this.users.sectionData = function(s) { return this.data; }
        this.users.cellValue = function(s, i, col, d) { 
            if( col == 0 ) { return d.user.firstname + ' ' + d.user.lastname; }
            else if( col == 1 ) {
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
        this.users.rowFn = function(s, i, d) { return 'M.startApp(\'ciniki.sysadmin.user\',null,\'M.ciniki_sysadmin_lockedusers.showUsers();\',\'mc\',{\'id\':\'' + d.user.id + '\'});'; }
        this.users.noData = function() { return 'No locked users'; }
        this.users.addClose('Back');
    }   

    this.start = function(cb, appPrefix, args) {
        //  
        // Create the app container if it doesn't exist, and clear it out 
        // if it does exist.
        //  
        var appContainer = M.createContainer(appPrefix, 'ciniki_sysadmin_lockedusers', 'yes');
        if( appContainer == null ) { 
            M.alert('App Error');
            return false;
        }   
        
        this.showUsers(cb);
    }   

    this.showUsers = function(cb) {
        var rsp = M.api.getJSONCb('ciniki.users.getLockedUsers', {}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            var p = M.ciniki_sysadmin_lockedusers.users;
            p.data = rsp.users;
            p.refresh();
            p.show(cb);
        });
    }
}

