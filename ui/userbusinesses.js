//
//
function ciniki_sysadmin_usertenants() {
    this.users = null;
    this.details = null;

    this.init = function() {
        //  
        // Create the new panel
        //  
        this.users = new M.panel('Tenant Users',
            'ciniki_sysadmin_usertenants', 'users',
            'mc', 'medium', 'sectioned', 'ciniki.sysadmin.users.tenants');
        this.users.sections = {
            '_':{'label':'', 'type':'simplegrid', 'num_cols':2, 
                'headerValues':['Name', 'Tenants'],
                },
            };
        this.users.sectionData = function(s) { return this.data; }
        this.users.cellValue = function(s, i, col, d) { 
            if( col == 0 ) { return this.data[i].user.firstname + ' ' + this.data[i].user.lastname; }
            else if( col == 1 ) {
                var u = this.data[i].user;
                var p = '';
                var c = '';
                for(j in u.tenants) {
                    p += c + u.tenants[j].tenant.name;
                    c = '<br/>';
                }
                return p;
            }
            return '';
        }
        this.users.rowFn = function(s, i, d) { return 'M.startApp(\'ciniki.sysadmin.user\',null,\'M.ciniki_sysadmin_usertenants.showUsers();\',\'mc\',{\'id\':\'' + d.user.id + '\'});'; }
        this.users.noData = function() { return 'ERROR - users'; }
        this.users.addClose('Back');
    }   

    this.start = function(cb, appPrefix) {
        //  
        // Create the app container if it doesn't exist, and clear it out 
        // if it does exist.
        //  
        var appContainer = M.createContainer(appPrefix, 'ciniki_sysadmin_usertenants', 'yes');
        if( appContainer == null ) { 
            M.alert('App Error');
            return false;
        }   

        this.showUsers(cb);
    }   

    this.showUsers = function(cb) {
        var rsp = M.api.getJSONCb('ciniki.tenants.getAllOwners', {}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            var p = M.ciniki_sysadmin_usertenants.users;
            p.data = rsp.users;
            p.refresh();
            p.show(cb);
        });
    }
}
