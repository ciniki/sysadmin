//
//
function ciniki_sysadmin_allusers() {
    this.users = null;

    this.init = function() {
        //  
        // Create the new panel
        //  
        this.users = new M.panel('Privileged Users',
            'ciniki_sysadmin_allusers', 'users',
            'mc', 'medium', 'sectioned', 'ciniki.sysadmin.allusers.users');
		this.users.sections = {
			'_':{'label':'', 'type':'simplegrid', 'num_cols':4, 'sortable':'yes',
				'headerValues':['First', 'Last', 'Status', 'Privileges'],
				'sortTypes':['text','text','text','text']
				},
			};
		this.users.sectionData = function(s) { return this.data; }
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
		this.users.rowFn = function(s, i, d) { return 'M.startApp(\'ciniki.sysadmin.user\',null,\'M.ciniki_sysadmin_allusers.showUsers();\',\'mc\',{\'id\':\'' + d.user.id + '\'});'; }
        this.users.noData = function() { return 'ERROR - No sysadmins'; }
        this.users.addClose('Back');
    }   

    this.start = function(cb, appPrefix, args) {
        //  
        // Create the app container if it doesn't exist, and clear it out 
        // if it does exist.
        //  
        var appContainer = M.createContainer(appPrefix, 'ciniki_sysadmin_allusers', 'yes');
        if( appContainer == null ) { 
            alert('App Error');
            return false;
        }   
        this.showUsers(cb);
    }   

	this.showUsers = function(cb) {
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
}

