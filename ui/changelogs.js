//
//
function ciniki_sysadmin_changelogs() {
    this.lastTimestamp = '';
    this.runAutoUpdate = 'no';
    this.logs = null;

    this.init = function() {
    }

    this.start = function(cb, appPrefix) {
        //
        // Create the app container if it doesn't exist, and clear it out
        // if it does exist.
        //
        var appContainer = M.createContainer(appPrefix, 'ciniki_sysadmin_changelogs', 'yes');
        if( appContainer == null ) {
            alert('App Error');
            return false;
        } 

        this.logs = new M.panel('Change Logs',
            'ciniki_sysadmin_changelogs', 'logs',
            appPrefix, 'wide', 'sectioned', 'ciniki.sysadmin.changelogs');
        this.logs.data = null;
        this.logs.dataOrder = 'reverse';        // Display the newest logs at the top
        this.logs.sections = { 
            '_info':{'label':'', 'type':'simplegrid', 'num_cols':4,
                'headerValues':['User','Table','Key', 'Value'],
            },  
        };  
        this.logs.sectionData = function(s) { return this.data; }
        this.logs.cellValue = function(s, i, j, data) { 
            switch(j) {
                case 0: return '<span class=\'username\'>' + data.log.display_name + ', <span class=\'age\'>' + data.log.age + ' ago</span>';
                case 1: return data.log.table_name;
                case 2: return data.log.table_key + ',' + data.log.table_field;
                case 3: return data.log.new_value;
            }
        }
        this.logs.addButton('update', 'Update', 'M.ciniki_sysadmin_changelogs.update();');
        this.logs.addButton('clear', 'Clear', 'M.ciniki_sysadmin_changelogs.clear();');
        this.logs.addClose('Close');
        this.logs.show(cb);

        // Reset the timestamp so all the logs are loaded
        this.lastTimestamp = '';
        
        this.autoUpdate()
    }

    this.update = function() {
        var rsp = M.api.getJSONCb('ciniki.core.monitorChangeLogs', {'last_timestamp':this.lastTimestamp}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            M.ciniki_sysadmin_changelogs.lastTimestamp = rsp.timestamp;
            M.ciniki_sysadmin_changelogs.logs.addData(rsp.logs);
            M.ciniki_sysadmin_changelogs.logs.refresh();
            M.ciniki_sysadmin_changelogs.logs.show();
        });
    }

    this.autoUpdate = function() {
        //
        // Make sure the app is still showing, we don't want this running in the background!!!!
        //
        if( this.logs.isVisible() == true ) {
            //
            // Update the panel data
            //
            this.update();

            //
            // Refresh the panel
            //
            this.logs.refresh();

            //
            // Set time out for the next update
            //
            setTimeout('M.ciniki_sysadmin_changelogs.autoUpdate();', 10000);
        }
    }

    this.clear = function() {
        this.logs.clearData();
        this.logs.refresh();
    }

}

