//
//
function ciniki_sysadmin_sessions() {
    this.lastTimestamp = '';
    this.runAutoUpdate = 'no';
    this.sessions = null;

    this.init = function() {
    }

    this.start = function(cb, appPrefix) {
        //
        // Create the app container if it doesn't exist, and clear it out
        // if it does exist.
        //
        var appContainer = M.createContainer(appPrefix, 'ciniki_sysadmin_sessions', 'yes');
        if( appContainer == null ) {
            alert('App Error');
            return false;
        } 

        this.sessions = new M.panel('Sessions',
            'ciniki_sysadmin_sessions', 'sessions',
            appPrefix, 'narrow', 'sectioned', 'ciniki.sysadmin.sessions');
        this.sessions.data = null;
        this.sessions.dataOrder = 'reverse';        // Display the newest sessions at the top
        this.sessions.sections = { 
            '_info':{'label':'', 'type':'simplegrid', 'num_cols':2,
                'headerValues':['User','Started'],
                'cellClasses':['multiline', 'multiline', 'multiline'],
            },  
        };  
        this.sessions.sectionData = function(s) { return this.data; }
        this.sessions.cellValue = function(s, i, j, d) {
            switch(j) {
                case 0: return '<span class="maintext">' + d.session.display_name + '</span>' 
                    + '<span class="subtext">' + d.session.age + '</span>';
//              case 1: return '<span class="maintext">' + d.session.appname + '</span>'
//                  + '<span class="subtext">' + d.session.api_key + '</span>';
                case 1: return '<span class="maintext">' + d.session.date_added + '</span>'
                    + '<span class="subtext">' + d.session.last_saved + '</span>';
            }
        }
        this.sessions.cellFn = function(s, i, j, d) {
            if( s == '_info' && j == 0 ) {
                return 'M.startApp(\'ciniki.sysadmin.user\',null,\'M.ciniki_sysadmin_sessions.update();\',\'mc\',{\'id\':\'' + d.session.user_id + '\'});';
            } else if( s == '_info' && j == 1 ) {
                return 'M.startApp(\'ciniki.sysadmin.user\',null,\'M.ciniki_sysadmin_sessions.update();\',\'mc\',{\'id\':\'' + d.session.user_id + '\',\'session_key\':\'' + d.session.session_key + '\'});';
            }
        };
        this.sessions.addButton('update', 'Update', 'M.ciniki_sysadmin_sessions.update();');
        this.sessions.addButton('clear', 'Clear', 'M.ciniki_sysadmin_sessions.clear();');
        this.sessions.addClose('Close');
        this.sessions.show(cb);

        // Reset the timestamp so all the logs are loaded
        this.lastTimestamp = '';
        
        this.autoUpdate()
    }

    this.update = function() {
        var rsp = M.api.getJSONCb('ciniki.core.monitorSessions', {'last_timestamp':this.lastTimestamp}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            var p = M.ciniki_sysadmin_sessions.sessions;
            p.data = rsp.sessions;
            p.refresh();
            p.show();
        });
    }

    this.autoUpdate = function() {
        //
        // Make sure the app is still showing, we don't want this running in the background!!!!
        //
        if( this.sessions.isVisible() == true ) {
            //
            // Update the panel data
            //
            this.update();

            //
            // Refresh the panel
            //
            this.sessions.refresh();

            //
            // Set time out for the next update
            //
            setTimeout('M.ciniki_sysadmin_sessions.autoUpdate();', 60000);
        }
    }

    this.clear = function() {
        this.sessions.clearData();
        this.sessions.refresh();
    }

}

