//
//
function ciniki_sysadmin_authlogs() {
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
        var appContainer = M.createContainer(appPrefix, 'ciniki_sysadmin_authlogs', 'yes');
        if( appContainer == null ) {
            alert('App Error');
            return false;
        } 

        this.logs = new M.panel('Auth Logs',
            'ciniki_sysadmin_authlogs', 'logs',
            appPrefix, 'wide', 'sectioned', 'ciniki.sysadmin.authlogs');
        this.logs.data = null;
        this.logs.dataOrder = 'reverse';        // Display the newest logs at the top
        this.logs.sections = { 
            '_info':{'label':'', 'type':'simplegrid', 'num_cols':3,
                'headerValues':['username','api_key','ip_address'],
                'cellClasses':['multiline','','multiline'],
            },  
        };  
        this.logs.sectionData = function(s) { return this.data; }
        this.logs.cellValue = function(s, i, j, d) { 
            switch(j) {
                case 0: return '<span class=\'maintext\'>' + d.log.display_name + '</span><span class=\'subtext\'>' + d.log.age + ' ago</span>';
                case 1: return d.log.api_key;
                case 2: return '<span class=\'maintext\'>' + d.log.ip_address + '</span><span class=\'subtext\'>' + d.log.session_key + '</span>';
            }
        }
        this.logs.cellFn = function(s, i, j, d) {
            switch(j) {
                case 0: return 'M.startApp(\'ciniki.sysadmin.user\',null,\'M.ciniki_sysadmin_authlogs.update();\',\'mc\',{\'id\':\'' + d.log.user_id + '\'});';
                case 2: return 'M.startApp(\'ciniki.sysadmin.user\',null,\'M.ciniki_sysadmin_authlogs.update();\',\'mc\',{\'id\':\'' + d.log.user_id + '\',\'session_key\':\'' + d.log.session_key + '\'});';
            }
        };
        this.logs.addButton('update', 'Update', 'M.ciniki_sysadmin_authlogs.update();');
        this.logs.addButton('clear', 'Clear', 'M.ciniki_sysadmin_authlogs.clear();');
        this.logs.addClose('Close');
        this.logs.show(cb);
    
        // Reset the timestamp so everytime we open the module it reloads all the logs
        this.lastTimestamp = '';
        this.autoUpdate()
    }

    this.update = function() {
        var rsp = M.api.getJSONCb('ciniki.users.monitorAuthLogs', {'last_timestamp':this.lastTimestamp}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            M.ciniki_sysadmin_authlogs.lastTimestamp = rsp.timestamp;
            M.ciniki_sysadmin_authlogs.logs.addData(rsp.logs);
            M.ciniki_sysadmin_authlogs.logs.refresh();
            M.ciniki_sysadmin_authlogs.logs.show();
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
            setTimeout('M.ciniki_sysadmin_authlogs.autoUpdate();', 10000);
        }
    }

    this.clear = function() {
        this.logs.clearData();
        this.logs.refresh();
    }

}

