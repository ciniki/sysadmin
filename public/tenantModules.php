<?php
//
// Description
// -----------
// This function will return the list of tenants and which modules they have turned on.
// This function is not part of the tenant reports.
//
// Arguments
// ---------
// api_key:
// auth_token:
// tnid:         The ID of the tenant to get the users for.
//
// Returns
// -------
//
function ciniki_sysadmin_tenantModules($ciniki) {
    //
    // Find all the required and optional arguments
    //
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'prepareArgs');
    $rc = ciniki_core_prepareArgs($ciniki, 'no', array(
        ));
    if( $rc['stat'] != 'ok' ) {
        return $rc;
    }
    $args = $rc['args'];
    
    //
    // Sysadmins are allowed full access
    //
    if( ($ciniki['session']['user']['perms'] & 0x01) != 0x01 ) {
        return array('stat'=>'fail', 'err'=>array('code'=>'ciniki.sysadmin.1', 'msg'=>'Access denied'));
    }

    ciniki_core_loadMethod($ciniki, 'ciniki', 'users', 'private', 'datetimeFormat');
    $datetime_format = ciniki_users_datetimeFormat($ciniki);

    //
    // Query for the tenants and they modules enabled
    //
    $strsql = "SELECT "
        . "CONCAT_WS('.', ciniki_tenant_modules.package, ciniki_tenant_modules.module) AS modname, "
        . "ciniki_tenant_modules.package, "
        . "ciniki_tenant_modules.module, "
        . "ciniki_tenants.name AS tenant_name, "
        . "DATE_FORMAT(ciniki_tenant_modules.last_change, '" . ciniki_core_dbQuote($ciniki, $datetime_format) . "') as last_change "
        . "FROM ciniki_tenant_modules "
        . "LEFT JOIN ciniki_tenants ON ("
            . "ciniki_tenant_modules.tnid = ciniki_tenants.id "
            . "AND ciniki_tenant_modules.status > 0 "
            . ") "
        . "ORDER BY ciniki_tenant_modules.package, ciniki_tenant_modules.module, ciniki_tenants.name, ciniki_tenant_modules.last_change DESC "
        . "";
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbHashQueryTree');
    $rc = ciniki_core_dbHashQueryTree($ciniki, $strsql, 'ciniki.reporting', array(
        array('container'=>'modules', 'fname'=>'modname', 'name'=>'module',
            'fields'=>array('name'=>'modname', 'package', 'module')),
        array('container'=>'tenants', 'fname'=>'tenant_name', 'name'=>'tenant',
            'fields'=>array('name'=>'tenant_name', 'last_change')),
        ));
    if( $rc['stat'] != 'ok' ) {
        return $rc;
    }
    
    return $rc;
}
?>
