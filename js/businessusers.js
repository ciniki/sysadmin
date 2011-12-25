//
//
function ciniki_sysadmin_businessusers() {
    this.businesses = null;

    this.init = function() {
        this.businesses = new M.panel('Business Users',
            'ciniki_sysadmin_businessusers', 'businesses',
           	'mc', 'medium', 'sectioned', 'ciniki.sysadmin.business.users');
		this.businesses.sections = {
			'_':{'label':'', 'type':'simplegrid', 'num_cols':2, 
				'headerValues':['Business', 'Users'],
				},
			};
		this.businesses.sectionData = function(s) { return this.data; }
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
		this.businesses.rowFn = function(s, i, d) { return 'M.startApp(\'ciniki.sysadmin.business\',null,\'M.ciniki_sysadmin_businessusers.showBusinesses();\',\'mc\',{\'id\':\'' + d.business.id + '\'});'; }
        this.businesses.noData = function() { return 'ERROR - No sysadmins'; }
        this.businesses.addClose('Back');
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

        this.businesses.cb = cb;
		this.showBusinesses();
    }   

	this.showBusinesses = function() {
		var rsp = M.api.getJSON('ciniki.businesses.getAll', {});
		if( rsp['stat'] != 'ok' ) {
			M.api.err();
			return false;
		}
		this.businesses.data = rsp['businesses'];
		this.businesses.refresh();
		this.businesses.show();
	}
}
