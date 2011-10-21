//
//
function ciniki_sysadmin_privilegedusers() {
    this.users = null;
    this.details = null;

    this.init = function() {
    }   

    this.start = function(cb, appPrefix) {
        //  
        // Create the app container if it doesn't exist, and clear it out 
        // if it does exist.
        //  
        var appContainer = M.createContainer(appPrefix, 'ciniki_sysadmin_privilegedusers', 'yes');
        if( appContainer == null ) { 
            alert('App Error');
            return false;
        }   

        //  
        // Create the new panel
        //  
        this.users = new M.panel('Privileged Users',
            'ciniki_sysadmin_privilegedusers', 'users',
            appPrefix, 'medium', 'simplegrid', 'ciniki.sysadmin.privileged.users');
        this.loadData();
		this.users.num_cols = 2;
        this.users.cellValue = function(i, col, d) { 
			if( col == 0 ) { return d['user']['firstname'] + ' ' + d['user']['lastname']; }
			else if( col == 1 ) {
				var u = this.data[i]['user'];
				var p = '';
				var c = '';
				if( (u['perms'] & 0x01) ) { p += c + 'sysadmin'; c = ', '; }
				if( (u['perms'] & 0x02) ) { p += c + 'admin'; c = ', '; }
				if( (u['perms'] & 0x04) ) { p += c + 'www'; c = ', '; }
				return p;
			}
			return '';
		}
        this.users.rowFn = function(i, d) { return 'M.ciniki_sysadmin_privilegedusers.showDetails(' + i + ');'; }
        this.users.noData = function() { return 'ERROR - No sysadmins'; }
        this.users.addClose('Back');

        //  
        // Setup the panel to show the details of an owner
        //  
        this.details = new M.panel('Privileged User',
            'ciniki_sysadmin_privilegedusers', 'details',
            appPrefix, 'medium', 'sectionedform', 'ciniki.sysadmin.users.details');
        this.details.data = null;
        this.details.form = {'':{'label':'', 'fields':{
            'email':{'label':'Email', 'type':'noedit'},
            'firstname':{'label':'First', 'type':'noedit'},
            'lastname':{'label':'Last', 'type':'noedit'},
            'display_name':{'label':'Display', 'type':'noedit'},
            }}};
        this.details.fieldValue = function(i, d) { return this.data[i]; }
        this.details.addClose('back');

        this.users.show(cb);
    }   

	this.loadData = function() {
		var rsp = M.api.getJSON('ciniki.users.getPrivilegedUsers', {});
		if( rsp['stat'] != 'ok' ) {
			M.api.err(rsp);
			return false;
		}
		this.users.data = rsp['users'];
	}

    this.showDetails = function(uNUM) {
        this.details.data = this.users.data[uNUM]['user'];
        this.details.refresh();
        this.details.show('M.ciniki_sysadmin_privilegedusers.users.show();');
    }   
}

