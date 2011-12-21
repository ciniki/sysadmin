//
//
function ciniki_sysadmin_lockedusers() {
    this.users = null;
    this.details = null;

    this.init = function() {
    }   

    this.start = function(cb, appPrefix) {
        //  
        // Create the app container if it doesn't exist, and clear it out 
        // if it does exist.
        //  
        var appContainer = M.createContainer(appPrefix, 'ciniki_sysadmin_lockedusers', 'yes');
        if( appContainer == null ) { 
            alert('App Error');
            return false;
        }   

        //  
        // Create the new panel
        //  
        this.users = new M.panel('Locked Users',
            'ciniki_sysadmin_lockedusers', 'users',
            appPrefix, 'medium', 'sectioned', 'ciniki.sysadmin.privileged.users');
		this.users.sections = {
			'_':{'label':'', 'type':'simplegrid', 'num_cols':2, 
				'headerValues':['Name', 'Privileges'],
				},
			};
		this.users.sectionData = function(s) { return this.data; }
        this.loadData();
        this.users.cellValue = function(s, i, col, d) { 
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
        this.users.rowFn = function(s, i, d) { return 'M.ciniki_sysadmin_lockedusers.showDetails(' + i + ');'; }
        this.users.noData = function() { return 'No locked users'; }
        this.users.addClose('Back');

        //  
        // Setup the panel to show the details of an owner
        //  
        this.details = new M.panel('Locked User',
            'ciniki_sysadmin_lockedusers', 'details',
            appPrefix, 'medium', 'sectioned', 'ciniki.sysadmin.users.details');
        this.details.data = null;
        this.details.sections = {'':{'label':'', 'fields':{
            'email':{'label':'Email', 'type':'noedit'},
            'firstname':{'label':'First', 'type':'noedit'},
            'lastname':{'label':'Last', 'type':'noedit'},
            'display_name':{'label':'Display', 'type':'noedit'},
            }}};
        this.details.fieldValue = function(i, d) { return this.data[i]; }
        this.details.addClose('back');
        this.details.addButton('unlock', 'Unlock', 'M.ciniki_sysadmin_lockedusers.unlock();');

        this.users.show(cb);
    }   

	this.unlock = function() {
		if( this.details.user_id > 0 ) {
			var rsp = M.api.getJSON('ciniki.users.unlock', {'user_id':this.details.user_id});
			if( rsp['stat'] != 'ok' ) {
				M.api.err(rsp);
				return false;
			}
		}
		this.loadData();
		this.users.refresh();
		this.details.close();
	}

	this.loadData = function() {
		var rsp = M.api.getJSON('ciniki.users.getLockedUsers', {});
		if( rsp['stat'] != 'ok' ) {
			M.api.err(rsp);
			return false;
		}
		this.users.data = rsp['users'];
	}

    this.showDetails = function(uNUM) {
		this.details.user_id = this.users.data[uNUM]['user']['id'];
        this.details.data = this.users.data[uNUM]['user'];
        this.details.refresh();
        this.details.show('M.ciniki_sysadmin_lockedusers.users.show();');
    }   
}

