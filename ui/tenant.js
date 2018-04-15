//
//
function ciniki_sysadmin_tenant() {
    this.details = null;

    //  
    // Setup the panel to show the details of an owner
    //  
    this.details = new M.panel('Tenant', 'ciniki_sysadmin_tenant', 'details', 'mc', 'medium', 'sectioned', 'ciniki.sysadmin.tenant.details');
    this.details.tnid = 0;
    this.details.data = null;
    this.details.sections = {
        'info':{'label':'', 'list':{
            'name':{'label':'Name', 'value':''},
            'uuid':{'label':'UUID', 'value':''},
            'category':{'label':'Category', 'value':''},
            'tenant_status':{'label':'Status', 'value':''},
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
        if( i == 'tenant_status' ) {
            switch(this.data.tenant_status) {
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
    this.details.rowFn = function(s, i, d) { return 'M.startApp(\'ciniki.sysadmin.user\',null,\'M.ciniki_sysadmin_tenant.details.open();\',\'mc\',{\'id\':\'' + d.user.id + '\'});'; }
    this.details.noData = function(i) { return 'No users found'; }
    this.details.open = function(cb, id) {
        if( id != null ) { this.tnid = id; }
        // 
        // Setup the data for the details form
        //
        M.api.getJSONCb('ciniki.tenants.get', {'id':this.tnid}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            var p = M.ciniki_sysadmin_tenant.details;
            p.data = rsp.tenant;

            p.sections._buttons.buttons = {};
            if( rsp.tenant.tenant_status == 1 ) {
                p.sections._buttons.buttons._suspend = {'label':'Suspend Tenant', 'fn':'M.ciniki_sysadmin_tenant.suspend();'};
                p.sections._buttons.buttons._delete = {'label':'Delete Tenant', 'fn':'M.ciniki_sysadmin_tenant.tenantdelete();'};
            } else if( rsp.tenant.tenant_status == 50 ) {
                p.sections._buttons.buttons._suspend = {'label':'Activate Tenant', 'fn':'M.ciniki_sysadmin_tenant.activate();'};
            } else if( rsp.tenant.tenant_status == 60 ) {
                p.sections._buttons.buttons._undelete = {'label':'Activate Tenant', 'fn':'M.ciniki_sysadmin_tenant.activate();'};
                p.sections._buttons.buttons._purge = {'label':'Purge Tenant', 'fn':'M.ciniki_sysadmin_tenant.purge();'};
            }

            p.sections.subscription.list.trial.visible = 'no';
            if( rsp.trial_remaining > 0 ) {
                p.sections.subscription.list.trial.visible = 'yes';
            }

            p.refresh();
            p.show(cb);
        });
    }
    this.details.suspend = function() {
        if( confirm("Are you sure you want to suspend the tenant?") ) {
            M.api.getJSONCb('ciniki.tenants.suspend', {'id':this.tnid}, function(rsp) {
                if( rsp.stat != 'ok' ) {
                    M.api.err(rsp); 
                    return false;
                }
                M.ciniki_sysadmin_tenant.details.open();
            });
        }
    }
    this.details.tenantdelete = function() {
        if( confirm('Are you sure you want to delete this tenant?  No information will be removed from the database.') == true ) {
            M.api.getJSONCb('ciniki.tenants.delete', {'id':this.tnid}, function(rsp) {
                if( rsp.stat != 'ok' ) {
                    M.api.err(rsp); 
                    return false;
                }
                M.ciniki_sysadmin_tenant.details.open();
            });
        }
    }
    this.details.activate = function() {
        M.api.getJSONCb('ciniki.tenants.activate', {'id':this.tnid}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp); 
                return false;
            }
            M.ciniki_sysadmin_tenant.details.open();
        });
    }
    this.details.purge = function() {
        if( confirm('Are you sure you want to purge this tenant?  All information will be removed!') == true ) {
            if( confirm('Please confirm deletion') ) {
                M.api.getJSONCb('ciniki.tenants.purge', {'tnid':this.tnid}, function(rsp) {
                    if( rsp.stat != 'ok' ) {
                        M.api.err(rsp); 
                        return false;
                    }
                    M.ciniki_sysadmin_tenant.details.close();
                });
            }
        }
    }
    this.details.addButton('edit', 'Edit', 'M.ciniki_sysadmin_tenant.edit.open(\'M.ciniki_sysadmin_tenant.details.open();\',M.ciniki_sysadmin_tenant.details.tnid);');
    this.details.addClose('Back');

    //
    // The edit panel for tenant details
    //
    this.edit = new M.panel('Tenant Information', 'ciniki_sysadmin_tenant', 'edit', 'mc', 'medium', 'sectioned', 'ciniki.sysadmin.tenant.edit');
    this.edit.sections = {
        'general':{'label':'General', 'fields':{
            'tenant.name':{'label':'Name', 'type':'text'},
            'tenant.category':{'label':'Category', 'type':'text', 'livesearch':'yes', 'livesearchempty':'yes'},
            'tenant.sitename':{'label':'Sitename', 'type':'text'},
            'tenant.tagline':{'label':'Tagline', 'type':'text'},
            'tenant.flags':{'label':'Options', 'type':'flags', 'flags':{'1':{'name':'Reseller'}}},
            'tenant.reseller_id':{'label':'Reseller', 'type':'select', 'options':{}, 'complex_options':{'value':'id', 'name':'name'}},
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
            }},
        '_buttons':{'label':'', 'buttons':{
            'save':{'label':'Save', 'fn':'M.ciniki_sysadmin_tenant.edit.save();'},
            }},
        };
    this.edit.fieldValue = function(s, i, d) { return this.data[i]; };
    this.edit.fieldHistoryArgs = function(s, i) {
        return {'method':'ciniki.tenants.getDetailHistory', 'args':{'tnid':M.ciniki_sysadmin_tenant.edit.tnid, 'field':i}};
    };
    this.edit.liveSearchCb = function(s, i, value) {
        if( i == 'tenant.category' ) {
            M.api.getJSONBgCb('ciniki.tenants.searchCategory', {'tnid':M.curTenantID, 'start_needle':value, 'limit':15}, function(rsp) {
                M.ciniki_sysadmin_tenant.edit.liveSearchShow(s, i, M.gE(M.ciniki_sysadmin_tenant.edit.panelUID + '_' + i), rsp.results);
            });
        }
    };
    this.edit.liveSearchResultValue = function(s, f, i, j, d) {
        if( f == 'tenant.category' && d.result != null ) { return d.result.name; }
        return '';
    };
    this.edit.liveSearchResultRowFn = function(s, f, i, j, d) { 
        if( f == 'tenant.category' && d.result != null ) {
            return 'M.ciniki_sysadmin_tenant.edit.updateField(\'' + s + '\',\'' + f + '\',\'' + escape(d.result.name) + '\');';
        }
    };
    this.edit.updateField = function(s, fid, result) {
        M.gE(this.panelUID + '_' + fid).value = unescape(result);
        this.removeLiveSearch(s, fid);
    };
    this.edit.open = function(cb, bid) {
        if( bid != null ) { this.tnid = bid; }
        //
        // Get the detail for the tenant.  
        //
        M.api.getJSONCb('ciniki.sysadmin.tenantGet', {'tnid':this.tnid, 'keys':'tenant,contact'}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            var p = M.ciniki_sysadmin_tenant.edit;
            p.data = rsp.details;
            p.sections.general.fields['tenant.reseller_id'].options = rsp.resellers;
            p.show(cb);
        });
    }
    this.edit.save = function() {
        // Serialize the form data into a string for posting
        var c = this.serializeForm('no');
        if( c != '' ) {
            M.api.postJSONCb('ciniki.sysadmin.tenantUpdate', {'tnid':this.tnid}, c, function(rsp) {
                if( rsp.stat != 'ok' ) {
                    M.api.err(rsp);
                    return false;
                }
                M.ciniki_sysadmin_tenant.edit.close();
            });
        } else {
            this.close();
        }
    }
    this.edit.addButton('save', 'Save', 'M.ciniki_sysadmin_tenant.edit.save();');
    this.edit.addClose('Cancel');

    this.start = function(cb, appPrefix, aG) {
        args = {};
        if( aG != null ) {
            args = eval(aG);
        }

        //  
        // Create the app container if it doesn't exist, and clear it out 
        // if it does exist.
        //  
        var appContainer = M.createContainer(appPrefix, 'ciniki_sysadmin_tenant', 'yes');
        if( appContainer == null ) { 
            alert('App Error');
            return false;
        }

        this.details.open(cb, args.id);
    }   
}
