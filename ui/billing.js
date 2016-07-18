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
            'mc', 'medium mediumflex', 'sectioned', 'ciniki.sysadmin.billing.businesses');
        this.businesses.sections = {};
        this.businesses.sectionData = function(s) { return this.data[s].businesses; }
        this.businesses.cellValue = function(s, i, j, d) { 
            if( d.business.status == 'Trial' && j == 1 ) {
                return '<span class="maintext">' + d.business.business_status + '</span><span class="subtext">' + d.business.trial_remaining + '</span>';
            }
            switch(j) {
                case 0: return '<span class="maintext">' + d.business.name + '</span><span class="subtext">' + d.business.payment_type + ' - ' + d.business.payment_frequency + '</span>';
                case 1: return d.business.business_status;
                case 2: return d.business.monthly + '/' + d.business.yearly;
                case 3: return '<span class="maintext">' + d.business.last_payment_date + '</span><span class="subtext">' + d.business.paid_until + '</span>';
            }
            return '';
        };
        this.businesses.footerValue = function(s, i, d) {
//          if( this.data.totals != null ) {
                switch(i) {
                    case 0: return '';
                    case 1: return '';
                    case 2: return this.data[s].monthly + '/' + this.data[s].yearly;
                    case 3: return '';
                }
//          }
        };
        this.businesses.footerClass = function(s, i, d) {
            if( i == 2 ) { return 'alignright'; }
            return '';
        };
        this.businesses.rowFn = function(s, i, d) { 
//          return 'M.startApp(\'ciniki.sysadmin.business\',null,\'M.ciniki_sysadmin_billing.showBusinesses();\',\'mc\',{\'id\':\'' + d.business.id + '\'});'; 
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
        var rsp = M.api.getJSONCb('ciniki.businesses.subscriptionStatus', {}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            var p = M.ciniki_sysadmin_billing.businesses;
            p.data = {};
            p.sections = {};
            for(i in rsp.statuses) {
                p.data[i] = rsp.statuses[i].status;
//              p.data[i].monthly = rsp.statuses[i].status.monthly;
//              p.data[i].yearly = rsp.statuses[i].status.yearly;
                p.sections[i] = {'label':rsp.statuses[i].status.status, 
                    'type':'simplegrid', 'num_cols':4, 'sortable':'yes',
                    'headerValues':['Business', 'Status', 'Monthly', 'Last Payment'],
                    'sortTypes':['text','text','text','number','date'],
                    'cellClasses':['multiline', 'multiline', 'aligncenter', 'multiline', ''],
                };
            }
            p.refresh();
            p.show(cb);
        });
    };
}
