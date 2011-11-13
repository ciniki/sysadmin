//
//
function ciniki_sysadmin_userbusinesses() {
    this.users = null;
    this.details = null;

    this.init = function() {
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

        //  
        // Create the new panel
        //  
        this.users = new M.panel('Business Users',
            'ciniki_sysadmin_userbusinesses', 'users',
            appPrefix, 'medium', 'simplegrid', 'ciniki.sysadmin.users.businesses');
        this.loadData();
		this.users.num_cols = 2;
        this.users.cellValue = function(i, col, d) { 
			if( col == 0 ) { return this.data[i]['user']['firstname'] + ' ' + this.data[i]['user']['lastname']; }
			else if( col == 1 ) {
				var u = this.data[i]['user'];
				var p = '';
				var c = '';
				for(j in u['businesses']) {
					p += c + u['businesses'][j]['business']['name'];
					c = '<br/>';
				}
				return p;
			}
			return '';
		}
        this.users.rowFn = function(i, d) { return 'M.ciniki_sysadmin_userbusinesses.showDetails(' + i + ');'; }
        this.users.noData = function() { return 'ERROR - users'; }
        this.users.addClose('Back');

        //  
        // Setup the panel to show the details of an owner
        //  
        this.details = new M.panel('Business Users',
            'ciniki_sysadmin_userbusinesses', 'details',
            appPrefix, 'medium', 'sectionedlist', 'ciniki.sysadmin.users.businesses.details');
		this.details.data = {
			'info':{'label':'', 'list':{
				'firstname':{'label':'Firstname', 'value':''},
				'lastname':{'label':'Lastname', 'value':''},
				'email':{'label':'Email', 'value':''},
				'display_name':{'label':'Display Name', 'value':''},
				}},
			'businesses':{'label':'Businesses', 'list':{}},
			'actions':{'label':'Actions', 'list':{
				'resetpassword':{'label':'', 'value':'Reset Password', 'fn':'M.ciniki_sysadmin_userbusinesses.resetPassword();'},
				'setpassword':{'label':'', 'value':'Set Password', 'fn':'M.ciniki_sysadmin_userbusinesses.setPassword();'},
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
		this.details.sectionLabel = function(i, d) { return d['label']; }
		this.details.sectionList = function(i, d) { return d['list']; }
	
		this.details.noData = function(i) { return 'No user found'; }

        this.details.addClose('Back');

        this.users.show(cb);
    }   

	this.loadData = function() {
		var rsp = M.api.getJSON('ciniki.businesses.getAllOwners', {});
		if( rsp['stat'] != 'ok' ) {
			M.api.err(rsp);
			return false;
		}
		this.users.data = rsp['users'];
	}

    this.showDetails = function(uNUM) {
		// 
		// Setup the data for the details form
		//
		var businesses = this.users.data[uNUM]['user']['businesses'];
		this.details.data['businesses']['list'] = {};
		this.details.user_id = this.users.data[uNUM]['user']['id'];
		this.details.data['info']['list']['email']['value'] = this.users.data[uNUM]['user']['email'];
		this.details.data['info']['list']['firstname']['value'] = this.users.data[uNUM]['user']['firstname'];
		this.details.data['info']['list']['lastname']['value'] = this.users.data[uNUM]['user']['lastname'];
		this.details.data['info']['list']['display_name']['value'] = this.users.data[uNUM]['user']['display_name'];
		for(i in businesses ) {
			this.details.data['businesses']['list'][i] = {'label':'', 'value':businesses[i]['business']['name']};
		}

        this.details.refresh();
		//
		// Open with a callback to the businesses panel.
		//
        this.details.show('M.ciniki_sysadmin_userbusinesses.users.show();');
    }   

	this.resetPassword = function() {
        if( confirm("Are you sure you want to reset their password?") ) {
			var rsp = M.api.getJSON('ciniki.users.resetPassword', {'user_id':M.ciniki_sysadmin_userbusinesses.details.user_id});            
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
			var rsp = M.api.postJSON('ciniki.users.setPassword', {'user_id':M.ciniki_sysadmin_userbusinesses.details.user_id}, 'password='+encodeURIComponent(newpassword));
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
