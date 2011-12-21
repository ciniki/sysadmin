//
//
function ciniki_sysadmin_dbversions() {
	this.tables = null;

	this.init = function() {
	}

	this.start = function(cb, appPrefix) {
		//
		// Create the app container if it doesn't exist, and clear it out
		// if it does exist.
		//
		var appContainer = M.createContainer(appPrefix, 'ciniki_sysadmin_dbversions', 'yes');
		if( appContainer == null ) {
			alert('App Error');
			return false;
		} 

		//
		// Create the panel for the information
		//
		this.tables = new M.panel('Table Versions',
			'ciniki_sysadmin_dbversions', 'tables',
			appPrefix, 'medium', 'sectioned', 'ciniki.sysadmin.db_table_versions');
		this.tables.sections = {
			'_':{'label':'', 'type':'simplegrid', 'num_cols':3, 
				'headerValues':['Table', 'Database', 'Current'],
				},
			};
		this.tables.sectionData = function(s) { return this.data; }
		
		//
		// Load the data into the this.tables.data field
		//
		this.loadData();
		this.tables.cellClass = function(s, i, j, data_element) {
			if( this.data[i]['database_version'] != this.data[i]['schema_version'] ) {
				return 'alert';
			}
			return null;
		}
		this.tables.cellValue = function(s, i, j, d) {
			switch(j) {
				case 0: return i;
				case 1: return this.data[i]['database_version'];
				case 2: return this.data[i]['schema_version'];
			}
			return '';
		}
		this.tables.addButton('update', 'Upgrade', 'M.ciniki_sysadmin_dbversions.upgrade();');
		this.tables.addClose('Back');

		this.tables.show(cb);
	}

	this.loadData = function() {
		//
		// Get the detail for the user.  Do this for each request, to make sure
		// we have the current data.  If the user switches businesses, then we
		// want this data reloaded.
		//
		var rsp = M.api.getJSON('ciniki.core.checkDbTableVersions', {});
		if( rsp['stat'] != 'ok' ) {
			M.api.err(rsp);
			return false;
		}
		var count = 0;
		this.tables.data = {};
		//
		// Add the tables which need upgrading first, so they appear at the top of the list
		//
		for(i in rsp['tables']) {
			// outdated tables
			if( rsp['tables'][i]['database_version'] != rsp['tables'][i]['schema_version'] ) {
				this.tables.data[i] = rsp['tables'][i];
				count++;
			}
		}
		for(i in rsp['tables']) {
			// Current tables
			if( rsp['tables'][i]['database_version'] == rsp['tables'][i]['schema_version'] ) {
				this.tables.data[i] = rsp['tables'][i];
				count++;
			}
		}
	}

	this.upgrade = function() {
		var rsp = M.api.getJSON('ciniki.core.upgradeDb', {});
		if( rsp['stat'] != 'ok' ) {
			alert("Error: #" + rsp['err']['code'] + ' - ' + rsp['err']['msg']);
			return false;
		}
		this.loadData();
		this.tables.refresh();
	}

}

