//
// This app will display the businesses in the system, their current status, and billing status
//
function ciniki_sysadmin_billing() {
    this.businesses = null;

    this.init = function() {
		
		//
		// This panel will list the businesses in the system, their status, and subscription status.
		//
        this.businesses = new M.panel('Billing',
            'ciniki_sysadmin_billing', 'businesses',
           	'mc', 'medium', 'sectioned', 'ciniki.sysadmin.billing.businesses');
		this.businesses.sections = {
			'_':{'label':'', 'type':'simplegrid', 'num_cols':5, 'sortable':'yes',
				'headerValues':['Business', 'Status', 'Subscription', 'Monthly', 'Last Payment'],
				'sortTypes':['text','text','text','number','date'],
				'cellClasses':['', 'aligncenter', 'aligncenter', '', ''],
				},
			};
		this.businesses.sectionData = function(s) { return this.data; }
        this.businesses.cellValue = function(s, i, col, d) { 
			switch(col) {
				case 0: return d.business.name;
				case 1: return d.business.business_status;
				case 2: return d.business.status;
				case 3: return d.business.monthly;
				case 4: return d.business.last_payment_date;
			}
			return '';
		};
		this.businesses.rowFn = function(s, i, d) { 
			return 'M.startApp(\'ciniki.sysadmin.business\',null,\'M.ciniki_sysadmin_billing.showBusinesses();\',\'mc\',{\'id\':\'' + d.business.id + '\'});'; 
		};
        this.businesses.noData = function() { return 'ERROR - No sysadmins'; }
        this.businesses.addClose('Back');

    }   

    this.start = function(cb, appPrefix) {
        //  
        // Create the app container if it doesn't exist, and clear it out 
        // if it does exist.
        //  
        var appContainer = M.createContainer(appPrefix, 'ciniki_sysadmin_billing', 'yes');
        if( appContainer == null ) { 
            alert('App Error');
            return false;
        }   

		this.showBusinesses(cb);
    };

	this.showBusinesses = function(cb) {
		var rsp = M.api.getJSON('ciniki.businesses.subscriptionStatus', {});
		if( rsp['stat'] != 'ok' ) {
			M.api.err(rsp);
			return false;
		}
		this.businesses.data = rsp.businesses;
		this.businesses.refresh();
		this.businesses.show(cb);
	};

}
