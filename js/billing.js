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
		this.businesses.sections = {};
		this.businesses.sectionData = function(s) { return this.data[s]; }
        this.businesses.cellValue = function(s, i, j, d) { 
			switch(j) {
				case 0: return '<span class="maintext">' + d.business.name + '</span><span class="subtext">' + d.business.payment_type + '</span>';
				case 1: return d.business.business_status;
				case 2: return d.business.monthly;
				case 3: return '<span class="maintext">' + d.business.last_payment_date + '</span><span class="subtext">' + d.business.paid_until + '</span>';
			}
			return '';
		};
		this.businesses.rowFn = function(s, i, d) { 
//			return 'M.startApp(\'ciniki.sysadmin.business\',null,\'M.ciniki_sysadmin_billing.showBusinesses();\',\'mc\',{\'id\':\'' + d.business.id + '\'});'; 
			return 'M.startApp(\'ciniki.businesses.billing\',null,\'M.ciniki_sysadmin_billing.showBusinesses();\',\'mc\',{\'business_id\':\'' + d.business.id + '\'});'; 
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
//		this.businesses.data = rsp.statuses;
		this.businesses.data = {};
		this.businesses.sections = {};
		for(i in rsp.statuses) {
			this.businesses.data[i] = rsp.statuses[i].status.businesses;
			this.businesses.sections[i] = {'label':rsp.statuses[i].status.status, 
				'type':'simplegrid', 'num_cols':4, 'sortable':'yes',
				'headerValues':['Business', 'Status', 'Monthly', 'Last Payment'],
				'sortTypes':['text','text','text','number','date'],
				'cellClasses':['multiline', 'aligncenter', 'aligncenter', 'multiline', ''],
			};
		}
		this.businesses.refresh();
		this.businesses.show(cb);
	};
}
