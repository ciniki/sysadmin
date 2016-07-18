//
//
function ciniki_sysadmin_actionlogs() {
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
        var appContainer = M.createContainer(appPrefix, 'ciniki_sysadmin_actionlogs', 'yes');
        if( appContainer == null ) {
            alert('App Error');
            return false;
        } 

        this.logs = new M.panel('Action Logs',
            'ciniki_sysadmin_actionlogs', 'logs',
            appPrefix, 'wide', 'sectioned', 'ciniki.sysadmin.actionlogs');
        this.logs.data = null;
        this.logs.dataOrder = 'reverse';        // Display the newest logs at the top
        this.logs.sections = { 
            '_info':{'label':'', 'type':'simplegrid', 'num_cols':2,
                'headerValues':['User','Action'],
                'cellClasses':['multiline', 'multiline'],
            },  
        };  
        this.logs.sectionData = function(s) { return this.data; }
        this.logs.cellValue = function(s, i, j, d) { 
            switch(j) {
                case 0: return '<span class="maintext">' + d.log.display_name + '</span><span class="subtext">' + d.log.age + '</span>';
                case 1: return '<span class="maintext">' + d.log.name + ' - ' + d.log.method + '</span><span class="subtext">' + d.log.action + '</span>';
            }
        }
        this.logs.rowFn = function(s, i, d) {
            return 'M.startApp(\'ciniki.sysadmin.user\',null,\'M.ciniki_sysadmin_actionlogs.update();\',\'mc\',{\'id\':\'' + d.log.user_id + '\'});';
        }
        this.logs.addButton('update', 'Update', 'M.ciniki_sysadmin_actionlogs.update();');
        this.logs.addButton('clear', 'Clear', 'M.ciniki_sysadmin_actionlogs.clear();');
        this.logs.addClose('Close');
        this.logs.show(cb);

        // Reset the timestamp so all the logs are loaded
        this.lastTimestamp = '';
        
        this.autoUpdate()
    }

    this.update = function() {
        var rsp = M.api.getJSONCb('ciniki.core.monitorActionLogs', {'last_timestamp':this.lastTimestamp}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            M.ciniki_sysadmin_actionlogs.lastTimestamp = rsp.timestamp;
            M.ciniki_sysadmin_actionlogs.logs.addData(rsp.logs);
            M.ciniki_sysadmin_actionlogs.logs.refresh();
            M.ciniki_sysadmin_actionlogs.logs.show();
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
            setTimeout('M.ciniki_sysadmin_actionlogs.autoUpdate();', 30000);
        }
    }

    this.clear = function() {
        this.logs.clearData();
        this.logs.refresh();
    }
}
