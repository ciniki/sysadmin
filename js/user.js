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
			};
		this.details.user_id = 0;
		this.details.sectionData = function(s) {
			if( s == 'businesses' ) { return this.data['businesses']; }
			return this.sections[s].list;
		};
		this.details.listLabel = function(s, i, d) {
			if( d['label'] != null ) {
				return d['label'];
			}
		};
		this.details.listValue = function(s, i, d) { 
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
			return d.business.name;
			// FIXME: add button to remove user from the business
		};
		this.details.noData = function(i) { return 'No businesses found'; }
        this.details.addClose('Back');
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

		this.showDetails(cb, args['id']);
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
}
