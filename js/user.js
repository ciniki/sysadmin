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
            appPrefix, 'medium', 'sectioned', 'ciniki.sysadmin.users.businesses.details');
		this.details.sections = {
			'info':{'label':'', 'list':{
				'firstname':{'label':'Firstname', 'value':''},
				'lastname':{'label':'Lastname', 'value':''},
				'email':{'label':'Email', 'value':''},
				'display_name':{'label':'Display Name', 'value':''},
				}},
			'businesses':{'label':'Businesses', 'list':{}},
			'actions':{'label':'Actions', 'list':{
				'resetpassword':{'label':'', 'value':'Reset Password', 'fn':'M.ciniki_sysadmin_user.resetPassword();'},
				'setpassword':{'label':'', 'value':'Set Password', 'fn':'M.ciniki_sysadmin_user.setPassword();'},
				}},
			};
		this.details.user_id = 0;
		this.details.listLabel = function(s, i, d) {
			if( d['label'] != null ) {
				return d['label'];
			}
		};
		this.details.listValue = function(s, i, d) { 
			if( d['value'] != null ) {
				return d['value'];
			}
		};
		this.details.listFn = function(s, i, d) { 
			if( d['fn'] != null ) { 
				return d['fn']; 
			} 
			return '';
		};
	
		this.details.noData = function(i) { return 'No user found'; }

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

		this.details.showDetails(cb, args['id']);
    }   

    this.showDetails = function(cb, id) {
		// 
		// Setup the data for the details form
		//
		//
		
		FIXME: Add query to pull all user information, businesses, avatar, etc...
		       The display form where it can all be changed, reset etc..., similar to bottling_appointment.
			   button for block/disable/delete to turn user off
			   button to lock/unlock account
			   button to remove from business
			   button to enable/disable sysadmin



		var businesses = this.users.data[uNUM]['user']['businesses'];
		this.details.sections['businesses']['list'] = {};
		this.details.user_id = this.users.data[uNUM]['user']['id'];
		this.details.sections['info']['list']['email']['value'] = this.users.data[uNUM]['user']['email'];
		this.details.sections['info']['list']['firstname']['value'] = this.users.data[uNUM]['user']['firstname'];
		this.details.sections['info']['list']['lastname']['value'] = this.users.data[uNUM]['user']['lastname'];
		this.details.sections['info']['list']['display_name']['value'] = this.users.data[uNUM]['user']['display_name'];
		for(i in businesses ) {
			this.details.sections['businesses']['list'][i] = {'label':'', 'value':businesses[i]['business']['name']};
		}

        this.details.refresh();
		//
		// Open with a callback to the businesses panel.
		//
        this.details.show('M.ciniki_sysadmin_user.users.show();');
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
}
