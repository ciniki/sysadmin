//
//
function ciniki_sysadmin_user() {
    this.details = null;

    this.init = function() {
        //  
        // Setup the panel to show the details of an owner
        //  
        this.details = new M.panel('User',
            'ciniki_sysadmin_user', 'details',
            'mc', 'medium', 'sectioned', 'ciniki.sysadmin.user.details');
		this.details.user_id = 0;
		this.details.data = null;
		this.details.sections = {
			'info':{'label':'', 'list':{
				'firstname':{'label':'Firstname', 'value':''},
				'lastname':{'label':'Lastname', 'value':''},
				'email':{'label':'Email', 'value':''},
				'display_name':{'label':'Display Name', 'value':''},
				'status':{'label':'Status', 'value':''},
				'timeout':{'label':'Timeout', 'value':''},
				'perms':{'label':'Permissions', 'value':''},
				'date_added':{'label':'Added', 'value':''},
				'last_updated':{'label':'Updated', 'value':''},
				'last_login':{'label':'Last Login', 'value':''},
				'last_pwd_change':{'label':'Pwd Updated', 'value':''},
				}},
			'businesses':{'label':'Businesses', 'type':'simplegrid', 'num_cols':1, 'headerValues':null},
			'_buttons':{'label':'', 'buttons':{
				'resetpassword':{'label':'Reset Password', 'fn':'M.ciniki_sysadmin_user.resetPassword();'},
				'setpassword':{'label':'Set Password', 'fn':'M.ciniki_sysadmin_user.setPassword();'},
				}},
            'authlogs':{'label':'Auth Log', 'type':'simplegrid', 'num_cols':2, 'limit_rows':5,
                'headerValues':['User','IP/Session'],
				'cellClasses':['multiline', 'multiline'],
				// FIXME: Add moreFn to allow full list of auth logs
            },  
//			'logs':{'label':'Logs', 'list':{
//				'authlogs':{'label':'', 'value':'Auth Logs'},
//				}},
			};
		this.details.user_id = 0;
		this.details.sectionData = function(s) {
			if( s == 'businesses' ) { return this.data['businesses']; }
			if( s == 'authlogs' ) { return this.data['authlogs']; }
			return this.sections[s].list;
		};
		this.details.listLabel = function(s, i, d) {
			if( d['label'] != null ) {
				return d['label'];
			}
		};
		this.details.listValue = function(s, i, d) { 
			if( s == 'logs' ) { return d.value; }
			if( i == 'timeout' && this.data.timeout == '0' ) { return 'default'; }
			if( i == 'perms' && parseInt(this.data.perms) == 0 ) { return '-'; }
			if( i == 'perms' && (parseInt(this.data.perms)&0x01) == 0x01 ) { return 'Sysadmin'; }
			if( i == 'status' ) {
				switch(this.data.status) {
					case '1': return 'Active';
					case '10': return 'Locked';
					case '11': return 'Deleted';
				}
				return 'Unknown';
			}
			return this.data[i];
		};
		this.details.cellValue = function(s, i, j, d) {
			if( s == 'businesses' ) { return d.business.name; }
			if( s == 'authlogs' ) {
				switch(j) {
					case 0: return '<span class=\'maintext\'>' + d.log.display_name + '</span><span class=\'subtext\'>' + d.log.age + '</span>';
					case 1: return '<span class=\'maintext\'>' + d.log.ip_address + '</span><span class=\'subtext\'>' + d.log.session_key + '</span>';
				}
			}
			// FIXME: add button to remove user from the business
		};
		this.details.rowFn = function(s, i, d) {
			if( s == 'authlogs' ) {
				return 'M.ciniki_sysadmin_user.showActionLogs(\'M.ciniki_sysadmin_user.details.show();\', ' + M.ciniki_sysadmin_user.details.user_id + ',\'' + d.log.session_key + '\');';
			}
		};
		this.details.listFn = function(s, i, d) {
			if( s == 'logs' && i == 'authlogs' ) {
				return 'M.ciniki_sysadmin_user.showAuthLogs(\'M.ciniki_sysadmin_user.details.show();\', ' + M.ciniki_sysadmin_user.details.user_id + ');';
			}
			if( s == 'authlogs' ) {
				return 'M.ciniki_sysadmin_user.showActionLogs(\'M.ciniki_sysadmin_user.details.show();\', ' + M.ciniki_sysadmin_user.details.user_id + ',\'' + d.log.session_key + '\');';
			}
			return null;
		};
		this.details.noData = function(s) { 
			if( s == 'authlogs' ) { return 'No auth logs'; }
			return 'No businesses found'; 
		};
        this.details.addClose('Back');

		//
		// The panel to show the auth log history
		//
		this.authlogs = new M.panel('Logs',
			'ciniki_sysadmin_user', 'authlogs',
			'mc', 'medium', 'sectioned', 'ciniki.sysadmin.user.authlogs');
		this.authlogs.user_id = 0;
		this.authlogs.data = null;
		this.authlogs.dataOrder = 'reverse';		// Display the newest logs at the top
        this.authlogs.sections = { 
            '_info':{'label':'', 'type':'simplegrid', 'num_cols':3, 'limit_rows':5,
                'headerValues':['username','api_key','ip_address'],
				'cellClasses':['multiline', '', 'multiline'],
            },  
        };  
        this.authlogs.sectionData = function(s) { return this.data; }
		this.authlogs.cellValue = function(s, i, j, data) { 
			switch(j) {
				case 0: return '<span class=\'maintext\'>' + data.log.display_name + '</span><span class=\'subtext\'>' + data.log.age + '</span>';
				case 1: return '<span class=\'maintext\'>' + data.log.ip_address + '</span><span class=\'subtext\'>' + data.log.session_key + '</span>';
			}
		}
		this.authlogs.addClose('Back');

		//
		// The panel for the action logs for a user
		//
		this.actionlogs = new M.panel('Action Logs',
			'ciniki_sysadmin_user', 'actionlogs',
			'mc', 'wide', 'sectioned', 'ciniki.monitoring.actionlogs');
		this.actionlogs.data = null;
		this.actionlogs.dataOrder = 'reverse';		// Display the newest logs at the top
        this.actionlogs.sections = { 
            '_info':{'label':'', 'type':'simplegrid', 'num_cols':2,
                'headerValues':['User','Action'],
				'cellClasses':['multiline', 'multiline'],
            },  
        };  
        this.actionlogs.sectionData = function(s) { return this.data; }
		this.actionlogs.cellValue = function(s, i, j, data) { 
			switch(j) {
				case 0: return '<span class="maintext">' + data.log.display_name + '</span><span class="subtext">' + data.log.age + '</span>';
				case 1: return '<span class="maintext">' + data.log.name + ' - ' + data.log.method + '</span><span class="subtext">' + data.log.action + '</span>';
			}
		}
//		this.actionlogs.addButton('update', 'Update', 'M.ciniki_monitoring_actionlogs.update();');
//		this.actionlogs.addButton('clear', 'Clear', 'M.ciniki_monitoring_actionlogs.clear();');
		this.actionlogs.addClose('Close');
    }   

	this.start = function(cb, appPrefix, aG) {
		args = {};
		if( aG != null ) {
			args = eval(aG);
		}

        //  
        // Create the app container if it doesn't exist, and clear it out 
        // if it does exist.
        //  
        var appContainer = M.createContainer(appPrefix, 'ciniki_sysadmin_user', 'yes');
        if( appContainer == null ) { 
            alert('App Error');
            return false;
        }   

		if( args.session_key != null && args.session_key != '' ) {
			this.showActionLogs(cb, args.id, args.session_key);
		} else {
			this.showDetails(cb, args.id);
		}
    }   

    this.showDetails = function(cb, id) {
		if( cb != null ) {
			this.details.cb = cb;
		}
		if( id == null ) {
			id = this.details.user_id;
		} else {
			this.details.user_id = id;
		}
		// 
		// Setup the data for the details form
		//
		var rsp = M.api.getJSON('ciniki.users.get', {'user_id':id});
		if( rsp['stat'] != 'ok' ) {
			M.api.err(rsp);
			return false;
		}
		this.details.data = rsp.user;

		if( rsp.user.status == 11 ) {
			this.details.sections._buttons.buttons['_delete'] = {'label':'Restore user', 'fn':'M.ciniki_sysadmin_user.undelete();'};
		} else {
			if( rsp.user.status == 1 ) {
				this.details.sections._buttons.buttons['_lock'] = {'label':'Lock user', 'fn':'M.ciniki_sysadmin_user.lock();'};
			} else if( rsp.user.status == 10 ) {
				this.details.sections._buttons.buttons['_lock'] = {'label':'Unlock user', 'fn':'M.ciniki_sysadmin_user.unlock();'};
			}
			this.details.sections._buttons.buttons['_delete'] = {'label':'Delete user', 'fn':'M.ciniki_sysadmin_user.delete();'};
		}
		if( (rsp.user.perms&0x01) == 0x01 ) {
			this.details.sections._buttons.buttons['_sysadmin'] = {'label':'Remove Sysadmin', 'fn':'M.ciniki_sysadmin_user.removeSysAdmin();'};
		} else {
			this.details.sections._buttons.buttons['_sysadmin'] = {'label':'Make Sysadmin', 'fn':'M.ciniki_sysadmin_user.makeSysAdmin();'};
		}

		var rsp = M.api.getJSON('ciniki.users.authLogs', {'user_id':id, 'limit':'6'});
		if( rsp['stat'] != 'ok' ) {
			M.api.err(rsp);
			return false;
		}
		this.details.data.authlogs = rsp.logs;

        this.details.refresh();
        this.details.show();
    }   

	this.resetPassword = function() {
        if( confirm("Are you sure you want to reset their password?") ) {
			var rsp = M.api.getJSON('ciniki.users.resetPassword', {'user_id':M.ciniki_sysadmin_user.details.user_id});            
			if( rsp['stat'] != 'ok' ) {
				M.api.err(rsp); 
				return false;
			}
			alert("Their password has been reset and emailed to them.");
		}
	}

	this.setPassword = function() {
		var newpassword = prompt("New password:", "");
		if( newpassword != null && newpassword != '' ) {
			var rsp = M.api.postJSON('ciniki.users.setPassword', {'user_id':M.ciniki_sysadmin_user.details.user_id}, 'password='+encodeURIComponent(newpassword));
			if( rsp['stat'] != 'ok' ) {
				M.api.err(rsp);
				return false;
			}
			alert('Password set');
		} else {
			alert('No password specified, nothing changed');
		}
	}

	this.lock = function() {
		if( this.details.user_id > 0 ) {
			var rsp = M.api.getJSON('ciniki.users.lock', {'user_id':this.details.user_id});
			if( rsp['stat'] != 'ok' ) {
				M.api.err(rsp);
				return false;
			}
		}
		this.showDetails();
	}
	this.unlock = function() {
		if( this.details.user_id > 0 ) {
			var rsp = M.api.getJSON('ciniki.users.unlock', {'user_id':this.details.user_id});
			if( rsp['stat'] != 'ok' ) {
				M.api.err(rsp);
				return false;
			}
		}
		this.showDetails();
	}

	this.delete = function() {
		if( confirm('Are you sure you want to delete ' + this.details.data.firstname + ' ' + this.details.data.lastname + '?') == true ) {
			var rsp = M.api.getJSON('ciniki.users.delete', {'business_id':M.curBusinessID, 'user_id':M.ciniki_sysadmin_user.details.user_id});
			if( rsp['stat'] != 'ok' ) {
				M.api.err(rsp);
			}
			this.showDetails();
		}
	}
	this.undelete = function() {
		var rsp = M.api.getJSON('ciniki.users.undelete', {'business_id':M.curBusinessID, 'user_id':M.ciniki_sysadmin_user.details.user_id});
		if( rsp['stat'] != 'ok' ) {
			M.api.err(rsp);
		}
		this.showDetails();
	}
	this.makeSysAdmin = function() {
		if( confirm('Are you sure you want to make ' + this.details.data.firstname + ' ' + this.details.data.lastname + ' a System Admin?') == true ) {
			var rsp = M.api.getJSON('ciniki.users.makeSysAdmin', {'business_id':M.curBusinessID, 'user_id':M.ciniki_sysadmin_user.details.user_id});
			if( rsp['stat'] != 'ok' ) {
				M.api.err(rsp);
			}
			this.showDetails();
		}
	}
	this.removeSysAdmin = function() {
		if( confirm('Are you sure you want to remove ' + this.details.data.firstname + ' ' + this.details.data.lastname + ' as a System Admin?') == true ) {
			var rsp = M.api.getJSON('ciniki.users.removeSysAdmin', {'business_id':M.curBusinessID, 'user_id':M.ciniki_sysadmin_user.details.user_id});
			if( rsp['stat'] != 'ok' ) {
				M.api.err(rsp);
			}
			this.showDetails();
		}
	}

	this.showAuthLogs = function(cb, uid) {
		if( uid != null && uid != 0 ) {
			this.authlogs.user_id = uid;
		}
		var rsp = M.api.getJSON('ciniki.users.authLogs', {'user_id':uid});
		if( rsp['stat'] != 'ok' ) {
			M.api.err(rsp);
			return false;
		}
		this.authlogs.data = rsp.logs;
		this.authlogs.refresh();
		this.authlogs.show(cb);
	}

	this.showActionLogs = function(cb, uid, sid) {
		if( uid != null && uid != 0 ) {
			M.ciniki_sysadmin_user.actionlogs.user_id = uid;
		}
		if( sid != null && sid != 0 ) {
			M.ciniki_sysadmin_user.actionlogs.session_key = sid;
		}
		var rsp = M.api.getJSON('ciniki.core.monitorActionLogs', {'session_key':this.actionlogs.session_key});
		if( rsp['stat'] != 'ok' ) {
			M.api.err(rsp);
			return false;
		}
		this.actionlogs.data = rsp.logs;
		this.actionlogs.refresh();
		this.actionlogs.show(cb);
	}
}
