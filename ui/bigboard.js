//
//
function ciniki_sysadmin_bigboard() {
    this.lastTimestamp = '';
    this.runAutoUpdate = 'no';
    this.main = null;
    this.bugPriorities = {'10':'<span class="icon">Q</span>', '30':'<span class="icon">W</span>', '50':'<span class="icon">E</span>'};
    this.bugSettings = null;

    this.init = function() {
    }

    this.start = function(cb, appPrefix) {
        //
        // Create the app container if it doesn't exist, and clear it out
        // if it does exist.
        //
        var appContainer = M.createContainer(appPrefix, 'ciniki_sysadmin_bigboard', 'yes');
        if( appContainer == null ) {
            M.alert('App Error');
            return false;
        } 

        this.main = new M.panel('Sessions',
            'ciniki_sysadmin_bigboard', 'main',
            appPrefix, 'medium', 'sectioned', 'ciniki.sysadmin.bigboard.main');
        this.main.paneltab = 'summary';
        this.main.data = {'problemsyncs':{}, 'expiringdomain':{}, 'sessions':{}};
        this.main.dataOrder = 'reverse';        // Display the newest sessions at the top
        this.main.tabs = {'label':'', 'type':'paneltabs', 'selected':'summary', 'tabs':{
            'summary':{'label':'Summary', 'fn':'M.ciniki_sysadmin_bigboard.showSummary();'},
            'syncs':{'label':'Syncs', 'fn':'M.ciniki_sysadmin_bigboard.showSyncs();'},
            'auths':{'label':'Auths', 'fn':'M.ciniki_sysadmin_bigboard.showAuths();'},
            'activeusers':{'label':'Users', 'fn':'M.ciniki_sysadmin_bigboard.showActiveUsers();'},
            'mail':{'label':'Mail', 'fn':'M.ciniki_sysadmin_bigboard.showMail();'},
//          'bugs':{'label':'Bugs', 'fn':'M.ciniki_sysadmin_bigboard.showBugs();'},
            'errors':{'label':'Errors', 'fn':'M.ciniki_sysadmin_bigboard.showErrors();'},
            }};
        this.main.tab_sections = {};
        this.main.tab_sections.summary = { 
            'tabs':this.main.tabs,
            'problemsyncs':{'label':'Problem Syncs', 'visible':'yes', 
                'type':'simplegrid', 'num_cols':4,
                'headerValues':['Tenant','Inc', 'Partial', 'Full'],
                'cellClasses':['multiline', 'multiline', 'multiline', 'multiline'],
                'noData':'No syncs',
            },
            'expiringdomains':{'label':'Expiring Domains', 'visible':'yes', 
                'type':'simplegrid', 'num_cols':3,
                'headerValues':['Tenant','Domain','Expiry'],
                'cellClasses':['multiline', 'multiline', 'multiline'],
            },
            'mail':{'label':'Mail Stats', 'visible':'yes', 'type':'simplegrid', 'num_cols':6,
                'headerValues':['Tenant','Pending','Queued','QFail', 'Sending','Failed'],
                'cellClasses':['','',''],
                'dataMaps':[0,7,10,15,20,50],
                'noData':'No mail found',
            },
            'sessions':{'label':'Sessions', 'type':'simplegrid', 'num_cols':2,
                'headerValues':['User','Application'],
                'cellClasses':['multiline', 'multiline', 'multiline'],
            },
        };
        this.main.tab_sections.syncs = {
            'tabs':this.main.tabs,
            'syncs':{'label':'', 'type':'simplegrid', 'num_cols':5,
                'headerValues':['Tenant','Type', 'Inc', 'Partial', 'Full'],
                'cellClasses':['multiline', 'multiline', 'multiline', 'multiline', 'multiline'],
                'noData':'No syncs',
            },
        };
        this.main.tab_sections.auths = {
            'tabs':this.main.tabs,
            'logs':{'label':'', 'type':'simplegrid', 'num_cols':5,
                'headerValues':['username', 'ip_address'],
                'cellClasses':['multiline', 'multiline'],
            },
        };
        this.main.tab_sections.activeusers = {
            'tabs':this.main.tabs,
            'activeusers':{'label':'', 'type':'simplegrid', 'num_cols':2,
                'headerValues':['User', 'Last Login'],
                'cellClasses':['multiline', 'multiline'],
            },
        };
        this.main.tab_sections.bugs = {
            'tabs':this.main.tabs,
            'bugs':{'label':'', 'type':'simplegrid', 'num_cols':3,
                'headerValues':['','ID','Subject'],
                'cellClasses':['','multiline','multiline'],
                'noData':'No bugs found',
            },  
        };
        this.main.tab_sections.mail = {
            'tabs':this.main.tabs,
            'mail':{'label':'', 'type':'simplegrid', 'num_cols':6,
                'headerValues':['Tenant','Pending','Queued','QFail', 'Sending','Failed'],
                'cellClasses':['','',''],
                'dataMaps':[0,7,10,15,20,50],
                'noData':'No mail found',
            },  
        };
        this.main.tab_sections.errors = {
            'tabs':this.main.tabs,
            'errors':{'label':'', 'type':'simplegrid', 'num_cols':3,
                'headerValues':['Tenant/User','Method','Date'],
                'cellClasses':['multiline','multiline','multiline'],
                'noData':'No errors found',
            },  
        };
        this.main.noData = function(s) {
            if( this.sections[s].noData != null ) {
                return this.sections[s].noData;
            }
            return '';
        };
        this.main.sectionData = function(s) { return this.data[s]; }
        this.main.cellValue = function(s, i, j, d) {
            if( s == 'sessions' ) {
                switch(j) {
                    case 0: return '<span class="maintext">' + d.session.display_name + '</span>' 
                        + '<span class="subtext">' + d.session.age + '</span>';
                    case 1: return '<span class="maintext">' + d.session.date_added + '</span>'
                        + '<span class="subtext">' + d.session.last_saved + '</span>';
                }
            } else if( s == 'expiringdomains' ) {
                switch(j) {
                    case 0: return '<span class="maintext">' + d.domain.tenant_name + '</span>' 
                        + '<span class="subtext">' + d.domain.tenant_status + '</span>';
                    case 1: var primary = ''; 
                        var primary = '';
                        if( d.domain.isprimary == 'yes' ) {
                            primary = ' - Primary';
                        }
                        if( d.domain.managed_by != '' ) {
                            primary = ' - ' + d.domain.managed_by;
                        }
                        return '<span class="maintext">' + d.domain.domain + '</span><span class="subtext">' + d.domain.status_text + primary + '</span>';
                    case 2: 
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
            } else if( s == 'problemsyncs' ) {
                switch(j) {
                    case 0: return '<span class="maintext">' + d.sync.tenant_name + '</span><span class="subtext">' + d.sync.remote_name + '</span>';
                    case 1: return (d.sync.last_sync!='')?'<span class="maintext">'+d.sync.last_sync.replace(/ ([0-9]+:[0-9]+ ..)/,'</span><span class="subtext">$1')+'</span>':'never';
                    case 2: return (d.sync.last_partial!='')?'<span class="maintext">'+d.sync.last_partial.replace(/ ([0-9]+:[0-9]+ ..)/,'</span><span class="subtext">$1')+'</span>':'never';
                    case 3: return (d.sync.last_full!='')?'<span class="maintext">'+d.sync.last_full.replace(/ ([0-9]+:[0-9]+ ..)/,'</span><span class="subtext">$1')+'</span>':'never';
                }
            } else if( s == 'syncs' ) {
                switch(j) {
                    case 0: return '<span class="maintext">' + d.sync.tenant_name + '</span><span class="subtext">' + d.sync.remote_name + '</span>';
                    case 1: return '<span class="multitext">' + d.sync.type + '</span><span class="subtext">' + d.sync.status_text + '</span>';
                    case 2: return (d.sync.last_sync!='')?'<span class="maintext">'+d.sync.last_sync.replace(/ ([0-9]+:[0-9]+ ..)/,'</span><span class="subtext">$1')+'</span>':'never';
                    case 3: return (d.sync.last_partial!='')?'<span class="maintext">'+d.sync.last_partial.replace(/ ([0-9]+:[0-9]+ ..)/,'</span><span class="subtext">$1')+'</span>':'never';
                    case 4: return (d.sync.last_full!='')?'<span class="maintext">'+d.sync.last_full.replace(/ ([0-9]+:[0-9]+ ..)/,'</span><span class="subtext">$1')+'</span>':'never';
                }
            } else if( s == 'logs' ) {
                switch(j) {
                    case 0: return '<span class="maintext">' + d.log.display_name + '</span><span class="subtext">' + d.log.age + '</span>';
                    case 1: return '<span class="maintext">' + d.log.ip_address + '</span><span class="subtext">' + d.log.session_key + '</span>';
                }
            } else if( s == 'activeusers' ) {
                switch(j) {
                    case 0: return d.user.name;
                    case 1: return d.user.log_date;
                }
            } else if( s == 'bugs' ) {
                switch(j) {
                    case 0: return '<span class="icon">' + M.ciniki_sysadmin_bigboard.bugPriorities[d.bug.priority] + '</span>';
//                  case 0: return '<span class="icon">' + d.bug.priority + '</span>';
                    case 1: return '<span class="maintext">' + '#' + d.bug.id + '</span><span class="subtext">' + d.bug.type + '</span>';
                    case 2: return '<span class="maintext">' + d.bug.subject + '</span><span class="subtext">' + d.bug.source + ':' + d.bug.source_link + '</span>';
                }
            } else if( s == 'errors' ) {
                switch(j) {
                    case 0: return '<span class=\'maintext\'>' + d.error.tenant_name + '</span><span class=\'subtext\'>' + d.error.user_name + '</span>';
                    case 1: return '<span class=\'maintext\'>' + d.error.method + '</span><span class=\'subtext\'>' + d.error.session_key + '</span>';
                    case 2: return '<span class=\'maintext\'>' + d.error.log_date + '</span><span class=\'subtext\'>' + d.error.age + ' ago</span>';
                }
            } else if( s == 'mail' ) {
                if( j == 0 ) { return d.messages.name; }
                for(var k in d.messages.status) {
                    if( d.messages.status[k].status.status == this.sections[s].dataMaps[j] ) {
                        return d.messages.status[k].status.num_messages;
                    }
                }
                return '';
            }
        }
        this.main.cellFn = function(s, i, j, d) {
            if( s == 'sessions' && j == 0 ) {
                return 'M.startApp(\'ciniki.sysadmin.user\',null,\'M.ciniki_sysadmin_bigboard.update();\',\'mc\',{\'id\':\'' + d.session.user_id + '\'});';
            } else if( s == 'sessions' && j == 1 ) {
                return 'M.startApp(\'ciniki.sysadmin.user\',null,\'M.ciniki_sysadmin_bigboard.update();\',\'mc\',{\'id\':\'' + d.session.user_id + '\',\'session_key\':\'' + d.session.session_key + '\'});';
            } else if( s == 'logs' && j == 0 ) {
                return 'M.startApp(\'ciniki.sysadmin.user\',null,\'M.ciniki_sysadmin_bigboard.update();\',\'mc\',{\'id\':\'' + d.log.user_id + '\'});';
            } else if( s == 'logs' && j == 1 ) {
                return 'M.startApp(\'ciniki.sysadmin.user\',null,\'M.ciniki_sysadmin_bigboard.update();\',\'mc\',{\'id\':\'' + d.log.user_id + '\',\'session_key\':\'' + d.log.session_key + '\'});';
            }
            return null;
        };
        this.main.cellStyle = function(s, i, j, d) {
            if( s == 'problemsyncs' ) {
                if( j == 1 && d.sync.last_sync_status == 'alert' ) {
                    return 'background: #fbb;';
                } else if( j == 1 && d.sync.last_sync_status == 'warn' ) {
                    return 'background: #ffb;';
                } else if( j == 2 && d.sync.last_partial_status == 'alert' ) {
                    return 'background: #fbb;';
                } else if( j == 2 && d.sync.last_partial_status == 'warn' ) {
                    return 'background: #ffb;';
                } else if( j == 3 && d.sync.last_full_status == 'alert' ) {
                    return 'background: #fbb;';
                } else if( j == 3 && d.sync.last_full_status == 'warn' ) {
                    return 'background: #ffb;';
                }
            }
            if( s == 'syncs' ) {
                if( j == 2 && d.sync.last_sync_status == 'alert' ) {
                    return 'background: #fbb;';
                } else if( j == 2 && d.sync.last_sync_status == 'warn' ) {
                    return 'background: #ffb;';
                } else if( j == 3 && d.sync.last_partial_status == 'alert' ) {
                    return 'background: #fbb;';
                } else if( j == 3 && d.sync.last_partial_status == 'warn' ) {
                    return 'background: #ffb;';
                } else if( j == 4 && d.sync.last_full_status == 'alert' ) {
                    return 'background: #fbb;';
                } else if( j == 4 && d.sync.last_full_status == 'warn' ) {
                    return 'background: #ffb;';
                }
            }
            if( s == 'expiringdomains' && j == 2 ) {
                if( d.domain.expire_in_days < 15 ) {
                    return 'background: #fbb;';
                } else if( d.domain.expire_in_days < 60 ) {
                    return 'background: #ffb;';
                } 
            }
            return '';
        };
        this.main.rowStyle = function(s,i,d) {
            if( s == 'bugs' ) {
                if( d.bug.priority > 0 ) {
                    return 'background: ' + M.ciniki_sysadmin_bigboard.bugSettings['colours.priority.' + d.bug.priority];
                }
            }
        };
        this.main.rowFn = function(s, i, d) {
            if( s == 'expiringdomains' || s == 'domains' ) {
                return 'M.startApp(\'ciniki.tenants.domains\',null,\'M.ciniki_sysadmin_bigboard.update();\',\'mc\',{\'domain\':\'' + d.domain.id + '\',\'tenant\':\'' + d.domain.tnid + '\'});';
            } else if( s == 'problemsyncs' || s == 'syncs' ) {
                return 'M.startApp(\'ciniki.tenants.sync\',null,\'M.ciniki_sysadmin_bigboard.update();\',\'mc\',{\'sync\':\'' + d.sync.id + '\',\'tenant\':\'' + d.sync.tnid + '\'});';
            } else if( s == 'activeusers' ) {
                return 'M.startApp(\'ciniki.sysadmin.user\',null,\'M.ciniki_sysadmin_bigboard.update();\',\'mc\',{\'id\':\'' + d.user.id + '\'});';
            } else if( s == 'bugs' ) {
                return 'M.startApp(\'ciniki.bugs.main\',null,\'M.ciniki_sysadmin_bigboard.update();\',\'mc\',{\'bug_id\':\'' + d.bug.id + '\'});';
            } else if( s == 'errors' ) {
                return 'M.startApp(\'ciniki.sysadmin.errors\',null,\'M.ciniki_sysadmin_bigboard.update();\',\'mc\',{\'id\':\'' + d.error.id + '\',\'list\':M.ciniki_sysadmin_bigboard.main.data.errors});';
            }
            return '';
        };
//      this.main.addButton('update', 'Update', 'M.ciniki_sysadmin_sessions.update();');
//      this.main.addButton('clear', 'Clear', 'M.ciniki_sysadmin_sessions.clear();');
        this.main.addClose('Close');
        this.main.addButton('refresh', 'Refresh', 'M.ciniki_sysadmin_bigboard.update();');
        this.main.show(cb);

        // Reset the timestamp so all the logs are loaded
        this.lastTimestamp = '';
        
//      this.autoUpdate();
        this.update();
    }

    this.update = function() {
        if( this.main.paneltab == 'summary' ) {
            this.main.sections = this.main.tab_sections.summary;
            this.main.sections.tabs.selected = 'summary';
            this.main.data = {
                'sessions':{}, 
                'problemsyncs':{}, 
                'expiringdomains':{}, 
                'bugs':{},
                'errors':{},
                };
            this.main.refresh();
            this.main.show();

            // Load session info
            M.api.getJSONBgCb('ciniki.core.bigboard', {'last_timestamp':this.lastTimestamp}, function(rsp) {
                if( rsp.stat != 'ok' ) {
                    M.api.err(rsp);
                    return false;
                }
                var p = M.ciniki_sysadmin_bigboard.main;
                p.data.sessions = rsp.sessions;
                p.refreshSection('sessions');
            });
        
            // Get sync info
            M.api.getJSONBgCb('ciniki.core.syncInfo', {}, function(rsp) {
                if( rsp.stat != 'ok' ) {
                    M.api.err(rsp);
                    return false;
                }
                var p = M.ciniki_sysadmin_bigboard.main;
                if( rsp.syncs != null && rsp.syncs.length > 0 ) {
                    for(i in rsp.syncs) {
                        if( rsp.syncs[i].sync.sync_status != 'ok' ) {
                            p.data.problemsyncs[i] = rsp.syncs[i];
                        }
                    }
                }
                p.refreshSection('problemsyncs');
            });
                
            // Get mail status
            M.api.getJSONBgCb('ciniki.sysadmin.mailStats', {}, function(rsp) {
                if( rsp.stat != 'ok' ) {
                    M.api.err(rsp);
                    return false;
                }
                var p = M.ciniki_sysadmin_bigboard.main;
                if( rsp.mail != null && rsp.mail.length > 0 ) {
                    p.data.mail = rsp.mail;
                }
                p.refreshSection('mail');
            });
            // Get expiring domains
            M.api.getJSONBgCb('ciniki.tenants.domainExpiries', {}, function(rsp) {
                if( rsp.stat != 'ok' ) {
                    M.api.err(rsp);
                    return false;
                }
                var p = M.ciniki_sysadmin_bigboard.main;
                if( rsp.domains != null && rsp.domains.length > 0 ) {
                    p.data.expiringdomains = rsp.domains;
                    p.sections.expiringdomains.visible = 'yes';
                } else {
                    p.sections.expiringdomains.visible = 'no';
                }
                p.refreshSection('expiringdomains');
            });
        } else if( this.main.paneltab == 'syncs' ) {
            var rsp = M.api.getJSONCb('ciniki.core.syncInfo', {}, function(rsp) {
                if( rsp.stat != 'ok' ) {
                    M.api.err(rsp);
                    return false;
                }
                var p = M.ciniki_sysadmin_bigboard.main;
                p.data = {'syncs':rsp.syncs};
                p.sections = p.tab_sections.syncs;
                p.sections.tabs.selected = 'syncs';
                p.refresh();
                p.show();
            });
        } else if( this.main.paneltab == 'auths' ) {
            var rsp = M.api.getJSONCb('ciniki.users.monitorAuthLogs', {'last_timestamp':''}, function(rsp) {
                if( rsp.stat != 'ok' ) {
                    M.api.err(rsp);
                    return false;
                }
                var p = M.ciniki_sysadmin_bigboard.main;
                p.data = {'logs':rsp.logs};
                p.sections = p.tab_sections.auths;
                p.sections.tabs.selected = 'auths';
                p.refresh();
                p.show();
            });
        } else if( this.main.paneltab == 'activeusers' ) {
            var rsp = M.api.getJSONCb('ciniki.users.activeUsers', {}, function(rsp) {
                if( rsp.stat != 'ok' ) {
                    M.api.err(rsp);
                    return false;
                }
                var p = M.ciniki_sysadmin_bigboard.main;
                p.data = {'activeusers':rsp.users};
                p.sections = p.tab_sections.activeusers;
                p.sections.tabs.selected = 'activeusers';
                p.refresh();
                p.show();
            });
        } else if( this.main.paneltab == 'bugs' ) {
            var rsp = M.api.getJSONCb('ciniki.bugs.bugList', {'tnid':M.masterTenantID, 
                'order':'latestupdated', 'status':'1', 'limit':'25'}, function(rsp) {
                    if( rsp.stat != 'ok' ) {
                        M.api.err(rsp);
                        return false;
                    }
                    var p = M.ciniki_sysadmin_bigboard.main;
                    p.data = {'bugs':rsp.bugs};
                    p.sections = p.tab_sections.bugs;
                    p.sections.tabs.selected = 'bugs';
                    if( this.bugSettings == null ) {
                        var rsp = M.api.getJSONCb('ciniki.bugs.settingsGet', 
                            {'tnid':M.masterTenantID}, function(rsp) {
                                if( rsp.stat != 'ok' ) {
                                    M.api.err(rsp);
                                    return false;
                                }
                                M.ciniki_sysadmin_bigboard.bugSettings = rsp.settings;
                                p.refresh();
                                p.show();
                            });
                    } else {
                        p.refresh();
                        p.show();
                    }
                });
        } else if( this.main.paneltab == 'mail' ) {
            var rsp = M.api.getJSONCb('ciniki.sysadmin.mailStats', {}, function(rsp) {
                if( rsp.stat != 'ok' ) {
                    M.api.err(rsp);
                    return false;
                }
                var p = M.ciniki_sysadmin_bigboard.main;
                p.data = {'mail':rsp.mail};
                p.sections = p.tab_sections.mail;
                p.sections.tabs.selected = 'mail';
                p.refresh();
                p.show();
            });
        } else if( this.main.paneltab == 'errors' ) {
            var rsp = M.api.getJSONCb('ciniki.core.errorLogList', {}, function(rsp) {
                if( rsp.stat != 'ok' ) {
                    M.api.err(rsp);
                    return false;
                }
                var p = M.ciniki_sysadmin_bigboard.main;
                p.data = {'errors':rsp.errors};
                p.sections = p.tab_sections.errors;
                p.sections.tabs.selected = 'errors';
                p.refresh();
                p.show();
            });
        } else {
            M.alert('Invalid panel tab');
            return false;
        }
    }

    this.showSummary = function() {
        this.main.paneltab = 'summary';
        this.update();
    };

    this.showSyncs = function() {
        this.main.paneltab = 'syncs';
        this.update();
    };

    this.showAuths = function() {
        this.main.paneltab = 'auths';
        this.update();
    };

    this.showActiveUsers = function() {
        this.main.paneltab = 'activeusers';
        this.update();
    };

    this.showBugs = function() {
        this.main.paneltab = 'bugs';
        this.update();
    };

    this.showMail = function() {
        this.main.paneltab = 'mail';
        this.update();
    };

    this.showErrors = function() {
        this.main.paneltab = 'errors';
        this.update();
    };

    this.autoUpdate = function() {
        //
        // Make sure the app is still showing, we don't want this running in the background!!!!
        //
        if( this.main.isVisible() == true ) {
            //
            // Update the panel data
            //
            this.update();

            //
            // Refresh the panel
            //
            this.main.refresh();

            //
            // Set time out for the next update
            //
            setTimeout('M.ciniki_sysadmin_bigboard.autoUpdate();', 30000);
        }
    }

    this.clear = function() {
        this.main.clearData();
        this.main.refresh();
    }

}

