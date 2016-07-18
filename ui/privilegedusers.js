//
//
function ciniki_sysadmin_privilegedusers() {
    this.users = null;

    this.init = function() {
        //  
        // Create the new panel
        //  
        this.users = new M.panel('Privileged Users',
            'ciniki_sysadmin_privilegedusers', 'users',
            'mc', 'medium', 'sectioned', 'ciniki.sysadmin.privileged.users');
        this.users.sections = {
            '_':{'label':'', 'type':'simplegrid', 'num_cols':2, 
                'headerValues':['Name', 'Privileges'],
                },
            };
        this.users.sectionData = function(s) { return this.data; }
        this.users.cellValue = function(s, i, j, d) { 
            if( j == 0 ) { return d.user.firstname + ' ' + d.user.lastname; }
            else if( j == 1 ) {
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
        this.users.rowFn = function(s, i, d) { return 'M.startApp(\'ciniki.sysadmin.user\',null,\'M.ciniki_sysadmin_privilegedusers.showUsers();\',\'mc\',{\'id\':\'' + d.user.id + '\'});'; }
        this.users.noData = function() { return 'ERROR - No sysadmins'; }
        this.users.addClose('Back');
    }   

    this.start = function(cb, appPrefix, args) {
        //  
        // Create the app container if it doesn't exist, and clear it out 
        // if it does exist.
        //  
        var appContainer = M.createContainer(appPrefix, 'ciniki_sysadmin_privilegedusers', 'yes');
        if( appContainer == null ) { 
            alert('App Error');
            return false;
        }   
    
        this.showUsers(cb);
    }   

    this.showUsers = function(cb) {
        var rsp = M.api.getJSONCb('ciniki.users.getPrivilegedUsers', {}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            var p = M.ciniki_sysadmin_privilegedusers.users;
            p.data = rsp.users;
            p.refresh();
            p.show(cb);
        });
    }
}

