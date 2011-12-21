//
//
function ciniki_sysadmin_businessusers() {
    this.businesses = null;
    this.details = null;

    this.init = function() {
    }   

    this.start = function(cb, appPrefix) {
        //  
        // Create the app container if it doesn't exist, and clear it out 
        // if it does exist.
        //  
        var appContainer = M.createContainer(appPrefix, 'ciniki_sysadmin_businessusers', 'yes');
        if( appContainer == null ) { 
            alert('App Error');
            return false;
        }   

        //  
        // Create the new panel
        //  
        this.businesses = new M.panel('Business Users',
            'ciniki_sysadmin_businessusers', 'businesses',
            appPrefix, 'medium', 'sectioned', 'ciniki.sysadmin.business.users');
		this.businesses.sections = {
			'_':{'label':'', 'type':'simplegrid', 'num_cols':2, 
				'headerValues':['Business', 'Users'],
				},
			};
		this.businesses.sectionData = function(s) { return this.data; }
        this.loadData();
		this.businesses.num_cols = 2;
        this.businesses.cellValue = function(s, i, col, d) { 
			if( col == 0 ) { return d['business']['name']; }
			else if( col == 1 ) {
				var b = this.data[i]['business'];
				var p = '';
				var c = '';
				for(j in b['users']) {
					p += c + b['users'][j]['user']['firstname']
						+ ' ' + b['users'][j]['user']['lastname'];
					c = '<br/>';
				}
				return p;
			}
			return '';
		}
        this.businesses.rowFn = function(s, i, d) { return 'M.ciniki_sysadmin_businessusers.showDetails(' + i + ');'; }
        this.businesses.noData = function() { return 'ERROR - No sysadmins'; }
        this.businesses.addClose('Back');

        //  
        // Setup the panel to show the details of an owner
        //  
        this.details = new M.panel('Business User',
            'ciniki_sysadmin_businessusers', 'details',
            appPrefix, 'medium', 'sectioned', 'ciniki.sysadmin.business.users.details');
        this.details.data = {'name':'',};
		this.details.sections = {
			'name':{'label':'Name', 'fields':{
				'name':{'label':'First', 'hidelabel':'yes', 'type':'noedit'}
				}},
			'users':{'label':'Owners', 'fields':{}},
			};
        this.details.fieldValue = function(i, d) { 
			if( i == 'name' ) { return this.data['name']; }
			else { return this.data[i]['name']; }
			}
        this.details.addClose('Back');

        this.businesses.show(cb);
    }   

	this.loadData = function() {
		var rsp = M.api.getJSON('ciniki.businesses.getAll', {});
		if( rsp['stat'] != 'ok' ) {
			M.api.err();
			return false;
		}
		this.businesses.data = rsp['businesses'];
	}

    this.showDetails = function(bNUM) {
		// 
		// Setup the data for the details form
		//
		var users = this.businesses.data[bNUM]['business']['users'];
		this.details.sections['users']['fields'] = {};
		this.details.data['name'] = this.businesses.data[bNUM]['business']['name'];
		for(i in users ) {
			this.details.sections['users']['fields']['u_' + users[i]['user']['id']] = {'label':'Name', 'hidelabel':'yes', 'type':'noedit'};
			this.details.data['u_' + users[i]['user']['id']] = {'name':users[i]['user']['firstname'] + ' ' + users[i]['user']['lastname'],};
		}

        this.details.refresh();
		// Open with a callback to the businesses panel.
        this.details.show('M.ciniki_sysadmin_businessusers.businesses.show();');
    }   
}
