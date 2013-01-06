//
//
function ciniki_sysadmin_syncs() {
	this.tables = null;

	this.init = function() {
		//
		// Create the panel for the information
		//
		this.syncs = new M.panel('Business Syncronizations',
			'ciniki_sysadmin_syncs', 'syncs',
			'mc', 'large', 'sectioned', 'ciniki.sysadmin.sync.syncs');
		this.syncs.sections = {
			'info':{'label':'Local System', 'list':{
				'name':{'label':'System Name', 'value':'unknown'},
				'local_url':{'label':'System URL', 'value':M.api.url},
				'api_key':{'label':'System Key', 'value':M.api.key},	//FIXME: Should be sync api_key, not manage one.
				}},
			'synclist':{'label':'Syncronizations', 'type':'simplegrid',
				'headerValues':['Business', 'Type', 'Remote System', 'Inc', 'Partial', 'Full'], 'num_cols':6, 'sortable':'yes',
				'cellClasses':['multiline', 'multiline', 'multiline', 'multiline', 'multiline', 'multiline'],
				'sortTypes':['text','text','text','date','date','date'],
				'noData':'No current syncronizations',
				'data':null,
				},
//			'_add':{'label':'', 'buttons':{'add':{'label':'Add Syncronization', 'fn':'M.ciniki_sysadmin_syncs.showAdd();'}}},
		};
		this.syncs.listLabel = function(s, i, d) { return d.label; }
		this.syncs.listValue = function(s, i, d) { return d.value; }
		this.syncs.cellValue = function(s, i, j, d) { 
			switch(j) {
//				case 0: return '<span class="multitext">' + d.sync.business_name + '</span><span class="subtext">' + d.sync.business_uuid + '</span>';
				case 0: return '<span class="multitext">' + d.sync.business_name + '</span><span class="subtext"></span>';
				case 1: return '<span class="multitext">' + d.sync.type + '</span><span class="subtext">' + d.sync.status_text + '</span>';
//				case 2: return '<span class="multitext">' + d.sync.remote_name + '</span><span class="subtext">' + d.sync.remote_uuid + '</span>';
				case 2: return '<span class="multitext">' + d.sync.remote_name + '</span><span class="subtext"></span>';
				case 3: return (d.sync.last_sync!='')?'<span class="maintext">'+d.sync.last_sync.replace(/ ([0-9]+:[0-9]+ ..)/,'</span><span class="subtext">$1')+'</span>':'never';
				case 4: return (d.sync.last_partial!='')?'<span class="maintext">'+d.sync.last_partial.replace(/ ([0-9]+:[0-9]+ ..)/,'</span><span class="subtext">$1')+'</span>':'never';
				case 5: return (d.sync.last_full!='')?'<span class="maintext">'+d.sync.last_full.replace(/ ([0-9]+:[0-9]+ ..)/,'</span><span class="subtext">$1')+'</span>':'never';
			}
		};
//		this.syncs.rowFn = function(s, i, d) { return 'M.ciniki_sysadmin_syncs.showSync(\'M.ciniki_sysadmin_syncs.showInfo();\',\'' + d.sync.id + '\');'; }
		this.syncs.noData = function() { return 'No syncronizations'; }
//		this.syncs.addButton('add', 'Add', 'M.ciniki_sysadmin_syncs.showAdd();');
		this.syncs.addClose('Back');
	}

	this.start = function(cb, appPrefix) {
		//
		// Create the container
		//
		var appContainer = M.createContainer(appPrefix, 'ciniki_sysadmin_syncs', 'yes');
		if( appContainer == null ) {
			alert('App Error');
			return false;
		} 

		this.showMain(cb);
	}

	this.showMain = function(cb) {
		this.syncs.sections.synclist.data = null;
		// 
		// Get the sync information for this server and business
		//
		var rsp = M.api.getJSON('ciniki.core.syncInfo', {'business_id':M.curBusinessID});
		if( rsp.stat != 'ok' ) {
			M.api.err(rsp);
			return false;
		}
		this.syncs.sections.info.list.name.value = rsp.name;
		this.syncs.sections.synclist.data = rsp.syncs;

		this.syncs.refresh();
		this.syncs.show(cb);
	}

}

