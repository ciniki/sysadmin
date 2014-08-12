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
				'category':{'label':'Category', 'value':''},
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
			if( s == 'users' ) { return this.data.users; }
			return this.sections[s].list;
		};
		this.details.listLabel = function(s, i, d) {
			if( d.label != null ) {
				return d.label;
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
		this.details.addButton('edit', 'Edit', 'M.ciniki_sysadmin_business.showEdit(\'M.ciniki_sysadmin_business.showDetails();\',M.ciniki_sysadmin_business.details.business_id);');
        this.details.addClose('Back');

		//
		// The edit panel for business details
		//
		this.edit = new M.panel('Business Information',
			'ciniki_sysadmin_business', 'edit',
			'mc', 'medium', 'sectioned', 'ciniki.sysadmin.business.edit');
		this.edit.sections = {
			'general':{'label':'General', 'fields':{
				'business.name':{'label':'Name', 'type':'text'},
				'business.category':{'label':'Category', 'type':'text', 'livesearch':'yes', 'livesearchempty':'yes'},
				'business.sitename':{'label':'Sitename', 'type':'text'},
				'business.tagline':{'label':'Tagline', 'type':'text'},
				}},
			'contact':{'label':'Contact', 'fields':{
				'contact.person.name':{'label':'Name', 'type':'text'},
				'contact.phone.number':{'label':'Phone', 'type':'text'},
				'contact.tollfree.number':{'label':'Tollfree', 'type':'text'},
				'contact.fax.number':{'label':'Fax', 'type':'text'},
				'contact.email.address':{'label':'Email', 'type':'text'},
				}},
			'address':{'label':'Address', 'fields':{
				'contact.address.street1':{'label':'Street', 'type':'text'},
				'contact.address.street2':{'label':'Street', 'type':'text'},
				'contact.address.city':{'label':'City', 'type':'text'},
				'contact.address.province':{'label':'Province', 'type':'text'},
				'contact.address.postal':{'label':'Postal', 'type':'text'},
				'contact.address.country':{'label':'Country', 'type':'text'},
				}}
			};
		this.edit.fieldValue = function(s, i, d) { return this.data[i]; };
		this.edit.fieldHistoryArgs = function(s, i) {
			return {'method':'ciniki.businesses.getDetailHistory', 'args':{'business_id':M.ciniki_sysadmin_business.edit.business_id, 'field':i}};
		};
		this.edit.liveSearchCb = function(s, i, value) {
			if( i == 'business.category' ) {
				var rsp = M.api.getJSONBgCb('ciniki.businesses.searchCategory', 
					{'business_id':M.curBusinessID, 'start_needle':value, 'limit':15},
					function(rsp) {
						M.ciniki_sysadmin_business.edit.liveSearchShow(s, i, M.gE(M.ciniki_sysadmin_business.edit.panelUID + '_' + i), rsp.results);
					});
			}
		};
		this.edit.liveSearchResultValue = function(s, f, i, j, d) {
			if( f == 'business.category' && d.result != null ) { return d.result.name; }
			return '';
		};
		this.edit.liveSearchResultRowFn = function(s, f, i, j, d) { 
			if( f == 'business.category' && d.result != null ) {
				return 'M.ciniki_sysadmin_business.edit.updateField(\'' + s + '\',\'' + f + '\',\'' + escape(d.result.name) + '\');';
			}
		};
		this.edit.updateField = function(s, fid, result) {
			M.gE(this.panelUID + '_' + fid).value = unescape(result);
			this.removeLiveSearch(s, fid);
		};
		this.edit.addButton('save', 'Save', 'M.ciniki_sysadmin_business.save();');
		this.edit.addClose('Cancel');
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

		this.showDetails(cb, args.id);
    }   

    this.showDetails = function(cb, id) {
		if( id != null ) {
			this.details.business_id = id;
		}
		// 
		// Setup the data for the details form
		//
		var rsp = M.api.getJSONCb('ciniki.businesses.get', {'id':this.details.business_id}, function(rsp) {
			if( rsp.stat != 'ok' ) {
				M.api.err(rsp);
				return false;
			}
			var p = M.ciniki_sysadmin_business.details;
			p.data = rsp.business;

			p.sections._buttons.buttons = [];
			if( rsp.business.business_status == 1 ) {
				p.sections._buttons.buttons._suspend = {'label':'Suspend Business', 'fn':'M.ciniki_sysadmin_business.suspend();'};
				p.sections._buttons.buttons._delete = {'label':'Delete Business', 'fn':'M.ciniki_sysadmin_business.delete();'};
			} else if( rsp.business.business_status == 50 ) {
				p.sections._buttons.buttons._suspend = {'label':'Activate Business', 'fn':'M.ciniki_sysadmin_business.activate();'};
			} else if( rsp.business.business_status == 60 ) {
				p.sections._buttons.buttons._undelete = {'label':'Activate Business', 'fn':'M.ciniki_sysadmin_business.activate();'};
				p.sections._buttons.buttons._purge = {'label':'Purge Business', 'fn':'M.ciniki_sysadmin_business.purge();'};
			}

			p.sections.subscription.list.trial.visible = 'no';
			if( rsp.trial_remaining > 0 ) {
				p.sections.subscription.list.trial.visible = 'yes';
			}

			p.refresh();
			p.show(cb);
		});
    }

	this.suspend = function() {
        if( confirm("Are you sure you want to suspend the business?") ) {
			var rsp = M.api.getJSONCb('ciniki.businesses.suspend', 
				{'id':M.ciniki_sysadmin_business.details.business_id}, function(rsp) {
					if( rsp.stat != 'ok' ) {
						M.api.err(rsp); 
						return false;
					}
					M.ciniki_sysadmin_business.showDetails();
				});
		}
	}

	this.delete = function() {
		if( confirm('Are you sure you want to delete this business?  No information will be removed from the database.') == true ) {
			var rsp = M.api.getJSONCb('ciniki.businesses.delete', 
				{'id':M.ciniki_sysadmin_business.details.business_id}, function(rsp) {
					if( rsp.stat != 'ok' ) {
						M.api.err(rsp); 
						return false;
					}
					M.ciniki_sysadmin_business.showDetails();
				});
		}
	}
	this.activate = function() {
		var rsp = M.api.getJSONCb('ciniki.businesses.activate', 
			{'id':M.ciniki_sysadmin_business.details.business_id}, function(rsp) {
				if( rsp.stat != 'ok' ) {
					M.api.err(rsp); 
					return false;
				}
				M.ciniki_sysadmin_business.showDetails();
			});
	}

	this.purge = function() {
		if( confirm('Are you sure you want to purge this business?  All information will be removed!') == true ) {
			if( confirm('Please confirm deletion') ) {
				var rsp = M.api.getJSONCb('ciniki.businesses.purge', 
					{'business_id':M.ciniki_sysadmin_business.details.business_id}, function(rsp) {
						if( rsp.stat != 'ok' ) {
							M.api.err(rsp); 
							return false;
						}
						M.ciniki_sysadmin_business.details.close();
					});
			}
		}
	}

	this.showEdit = function(cb, bid) {
		if( bid != null ) {
			this.edit.business_id = bid;
		}
		//
		// Get the detail for the business.  
		//
		var rsp = M.api.getJSONCb('ciniki.businesses.getDetails', 
			{'business_id':this.edit.business_id, 'keys':'business,contact'}, function(rsp) {
				if( rsp.stat != 'ok' ) {
					M.api.err(rsp);
					return false;
				}
				var p = M.ciniki_sysadmin_business.edit;
				p.data = rsp.details;
				p.show(cb);
			});
	}

	this.save = function() {
		// Serialize the form data into a string for posting
		var c = this.edit.serializeForm('no');
		if( c != '' ) {
			var rsp = M.api.postJSONCb('ciniki.businesses.updateDetails', 
				{'business_id':this.edit.business_id}, c, function(rsp) {
					if( rsp.stat != 'ok' ) {
						M.api.err(rsp);
						return false;
					}
					M.ciniki_sysadmin_business.edit.close();
				});
		} else {
			this.edit.close();
		}
	}
}
