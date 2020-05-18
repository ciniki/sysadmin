//
//
function ciniki_sysadmin_dbversions() {
    //
    // Create the panel for the information
    //
    this.dbtables = new M.panel('Table Versions', 'ciniki_sysadmin_dbversions', 'dbtables', 'mc', 'medium', 'sectioned', 'ciniki.sysadmin.dbversions.dbtables');
    this.dbtables.sections = {
        '_':{'label':'', 'type':'simplegrid', 'num_cols':3, 
            'headerValues':['Table', 'Database', 'Current'],
            },
        };
    this.dbtables.sectionData = function(s) { return this.data; }
    this.dbtables.cellClass = function(s, i, j, d) {
        if( d.database_version != d.schema_version ) {
            return 'alert';
        }
        return null;
    }
    this.dbtables.cellValue = function(s, i, j, d) {
        switch(j) {
            case 0: return i;
            case 1: return this.data[i].database_version;
            case 2: return this.data[i].schema_version;
        }
        return '';
    }
    this.dbtables.open = function(cb) {
        M.api.getJSONCb('ciniki.core.checkDbTableVersions', {}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            var count = 0;
            var p = M.ciniki_sysadmin_dbversions.dbtables;
            p.data = {};
            //
            // Add the tables which need upgrading first, so they appear at the top of the list
            //
            for(i in rsp.tables) {
                // outdated tables
                if( rsp.tables[i].database_version != rsp.tables[i].schema_version ) {
                    p.data[i] = rsp.tables[i];
                    count++;
                }
            }
            for(i in rsp.tables) {
                // Current tables
                if( rsp.tables[i].database_version == rsp.tables[i].schema_version ) {
                    p.data[i] = rsp.tables[i];
                    count++;
                }
            }
            p.refresh();
            p.show(cb);
        });
    }
    this.dbtables.upgrade = function() {
        M.api.getJSONCb('ciniki.core.upgradeDb', {}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.alert("Error: #" + rsp.err.code + ' - ' + rsp.err.msg);
                return false;
            }
            M.ciniki_sysadmin_dbversions.dbtables.open();
        });
    }
    this.dbtables.addButton('update', 'Upgrade', 'M.ciniki_sysadmin_dbversions.dbtables.upgrade();');
    this.dbtables.addClose('Back');

    this.start = function(cb, appPrefix) {
        //
        // Create the app container if it doesn't exist, and clear it out
        // if it does exist.
        //
        var appContainer = M.createContainer(appPrefix, 'ciniki_sysadmin_dbversions', 'yes');
        if( appContainer == null ) {
            M.alert('App Error');
            return false;
        } 

        this.dbtables.open(cb);
    }
}
