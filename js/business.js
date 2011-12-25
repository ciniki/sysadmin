//
//
function ciniki_sysadmin_business() {
    this.details = null;

    this.init = function() {
        //  
        // Setup the panel to show the details of an owner
        //  
        this.details = new M.panel('User',
            'ciniki_sysadmin_business', 'details',
            'mc', 'medium', 'sectioned', 'ciniki.sysadmin.business.details');
		this.details.business_id = 0;
		this.details.data = null;
		this.details.sections = {
			'info':{'label':'', 'list':{
				'name':{'label':'Name', 'value':''},
				'uuid':{'label':'UUID', 'value':''},
				'status':{'label':'Status', 'value':''},
				'date_added':{'label':'Added', 'value':''},
				'last_updated':{'label':'Updated', 'value':''},
				}},
			'users':{'label':'Users', 'type':'simplegrid', 'num_cols':1, 'headerValues':null},
			'_buttons':{'label':'', 'buttons':{
				}},
			};
		this.details.sectionData = function(s) {
			if( s == 'users' ) { return this.data['users']; }
			return this.sections[s].list;
		};
		this.details.listLabel = function(s, i, d) {
			if( d['label'] != null ) {
				return d['label'];
			}
		};
		this.details.listValue = function(s, i, d) { 
			if( i == 'status' ) {
				switch(this.data.status) {
					case '1': return 'Active';
					case '90': return 'Archived';
					case '99': return 'Locked';
				}
				return 'Unknown';
			}
			return this.data[i];
		};
		this.details.cellValue = function(s, i, j, d) {
			return d.user.firstname + ' ' + d.user.lastname;
		};
		this.details.rowFn = function(s, i, d) { return 'M.startApp(\'ciniki.sysadmin.user\',null,\'M.ciniki_sysadmin_business.showDetails();\',\'mc\',{\'id\':\'' + d.user.id + '\'});'; }
		this.details.noData = function(i) { return 'No users found'; }
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
        var appContainer = M.createContainer(appPrefix, 'ciniki_sysadmin_business', 'yes');
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
			id = this.details.business_id;
		} else {
			this.details.business_id = id;
		}
		// 
		// Setup the data for the details form
		//
		var rsp = M.api.getJSON('ciniki.businesses.get', {'id':id});
		if( rsp['stat'] != 'ok' ) {
			M.api.err(rsp);
			return false;
		}
		this.details.data = rsp.business;

		this.details.sections._buttons.buttons = [];
		if( rsp.business.status == 1 ) {
			this.details.sections._buttons.buttons['_lock'] = {'label':'Lock Business', 'fn':'M.ciniki_sysadmin_business.lock();'};
			this.details.sections._buttons.buttons['_archive'] = {'label':'Archive Business', 'fn':'M.ciniki_sysadmin_business.archive();'};
		} else if( rsp.business.status == 90 ) {
			this.details.sections._buttons.buttons['_archive'] = {'label':'Activate Business', 'fn':'M.ciniki_sysadmin_business.activate();'};
		} else if( rsp.business.status == 99 ) {
			this.details.sections._buttons.buttons['_archive'] = {'label':'Unlock Business', 'fn':'M.ciniki_sysadmin_business.activate();'};
		}

        this.details.refresh();
        this.details.show();
    }   

	this.lock = function() {
        if( confirm("Are you sure you want to lock the business?") ) {
			var rsp = M.api.getJSON('ciniki.businesses.lock', {'id':M.ciniki_sysadmin_business.details.business_id});            
			if( rsp['stat'] != 'ok' ) {
				M.api.err(rsp); 
				return false;
			}
			this.showDetails();
		}
	}

	this.archive = function() {
		if( confirm('Are you sure you want to archive this business?') == true ) {
			var rsp = M.api.getJSON('ciniki.businesses.archive', {'id':M.ciniki_sysadmin_business.details.business_id});            
			if( rsp['stat'] != 'ok' ) {
				M.api.err(rsp); 
				return false;
			}
			this.showDetails();
		}
	}
	this.activate = function() {
		var rsp = M.api.getJSON('ciniki.businesses.activate', {'id':M.ciniki_sysadmin_business.details.business_id});            
		if( rsp['stat'] != 'ok' ) {
			M.api.err(rsp); 
			return false;
		}
		this.showDetails();
	}
}
