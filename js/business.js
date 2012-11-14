//
//
function ciniki_sysadmin_business() {
    this.details = null;

    this.init = function() {
        //  
        // Setup the panel to show the details of an owner
        //  
        this.details = new M.panel('Business',
            'ciniki_sysadmin_business', 'details',
            'mc', 'medium', 'sectioned', 'ciniki.sysadmin.business.details');
		this.details.business_id = 0;
		this.details.data = null;
		this.details.sections = {
			'info':{'label':'', 'list':{
				'name':{'label':'Name', 'value':''},
				'uuid':{'label':'UUID', 'value':''},
				'business_status':{'label':'Status', 'value':''},
				'date_added':{'label':'Added', 'value':''},
				'last_updated':{'label':'Updated', 'value':''},
				}},
			'subscription':{'label':'Subscription', 'type':'simplelist', 'list':{
				'subscription_status_text':{'label':'Status'},
				'currency':{'label':'Currency'},
				'monthly':{'label':'Amount'},
				'trial':{'label':'Trial remaining'},
				'last_payment_date':{'label':'Last Payment'},
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
			if( i == 'business_status' ) {
				switch(this.data.business_status) {
					case '1': return 'Active';
					case '50': return 'Suspended';
					case '60': return 'Deleted';
				}
				return 'Unknown';
			}
			if( s == 'subscription' ) {
				switch (i) {
					case 'monthly': return '$' + this.data.monthly + '/month';
					case 'trial': return this.data.trial_remaining + ' days';
				}
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
		if( rsp.business.business_status == 1 ) {
			this.details.sections._buttons.buttons['_suspend'] = {'label':'Suspend Business', 'fn':'M.ciniki_sysadmin_business.suspend();'};
			this.details.sections._buttons.buttons['_delete'] = {'label':'Delete Business', 'fn':'M.ciniki_sysadmin_business.delete();'};
		} else if( rsp.business.business_status == 50 ) {
			this.details.sections._buttons.buttons['_suspend'] = {'label':'Activate Business', 'fn':'M.ciniki_sysadmin_business.activate();'};
		}

		this.details.sections.subscription.list.trial.visible = 'no';
		if( rsp.trial_remaining > 0 ) {
			this.details.sections.subscription.list.trial.visible = 'yes';
		}

        this.details.refresh();
        this.details.show();
    }   

	this.suspend = function() {
        if( confirm("Are you sure you want to suspend the business?") ) {
			var rsp = M.api.getJSON('ciniki.businesses.suspend', {'id':M.ciniki_sysadmin_business.details.business_id});            
			if( rsp['stat'] != 'ok' ) {
				M.api.err(rsp); 
				return false;
			}
			this.showDetails();
		}
	}

	this.delete = function() {
		if( confirm('Are you sure you want to delete this business?  No information will be removed from the database.') == true ) {
			var rsp = M.api.getJSON('ciniki.businesses.delete', {'id':M.ciniki_sysadmin_business.details.business_id});            
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
