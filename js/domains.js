//
// The app to manage businesses domains for a business
//
function ciniki_sysadmin_domains() {
	
	this.domainFlags = {
		'1':{'name':'Primary'},
		};
	this.domainStatus = {
		'1':'Active',
		'50':'Suspended',
		'60':'Deleted',
		};
	
	this.init = function() {
		this.menu = new M.panel('Web Domains',
			'ciniki_sysadmin_domains', 'menu',
			'mc', 'medium', 'sectioned', 'ciniki.sysadmin.domains.menu');
		this.menu.data = {};
		this.menu.sections = {
			'domains':{'label':'', 'type':'simplegrid', 'num_cols':3,
				'headerValues':['Business', 'Domain', 'Expiry'],
				'cellClasses':['multiline', 'multiline', 'multiline'],
				},
		};
		this.menu.noData = function(s) { return 'No domains added'; }
		this.menu.sectionData = function(s) { return this.data; }
		this.menu.cellValue = function(s, i, j, d) {
			if( j == 0 ) {
				return '<span class="maintext">' + d.domain.business_name + '</span><span class="subtext">' + d.domain.business_status + '</span>';
			}
			if( j == 1 ) {
				var primary = '';
				if( d.domain.isprimary == 'yes' ) {
					primary = ' - Primary';
				}
				if( d.domain.managed_by != '' ) {
					primary += ' - ' + d.domain.managed_by;
				}
				return '<span class="maintext">' + d.domain.domain + '</span><span class="subtext">' + M.ciniki_sysadmin_domains.domainStatus[d.domain.status] + primary + '</span>';
			}
			if( j == 2 ) {
				var age = '';
				if( d.domain.expire_in_days < 0 ) {
					age = '<b>' + Math.abs(parseInt(d.domain.expire_in_days)) + ' days ago</span>';
				} else if( d.domain.expire_in_days == 0 ) {
					age = '<b>TODAY</b>';
				} else if( d.domain.expire_in_days > 0 ) {
					age = parseInt(d.domain.expire_in_days) + ' days';
				}
				return '<span class="maintext">' + d.domain.expiry_date + '</span><span class="subtext">' + age + '</span>';
			}
		}
		this.menu.rowStyle = function(s, i, d) {
			if( d.domain.expire_in_days < 15 ) {
				return 'background: #fbb;';
			} else if( d.domain.expire_in_days < 60 ) {
				return 'background: #ffb;';
			} 
			return '';
		};
		this.menu.rowFn = function(s, i, d) {
			return 'M.startApp(\'ciniki.businesses.domains\',null,\'M.ciniki_sysadmin_domains.showMenu();\',\'mc\',{\'domain\':\'' + d.domain.id + '\',\'business\':\'' + d.domain.business_id + '\'});';
		};
		this.menu.addClose('Back');
	}

	this.start = function(cb, ap, aG) {
		args = {};
		if( aG != null ) {
			args = eval(aG);
		}

		//
		// Create the app container if it doesn't exist, and clear it out
		// if it does exist.
		//
		var appContainer = M.createContainer(ap, 'ciniki_sysadmin_domains', 'yes');
		if( appContainer == null ) {
			alert('App Error');
			return false;
		} 

		if( args != null && args.business != null && args.business != '' ) {
			M.curBusinessID = args.business;
		}
		if( args != null && args.domain != null && args.domain != '' ) {
			this.showDomain(cb, args.domain);
		} else {
			this.showMenu(cb);
		}
	}

	this.showMenu = function(cb) {
		if( cb != null ) {
			this.menu.cb = cb;
		}
		
		//
		// Load domain list
		//
		var rsp = M.api.getJSON('ciniki.businesses.domainListAll', {});
		if( rsp['stat'] != 'ok' ) {
			M.api.err(rsp);
			return false;
		}
		this.menu.data = rsp.domains;

		this.menu.refresh();
		this.menu.show();
	}
};
