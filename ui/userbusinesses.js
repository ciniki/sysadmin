//
//
function ciniki_sysadmin_userbusinesses() {
    this.users = null;
    this.details = null;

    this.init = function() {
        //  
        // Create the new panel
        //  
        this.users = new M.panel('Business Users',
            'ciniki_sysadmin_userbusinesses', 'users',
            'mc', 'medium', 'sectioned', 'ciniki.sysadmin.users.businesses');
        this.users.sections = {
            '_':{'label':'', 'type':'simplegrid', 'num_cols':2, 
                'headerValues':['Name', 'Businesses'],
                },
            };
        this.users.sectionData = function(s) { return this.data; }
        this.users.cellValue = function(s, i, col, d) { 
            if( col == 0 ) { return this.data[i].user.firstname + ' ' + this.data[i].user.lastname; }
            else if( col == 1 ) {
                var u = this.data[i].user;
                var p = '';
                var c = '';
                for(j in u.businesses) {
                    p += c + u.businesses[j].business.name;
                    c = '<br/>';
                }
                return p;
            }
            return '';
        }
        this.users.rowFn = function(s, i, d) { return 'M.startApp(\'ciniki.sysadmin.user\',null,\'M.ciniki_sysadmin_userbusinesses.showUsers();\',\'mc\',{\'id\':\'' + d.user.id + '\'});'; }
        this.users.noData = function() { return 'ERROR - users'; }
        this.users.addClose('Back');
    }   

    this.start = function(cb, appPrefix) {
        //  
        // Create the app container if it doesn't exist, and clear it out 
        // if it does exist.
        //  
        var appContainer = M.createContainer(appPrefix, 'ciniki_sysadmin_userbusinesses', 'yes');
        if( appContainer == null ) { 
            alert('App Error');
            return false;
        }   

        this.showUsers(cb);
    }   

    this.showUsers = function(cb) {
        var rsp = M.api.getJSONCb('ciniki.businesses.getAllOwners', {}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            var p = M.ciniki_sysadmin_userbusinesses.users;
            p.data = rsp.users;
            p.refresh();
            p.show(cb);
        });
    }
}
