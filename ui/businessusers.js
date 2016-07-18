//
//
function ciniki_sysadmin_businessusers() {
    this.businesses = null;

    this.init = function() {
        this.businesses = new M.panel('Business Users',
            'ciniki_sysadmin_businessusers', 'businesses',
            'mc', 'medium', 'sectioned', 'ciniki.sysadmin.business.users');
        this.businesses.sectionData = function(s) { return this.data[s]; }
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
        this.businesses.rowFn = function(s, i, d) { return 'M.startApp(\'ciniki.sysadmin.business\',null,\'M.ciniki_sysadmin_businessusers.showBusinesses();\',\'mc\',{\'id\':\'' + d.business.id + '\'});'; }
        this.businesses.noData = function() { return 'ERROR - No sysadmins'; }
        this.businesses.addClose('Back');
    }   

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

        this.showBusinesses(cb);
    }   

    this.showBusinesses = function(cb) {
        var rsp = M.api.getJSONCb('ciniki.businesses.getAll', {}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err();
                return false;
            }
            var p = M.ciniki_sysadmin_businessusers.businesses;
            p.data = {};
            p.sections = {};
            for(i in rsp.categories) {
                p.sections[i] = {'label':rsp.categories[i].category.name, 'type':'simplegrid', 'num_cols':1,
                    'cellClasses':['multiline'],
                    };
                p.data[i] = rsp.categories[i].category.businesses;
            }
            p.refresh();
            p.show(cb);
        });
    }
}
