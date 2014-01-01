//
//
function ciniki_sysadmin_errors() {
	this.init = function() {
		this.logs = new M.panel('Error Logs',
			'ciniki_sysadmin_errors', 'logs',
			'mc', 'wide', 'sectioned', 'ciniki.sysadmin.errors.logs');
		this.logs.data = null;
		this.logs.dataOrder = 'reverse';		// Display the newest logs at the top
        this.logs.sections = { 
            'errors':{'label':'', 'type':'simplegrid', 'num_cols':3,
                'headerValues':['Business/User','Method','Date'],
				'cellClasses':['multiline','multiline','multiline'],
            },  
        };  
        this.logs.sectionData = function(s) { return this.data; }
		this.logs.cellValue = function(s, i, j, d) { 
			switch(j) {
				case 0: return '<span class=\'maintext\'>' + d.error.business_name + '</span><span class=\'subtext\'>' + d.error.user_name + '</span>';
				case 1: return '<span class=\'maintext\'>' + d.error.method + '</span><span class=\'subtext\'>' + d.error.session_key + '</span>';
				case 2: return '<span class=\'maintext\'>' + d.error.log_date + '</span><span class=\'subtext\'>' + d.error.age + ' ago</span>';
			}
		}
		this.logs.cellFn = function(s, i, j, d) {
			switch(j) {
				case 0: return 'M.startApp(\'ciniki.sysadmin.user\',null,\'M.ciniki_sysadmin_errors.showLogs();\',\'mc\',{\'id\':\'' + d.error.user_id + '\'});';
				case 1: return 'M.startApp(\'ciniki.sysadmin.user\',null,\'M.ciniki_sysadmin_errors.showLogs();\',\'mc\',{\'id\':\'' + d.error.user_id + '\',\'session_key\':\'' + d.error.session_key + '\'});';
				case 2: return 'M.ciniki_sysadmin_errors.showError(\'M.ciniki_sysadmin_errors.showLogs();\',\'' + d.error.id + '\',M.ciniki_sysadmin_errors.logs.data);';
			}
		};
//		this.logs.rowFn = function(s, i, d) {
//		}
		this.logs.addButton('update', 'Update', 'M.ciniki_sysadmin_errors.showLogs();');
		this.logs.addClose('Close');

		//
		// The panel to display a log entry
		//
		this.log = new M.panel('Error Log',
			'ciniki_sysadmin_errors', 'log',
			'mc', 'large', 'sectioned', 'ciniki.sysadmin.errors.log');
		this.log.next_error_id = 0;
		this.log.prev_error_id = 0;
		this.log.data = null;
		this.log.sections = {
			'info':{'label':'', 'list':{
				'business_name':{'label':'Business'},
				'user_name':{'label':'User'},
				'method':{'label':'Method'},
				'log_date':{'label':'Date'},
				}},
			'err_array_r':{'label':'Error', 'type':'configtext'},
			'request_array_r':{'label':'Request', 'type':'configtext'},
			'session_array_r':{'label':'Session', 'type':'configtext'},
			};
		this.log.sectionData = function(s) {
			if( s == 'err_array_r' || s == 'request_array_r' || s == 'session_array_r' ) {
				return this.data[s];
			}
			return this.sections[s].list;
		};
		this.log.listLabel = function(s, i, d) {
			return d.label;
		};
		this.log.listValue = function(s, i, d) {
			return this.data[i];
		};
		this.log.fieldValue = function(s, i, d) {
			if( i == 'err_array_r' || i == 'request_array_r' || i == 'session_array_r' ) {
				return this.data[i].replace(/\n/g, '<br/>');
			}
			return this.data[i];
		};
		this.log.prevButtonFn = function() {
			if( this.prev_error_id > 0 ) {
				return 'M.ciniki_sysadmin_errors.showError(null, \'' + this.prev_error_id + '\');';
			}
			return null;
		};
		this.log.nextButtonFn = function() {
			if( this.next_error_id > 0 ) {
				return 'M.ciniki_sysadmin_errors.showError(null, \'' + this.next_error_id + '\');';
			}
			return null;
		};
		this.log.addButton('delete', 'Delete', 'M.ciniki_sysadmin_errors.deleteError();');
		this.log.addButton('next', 'Next');
		this.log.addClose('Back');
		this.log.addLeftButton('prev', 'Prev');
	}

	this.start = function(cb, appPrefix, aG) {
		args = {};
		if( aG != null ) {
			args = eval(aG);
		}
		
		//
		// Create the app container if it doesn't exist, and clear it out
		// if it does exist.
		//
		var appContainer = M.createContainer(appPrefix, 'ciniki_sysadmin_errors', 'yes');
		if( appContainer == null ) {
			alert('App Error');
			return false;
		} 

		if( args != null && args.id != null && args.id != '' ) {
			this.showError(cb, args.id, args.list);
		} else {
			this.showLogs(cb);
		}
	}

	this.showLogs = function(cb) {
		var rsp = M.api.getJSONCb('ciniki.core.errorLogList', {}, function(rsp) {
			if( rsp.stat != 'ok' ) {
				M.api.err(rsp);
				return false;
			}
			var p = M.ciniki_sysadmin_errors.logs;
			p.data = rsp.errors;
			p.refresh();
			p.show(cb);
		});
	}

	this.showError = function(cb, eid, list) {
		if( eid != null ) {
			this.log.error_id = eid;
		}
		if( list != null ) {
			this.log.list = list;
		}
		var rsp = M.api.getJSONCb('ciniki.core.errorLogGet', {'error_id':this.log.error_id}, function(rsp) {
			if( rsp.stat != 'ok' ) {
				M.api.err(rsp);
				return false;
			}
			var p = M.ciniki_sysadmin_errors.log;
			p.data = rsp.error;
			
			p.prev_error_id = 0;
			p.next_error_id = 0;
			if( p.list != null ) {
				for(i in p.list) {
					if( p.next_error_id == -1 ) {
						p.next_error_id = p.list[i].error.id;
						break;
					} else if( p.list[i].error.id == p.error_id ) {
						p.next_error_id = -1;
					} else {
						p.prev_error_id = p.list[i].error.id;
					}
				}
			}
			p.refresh();
			p.show(cb);
		});
	}

	this.deleteError = function() {
		if( this.log.error_id > 0 ) {
			var rsp = M.api.getJSONCb('ciniki.core.errorLogDelete', {'error_id':this.log.error_id}, function(rsp) {
				if( rsp.stat != 'ok' ) {
					M.api.err(rsp);
					return false;
				}
				var p = M.ciniki_sysadmin_errors.log;
				for(i in p.list) {
					if( p.list[i].error.id == p.error_id ) {
						p.list.splice(i, 1);
					}
				}
				if( p.next_error_id > 0 ) {
					M.ciniki_sysadmin_errors.showError(null,p.next_error_id);
				} else {
					p.close();
				}
			});
		} else {
			if( this.log.next_error_id > 0 ) {
				M.ciniki_sysadmin_errors.showError(null,this.log.next_error_id);
			} else {
				M.ciniki_sysadmin_errors.log.close();
			}
		}
	};
}
