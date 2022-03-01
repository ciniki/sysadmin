//
// This class will display the form to allow admins and tenant owners to 
// change the details of their tenant
//
function ciniki_sysadmin_main() {
    this.menu = null;

    this.init = function() {
        //
        // Setup the sysadmin menu
        //
        this.menu = new M.panel('System Admin',
            'ciniki_sysadmin_main', 'menu',
            'mc', 'medium narrowaside', 'sectioned', 'ciniki.sysadmin.main.menu');
        this.menu.sections = {
            'tenants':{'label':'Tenants', 'aside':'yes', 'list':{
                'add':{'label':'Add Tenant', 'fn':'M.startApp(\'ciniki.tenants.add\', null, \'M.ciniki_sysadmin_main.menu.show();\');'},
                'owners':{'label':'Owners & Employees', 'fn':'M.startApp(\'ciniki.sysadmin.usertenants\', null, \'M.ciniki_sysadmin_main.menu.show();\');'},
                'tenants':{'label':'Tenants', 'fn':'M.startApp(\'ciniki.sysadmin.tenants\', null, \'M.ciniki_sysadmin_main.menu.show();\');'},
                'resellers':{'label':'Resellers', 
                    'visible':function() { return M.blackbox == null ? 'yes' : 'no'; },
                    'fn':'M.startApp(\'ciniki.sysadmin.resellers\', null, \'M.ciniki_sysadmin_main.menu.show();\');'},
                'billing':{'label':'Billing', 
                    'visible':function() { return M.blackbox == null ? 'yes' : 'no'; },
                    'fn':'M.startApp(\'ciniki.sysadmin.billing\', null, \'M.ciniki_sysadmin_main.menu.show();\');'},
                'syncs':{'label':'Syncronizations', 
                    'visible':function() { return M.blackbox == null ? 'yes' : 'no'; },
                    'fn':'M.startApp(\'ciniki.sysadmin.syncs\', null, \'M.ciniki_sysadmin_main.menu.show();\');'},
                'domains':{'label':'Domains', 
                    'visible':function() { return M.blackbox == null ? 'yes' : 'no'; },
                    'fn':'M.startApp(\'ciniki.sysadmin.domains\', null, \'M.ciniki_sysadmin_main.menu.show();\');'},
                }},
            'users':{'label':'Users', 'aside':'yes', 'list':{
                'sysadmins':{'label':'Sys Admins', 
                    'visible':function() { return M.blackbox == null ? 'yes' : 'no'; },
                    'fn':'M.startApp(\'ciniki.sysadmin.users\', null, \'M.ciniki_sysadmin_main.menu.show();\');'},
                'privileged':{'label':'Privileged Users', 
                    'visible':function() { return M.blackbox == null ? 'yes' : 'no'; },
                    'fn':'M.startApp(\'ciniki.sysadmin.privilegedusers\', null, \'M.ciniki_sysadmin_main.menu.show();\');'},
                'locked':{'label':'Locked Users', 'fn':'M.startApp(\'ciniki.sysadmin.lockedusers\', null, \'M.ciniki_sysadmin_main.menu.show();\');'},
                'all':{'label':'All Users', 'fn':'M.startApp(\'ciniki.sysadmin.allusers\', null, \'M.ciniki_sysadmin_main.menu.show();\');'},
                }},
            'monitoring':{'label':'Monitoring', 'list':{
                'errorlogs':{'label':'Error Logs', 'fn':'M.startApp(\'ciniki.sysadmin.errors\', null, \'M.ciniki_sysadmin_main.menu.show();\');'},
                'changelogs':{'label':'Change Logs', 'fn':'M.startApp(\'ciniki.sysadmin.changelogs\', null, \'M.ciniki_sysadmin_main.menu.show();\');'},
                'actionlogs':{'label':'Action Logs', 'fn':'M.startApp(\'ciniki.sysadmin.actionlogs\', null, \'M.ciniki_sysadmin_main.menu.show();\');'},
                'sessions':{'label':'Sessions', 'fn':'M.startApp(\'ciniki.sysadmin.sessions\', null, \'M.ciniki_sysadmin_main.menu.show();\');'},
                'authlog':{'label':'Auth Log', 'fn':'M.startApp(\'ciniki.sysadmin.authlogs\', null, \'M.ciniki_sysadmin_main.menu.show();\');'},
                'authfailures':{'label':'Auth Failures', 'fn':'M.startApp(\'ciniki.sysadmin.authfailures\', null, \'M.ciniki_sysadmin_main.menu.show();\');'},
//                'fixhistory':{'label':'Fix User History', 'fn':'M.ciniki_sysadmin_main.fixuserhistory();'},
                }},
//          'billing':{'label':'Billing', 'list':{
//              'plans':{'label':'Plans', 'fn':'M.startApp(\'ciniki.sysadmin.plans\', null, \'M.ciniki_sysadmin_main.menu.show();\');'},
//              }},
            'system':{'label':'System', 'list':{
                'tables':{'label':'Table Versions', 'fn':'M.startApp(\'ciniki.sysadmin.dbversions\', null, \'M.ciniki_sysadmin_main.menu.show();\');'},
                'sizes':{'label':'Table Sizes', 'fn':'M.startApp(\'ciniki.sysadmin.dbsizes\', null, \'M.ciniki_sysadmin_main.menu.show();\');'},
                'code':{'label':'Code Versions', 'fn':'M.startApp(\'ciniki.sysadmin.codeversions\', null, \'M.ciniki_sysadmin_main.menu.show();\');'},
                'modules':{'label':'Module usage', 'fn':'M.startApp(\'ciniki.sysadmin.modules\',null,\'M.ciniki_sysadmin_main.menu.show();\');'},
                'modflags':{'label':'Module Option Usage', 'fn':'M.startApp(\'ciniki.sysadmin.modflags\',null,\'M.ciniki_sysadmin_main.menu.show();\');'},
                'upgradecode':{'label':'Upgrade Code', 'fn':'M.ciniki_sysadmin_main.upgradeCode();'},
                }},
            'migration':{'label':'Migration', 'list':{
//              'infoimport':{'label':'ciniki.info Import', 'fn':'M.ciniki_sysadmin_main.infoimport();'},
//              'phonesmove':{'label':'Move Phones', 'fn':'M.ciniki_sysadmin_main.phonesmove();'},
//              'upgradegallery':{'label':'Upgrade Gallery', 'fn':'M.ciniki_sysadmin_main.upgradeGallery();'},
//                'upgradeMembersonlyFiles':{'label':'Upgrade Membersonly Files', 'fn':'M.ciniki_sysadmin_main.upgradeMembersonlyFiles();'},
//                'upgradeWebFiles':{'label':'Upgrade Web Files', 'fn':'M.ciniki_sysadmin_main.upgradeWebFiles();'},
//                'upgradeLinks':{'label':'Upgrade Links', 'fn':'M.ciniki_sysadmin_main.upgradeLinks();'},
                }},
//          'documentation':{'label':'Documentation', 'list':{
//              'modules':{'label':'Modules', 'fn':'M.startApp(\'ciniki.documentation.modules\', null, \'M.ciniki_sysadmin_main.menu.show();\');'},
//              'errorcodes':{'label':'Error Codes', 'fn':'M.startApp(\'ciniki.documentation.errorcodes\', null, \'M.ciniki_sysadmin_main.menu.show();\');'},
//              'api_access_check':{'label':'API Access Check', 'fn':'M.startApp(\'ciniki.documentation.accesscheck\', null, \'M.ciniki_sysadmin_main.menu.show();\');'},
//              'sql_security_check':{'label':'SQL Security', 'fn':'M.startApp(\'ciniki.documentation.sql\', null, \'M.ciniki_sysadmin_main.menu.show();\');'},
//              'statistics':{'label':'Statistics', 'fn':'M.startApp(\'ciniki.documentation.stats\', null, \'M.ciniki_sysadmin_main.menu.show();\');'},
//              }},
            };
        this.menu.addClose('Back');
    }

    this.start = function(cb, ap, aG) {
        args = {};
        if( aG != null ) {
            args = eval(aG);
        }

        //
        // Create the app container if it doesn't exist, and clear it out
        // if it does exist.
        //
        var appContainer = M.createContainer('mc', 'ciniki_sysadmin_main', 'yes');
        if( appContainer == null ) {
            M.alert('App Error');
            return false;
        } 
    
        this.menu.show(cb);
    }

    this.upgradeCode = function() {
        M.api.getJSONCb('ciniki.sysadmin.cinikiUpdateCode', {}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            M.alert('done');
        });
    };
    this.upgradeQ = function() {
        M.api.getJSONCb('ciniki.sysadmin.cinikiUpdate', {}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            M.alert('done');
        });
    };

    this.fixuserhistory = function() {
        var rsp = M.api.getJSONCb('ciniki.users.historyFix', {}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            M.alert('done');
        });
    };

    this.upgradeGallery = function() {
        var rsp = M.api.getJSONCb('ciniki.gallery.upgradeAlbums', {}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            M.alert('done');
        });
    };

    this.upgradeLinks = function() {
        var rsp = M.api.getJSONCb('ciniki.links.upgradeCategories', {}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            M.alert('done, added ' + rsp.added + ' tags');
        });
    };

    this.upgradeMembersonlyFiles = function() {
        var rsp = M.api.getJSONCb('ciniki.membersonly.movetoStorage', {}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            M.alert('done');
        });
    };
    this.upgradeWebFiles = function() {
        var rsp = M.api.getJSONCb('ciniki.web.movetoStorage', {}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            M.alert('done');
        });
    };

//  this.upgradeNewsletters = function() {
//      var rsp = M.api.getJSONCb('ciniki.newsletters.movetoStorage', {}, function(rsp) {
//          if( rsp.stat != 'ok' ) {
//              M.api.err(rsp);
//              return false;
//          }
//          M.alert('done');
//      });
//  };

//  this.phonesmove = function() {
//      var rsp = M.api.getJSONCb('ciniki.customers.phonesMove', {}, function(rsp) {
//          if( rsp.stat != 'ok' ) {
//              M.api.err(rsp);
//              return false;
//          }
//          M.alert('done');
//      });
//  };

//  this.infoimport = function() {
//      var rsp = M.api.getJSONCb('ciniki.info.import', {}, function(rsp) {
//          if( rsp.stat != 'ok' ) {
//              M.api.err(rsp);
//              return false;
//          }
//          M.alert('done');
//      });
//  };
}
