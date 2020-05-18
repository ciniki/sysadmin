//
// The app to manage tenants domains for a tenant
//
function ciniki_sysadmin_domains() {
    
    this.domainFlags = {
        '1':{'name':'Primary'},
        };
    this.domainStatus = {
        '1':'Active',
        '50':'Suspended',
        '60':'Deleted',
        };
    
    this.menu = new M.panel('Web Domains',
        'ciniki_sysadmin_domains', 'menu',
        'mc', 'xlarge', 'sectioned', 'ciniki.sysadmin.domains.menu');
    this.menu.data = {};
    this.menu.sections = {
        'domains':{'label':'', 'type':'simplegrid', 'num_cols':3,
            'headerValues':['Tenant', 'Domain', 'Expiry'],
            'cellClasses':['multiline', 'multiline', 'multiline'],
            },
    };
    this.menu.noData = function(s) { return 'No domains added'; }
    this.menu.sectionData = function(s) { return this.data; }
    this.menu.cellValue = function(s, i, j, d) {
        if( j == 0 ) {
            return '<span class="maintext">' + d.domain.tenant_name + '</span><span class="subtext">' + d.domain.tenant_status + '</span>';
        }
        if( j == 1 ) {
            var primary = '';
            if( d.domain.isprimary == 'yes' ) {
                primary = ' - Primary';
            }
            if( d.domain.managed_by != '' ) {
                primary += ' - ' + d.domain.managed_by;
            }
            return '<span class="maintext">' + d.domain.domain + '</span><span class="subtext">' + M.ciniki_sysadmin_domains.domainStatus[d.domain.status] + primary + '</span>';
        }
        if( j == 2 ) {
            var age = '';
            if( d.domain.expire_in_days < 0 ) {
                age = '<b>' + Math.abs(parseInt(d.domain.expire_in_days)) + ' days ago</span>';
            } else if( d.domain.expire_in_days == 0 ) {
                age = '<b>TODAY</b>';
            } else if( d.domain.expire_in_days > 0 ) {
                age = parseInt(d.domain.expire_in_days) + ' days';
            }
            return '<span class="maintext">' + d.domain.expiry_date + '</span><span class="subtext">' + age + '</span>';
        }
    }
    this.menu.rowStyle = function(s, i, d) {
        if( d.domain.expire_in_days < 15 ) {
            return 'background: #fbb;';
        } else if( d.domain.expire_in_days < 60 ) {
            return 'background: #ffb;';
        } 
        return '';
    };
    this.menu.rowFn = function(s, i, d) {
        return 'M.ciniki_sysadmin_domains.edit.open(\'M.ciniki_sysadmin_domains.menu.open();\',' + d.domain.id + ');';
    };
    this.menu.open = function(cb) {
        M.api.getJSONCb('ciniki.sysadmin.domainListAll', {}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            var p = M.ciniki_sysadmin_domains.menu;
            p.data = rsp.domains;
            p.refresh();
            p.show(cb);
        });
    }
    this.menu.addClose('Back');

    //
    // Edit panel
    //
    this.edit = new M.panel('Edit Domain',
        'ciniki_sysadmin_domains', 'edit',
        'mc', 'medium', 'sectioned', 'ciniki.sysadmin.domains.edit');
    this.edit.domain_id = 0;
    this.edit.tenant_id = 0;
    this.edit.data = {'status':'1'};
    this.edit.sections = {
        'info':{'label':'', 'fields':{
            'domain':{'label':'Domain/Site', 'type':'text'},
            'flags':{'label':'', 'type':'flags', 'join':'yes', 'flags':this.domainFlags},
            'status':{'label':'Status', 'type':'multitoggle', 'toggles':this.domainStatus},
            'expiry_date':{'label':'Expiry', 'type':'date'},
            'managed_by':{'label':'Managed', 'type':'text'},
            }},
        '_buttons':{'label':'', 'buttons':{
            'save':{'label':'Save', 'fn':'M.ciniki_sysadmin_domains.edit.save();'},
            'delete':{'label':'Delete', 'fn':'M.ciniki_sysadmin_domains.edit.remove();'},
            }},
        };
    this.edit.fieldValue = function(s, i, d) { return this.data[i]; }
    this.edit.fieldHistoryArgs = function(s, i) {
        return {'method':'ciniki.sysadmin.domainHistory', 'args':{'tnid':this.tenant_id, 
            'domain_id':M.ciniki_sysadmin_domains.edit.domain_id, 'field':i}};
    }
    this.edit.open = function(cb, did) {
        this.reset();
        if( did != null ) { this.domain_id = did; }
        if( this.domain_id > 0 ) {
            this.sections._buttons.buttons.delete.visible = 'yes';
            M.api.getJSONCb('ciniki.sysadmin.domainGet', {'domain_id':this.domain_id}, function(rsp) {
                if( rsp.stat != 'ok' ) {
                    M.api.err(rsp);
                    return false;
                }
                var p = M.ciniki_sysadmin_domains.edit;
                p.data = rsp.domain;
                p.tenant_id = rsp.domain.tnid;
                p.refresh();
                p.show(cb);
            });
        } else {
            this.sections._buttons.buttons.delete.visible = 'no';
            this.data = {};
            this.refresh();
            this.show(cb);
        }
    }
    this.edit.save = function() {
        if( this.domain_id > 0 ) {
            var c = this.serializeForm('no');
            if( c != '' ) {
                M.api.postJSONCb('ciniki.sysadmin.domainUpdate', 
                    {'tenant_id':this.tenant_id, 'domain_id':this.domain_id}, c, function(rsp) {
                        if( rsp.stat != 'ok' ) {
                            M.api.err(rsp);
                            return false;
                        } 
                        M.ciniki_sysadmin_domains.edit.close();
                    });
            } else {
                this.close();
            }
        }
    }
    this.edit.remove = function() {
        M.confirm("Are you sure you want to remove the domain '" + this.data.domain + "' ?",null,function() {
            M.api.getJSONCb('ciniki.sysadmin.domainDelete', {'tenant_id':M.ciniki_sysadmin_domains.edit.tenant_id, 'domain_id':M.ciniki_sysadmin_domains.edit.domain_id}, function(rsp) {
                if( rsp.stat != 'ok' ) {
                    M.api.err(rsp);
                    return false;
                }
                M.ciniki_sysadmin_domains.edit.close();
            });
        });
    }
    this.edit.addButton('save', 'Save', 'M.ciniki_sysadmin_domains.edit.save();');
    this.edit.addClose('Cancel');


    this.start = function(cb, ap, aG) {
        args = {};
        if( aG != null ) {
            args = eval(aG);
        }

        //
        // Create the app container if it doesn't exist, and clear it out
        // if it does exist.
        //
        var appContainer = M.createContainer(ap, 'ciniki_sysadmin_domains', 'yes');
        if( appContainer == null ) {
            M.alert('App Error');
            return false;
        } 

        if( args != null && args.tenant != null && args.tenant != '' ) {
            M.curTenantID = args.tenant;
        }
//      if( args != null && args.domain != null && args.domain != '' ) {
//          this.showDomain(cb, args.domain);
//      } else {
            this.menu.open(cb);
//      }
    }

};
