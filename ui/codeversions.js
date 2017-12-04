//
//
function ciniki_sysadmin_codeversions() {
    this.tables = null;

    this.init = function() {
        //
        // Create the panel for the information
        //
        this.modules = new M.panel('Module Versions',
            'ciniki_sysadmin_codeversions', 'modules',
            'mc', 'medium', 'sectioned', 'ciniki.sysadmin.codeversions.modules');
        this.modules.sections = {
            'package':{'label':'Package', 'list':{
                'name':{'label':'Name'},
                'version':{'label':'Version'},
                'author':{'label':'Author'},
                'hash':{'label':'Hash'},
                }},
            'modules':{'label':'Modules', 'type':'simplegrid', 'num_cols':2, 'sortable':'yes',
                'headerValues':['Module', 'Version'],
                'cellClasses':['multiline', 'multiline'],
                'sortTypes':['text','text'],
                },
            };
        this.modules.sectionData = function(s) { 
            if( s == 'package' ) { return this.sections.package.list; }
            return this.data[s]; 
            }
        
//      this.modules.cellClass = function(s, i, j, data_element) {
//          return null;
//      }
        this.modules.listLabel = function(s, i, d) { return d.label; }
        this.modules.listValue = function(s, i, d) { return this.data.package[i]; }

        this.modules.cellValue = function(s, i, j, d) {
            if( s == 'package' ) {
                return this.data.package[i];
            }
            if( s == 'modules') {
                switch(j) {
                    case 0: return '<span class="maintext">' + d.module.name + '</span><span class="subtext">' + d.module.hash + '</span>';
                    case 1: return '<span class="maintext">' + d.module.version + '</span><span class="subtext">' + d.module.author + '</span>';
                }
            }
            return '';
        }
        this.modules.addClose('Back');
    }

    this.start = function(cb, appPrefix) {
        //
        // Create the app container if it doesn't exist, and clear it out
        // if it does exist.
        //
        var appContainer = M.createContainer(appPrefix, 'ciniki_sysadmin_codeversions', 'yes');
        if( appContainer == null ) {
            alert('App Error');
            return false;
        } 

        //
        // Load the data into the this.tables.data field
        //
        this.showVersions(cb);
    }

    this.showVersions = function(cb) {
        //
        // Get the detail for the user.  Do this for each request, to make sure
        // we have the current data.  If the user switches tenants, then we
        // want this data reloaded.
        //
        M.api.getJSONCb('ciniki.core.codeVersions', {}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            var p = M.ciniki_sysadmin_codeversions.modules;
            p.data = {'package':rsp.package, 'modules':rsp.modules};
            p.refresh();
            p.show(cb);
        });
    }

}

