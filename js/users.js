//
//
function ciniki_sysadmin_users() {
	this.users = null;
	this.details = null;

	this.init = function() {
	}

	this.start = function(cb, appPrefix) {
		//
		// Create the app container if it doesn't exist, and clear it out
		// if it does exist.
		//
		var appContainer = M.createContainer(appPrefix, 'ciniki_sysadmin_users', 'yes');
		if( appContainer == null ) {
			alert('App Error');
			return false;
		} 

		//
		// Create the new panel
		//
		this.users = new M.panel('Sys Admins',
			'ciniki_sysadmin_users', 'users',
			appPrefix, 'medium', 'simplelist', 'ciniki.sysadmin.users');
		this.loadData();

		this.users.listValue = function(s, i, d) { return d['user']['firstname'] + ' ' + d['user']['lastname']; }
		this.users.listFn = function(s, i, d) { return 'M.ciniki_sysadmin_users.showDetails(' + i + ');'; }
		this.users.noData = function() { return 'ERROR - No sysadmins'; }
		this.users.addButton('add', 'Add', 'M.startModalApp(\'ciniki.users.add\', null, \'M.ciniki_sysadmin_users.add(data);\');');
		this.users.addClose('Back');

        //  
        // Setup the panel to show the details of an owner
        //  
        this.details = new M.panel('Sys Admin',
            'ciniki_sysadmin_users', 'details',
            appPrefix, 'medium', 'sectionedform', 'ciniki.sysadmin.users.details');
        this.details.data = null;
        this.details.form = {'':{'label':'', 'fields':{
            'email':{'label':'Email', 'type':'noedit'},
            'firstname':{'label':'First', 'type':'noedit'},
            'lastname':{'label':'Last', 'type':'noedit'},
            'display_name':{'label':'Display', 'type':'noedit'},
            }}};
        this.details.fieldValue = function(i, d) { return this.data[i]; }
        this.details.addButton('remove', 'Remove', '');
        this.details.addClose('back');

        this.users.show(cb);
	}

	this.loadData = function() {
		//
		// Get the detail for the user.  Do this for each request, to make sure
		// we have the current data.  If the user switches businesses, then we
		// want this data reloaded.
		//
		var rsp = M.api.getJSON('ciniki.users.getSysAdmins', {});
		if( rsp['stat'] != 'ok' ) {
			M.api.err(rsp);
			return false;
		}
		this.users.data = rsp['users'];
	}

    this.showDetails = function(uNUM) {
        this.details.data = this.users.data[uNUM]['user'];
        this.details.refresh();
        if( (M.userPerms & 0x01) == 0x01 ) { 
            // FIXME: Convert this to a better function!
            this.details.setButtonFn('remove', 'if( confirm(\'Are you sure you want to remove ' + this.users.data[uNUM]['user']['firstname'] + ' ' + this.users.data[uNUM]['user']['lastname'] + ' as an System Admin?\') == true ) {M.ciniki_sysadmin_users.remove(\'' + uNUM + '\',\'' + this.details.data['id'] + '\');}');         
		}           
		this.details.show('M.ciniki_sysadmin_users.users.show();');
	}   

	// 
	// Remove the user from being a sysadmin
	//
	this.remove = function(userNUM, userID) {
		// FIXME: Require users password for verification.
		var rsp = M.api.getJSON('ciniki.users.removeSysAdmin', {'business_id':M.curBusinessID, 'user_id':userID});
		if( rsp['stat'] != 'ok' ) {
			M.api.err(rsp);
		} else {
			delete(this.users.data[userNUM]);
		}
		this.users.refresh();
		this.details.close();
	}

	// 
	// add a user a sysadmin
	//
	this.add = function(data) {
		var userID = 0;
		if( data != null && data['id'] != null ) {
			userID = data['id'];
		}

		// FIXME: Add field for password, can only modify with password
		if( userID > 0 ) {
			var rsp = M.api.getJSON('ciniki.users.addSysAdmin', {'user_id':userID});
			if( rsp['stat'] != 'ok' ) {
				M.api.err(rsp);
			}
			this.loadData();
			this.users.refresh();
		}

		this.users.show();

		return false;
	}
}
