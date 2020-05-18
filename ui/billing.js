//
// This app will display the tenants in the system, their current status, and billing status
//
function ciniki_sysadmin_billing() {
    this.tenants = null;

    this.init = function() {
        //
        // This panel will list the tenants in the system, their status, and subscription status.
        //
        this.tenants = new M.panel('Billing',
            'ciniki_sysadmin_billing', 'tenants',
            'mc', 'medium mediumflex', 'sectioned', 'ciniki.sysadmin.billing.tenants');
        this.tenants.sections = {};
        this.tenants.sectionData = function(s) { return this.data[s].tenants; }
        this.tenants.cellValue = function(s, i, j, d) { 
            if( d.tenant.status == 'Trial' && j == 1 ) {
                return '<span class="maintext">' + d.tenant.tenant_status + '</span><span class="subtext">' + d.tenant.trial_remaining + '</span>';
            }
            switch(j) {
                case 0: return '<span class="maintext">' + d.tenant.name + '</span><span class="subtext">' + d.tenant.payment_type + ' - ' + d.tenant.payment_frequency + '</span>';
                case 1: return d.tenant.tenant_status;
                case 2: return d.tenant.monthly + '/' + d.tenant.yearly;
                case 3: return '<span class="maintext">' + d.tenant.last_payment_date + '</span><span class="subtext">' + d.tenant.paid_until + '</span>';
            }
            return '';
        };
        this.tenants.footerValue = function(s, i, d) {
//          if( this.data.totals != null ) {
                switch(i) {
                    case 0: return '';
                    case 1: return '';
                    case 2: return this.data[s].monthly + '/' + this.data[s].yearly;
                    case 3: return '';
                }
//          }
        };
        this.tenants.footerClass = function(s, i, d) {
            if( i == 2 ) { return 'alignright'; }
            return '';
        };
        this.tenants.rowFn = function(s, i, d) { 
            if( d == null ) { return ''; }
            return 'M.startApp(\'ciniki.tenants.billing\',null,\'M.ciniki_sysadmin_billing.showTenants();\',\'mc\',{\'tnid\':\'' + d.tenant.id + '\'});'; 
        };
        this.tenants.noData = function() { return 'ERROR - No sysadmins'; }
        this.tenants.addClose('Back');
    }   

    this.start = function(cb, appPrefix) {
        //  
        // Create the app container if it doesn't exist, and clear it out 
        // if it does exist.
        //  
        var appContainer = M.createContainer(appPrefix, 'ciniki_sysadmin_billing', 'yes');
        if( appContainer == null ) { 
            M.alert('App Error');
            return false;
        }   

        this.showTenants(cb);
    };

    this.showTenants = function(cb) {
        var rsp = M.api.getJSONCb('ciniki.tenants.subscriptionStatus', {}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            var p = M.ciniki_sysadmin_billing.tenants;
            p.data = {};
            p.sections = {};
            for(i in rsp.statuses) {
                p.data[i] = rsp.statuses[i].status;
//              p.data[i].monthly = rsp.statuses[i].status.monthly;
//              p.data[i].yearly = rsp.statuses[i].status.yearly;
                p.sections[i] = {'label':rsp.statuses[i].status.status, 
                    'type':'simplegrid', 'num_cols':4, 'sortable':'yes',
                    'headerValues':['Tenant', 'Status', 'Monthly', 'Last Payment'],
                    'sortTypes':['text','text','text','number','date'],
                    'cellClasses':['multiline', 'multiline', 'aligncenter', 'multiline', ''],
                };
            }
            p.refresh();
            p.show(cb);
        });
    };
}
