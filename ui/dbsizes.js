//
//
function ciniki_sysadmin_dbsizes() {
    //
    // Create the panel for the information
    //
    this.dbsizes = new M.panel('Table Versions', 'ciniki_sysadmin_dbsizes', 'dbsizes', 'mc', 'medium', 'sectioned', 'ciniki.sysadmin.dbsizes.dbsizes');
    this.dbsizes.sections = {
        'tables':{'label':'', 'type':'simplegrid', 'num_cols':3, 
            'sortable':'yes',
            'sortTypes':['text', 'number'],
            'headerValues':['Table', 'Size'],
            },
        };
    this.dbsizes.cellValue = function(s, i, j, d) {
        switch(j) {
            case 0: return d.table_name;
            case 1: return d.mb;
        }
        return '';
    }
    this.dbsizes.open = function(cb) {
        M.api.getJSONCb('ciniki.core.checkDbTableSizes', {}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            var count = 0;
            var p = M.ciniki_sysadmin_dbsizes.dbsizes;
            p.data = rsp;
            p.refresh();
            p.show(cb);
        });
    }
    this.dbsizes.addClose('Back');

    this.start = function(cb, appPrefix) {
        //
        // Create the app container if it doesn't exist, and clear it out
        // if it does exist.
        //
        var appContainer = M.createContainer(appPrefix, 'ciniki_sysadmin_dbsizes', 'yes');
        if( appContainer == null ) {
            alert('App Error');
            return false;
        } 

        this.dbsizes.open(cb);
    }
}
