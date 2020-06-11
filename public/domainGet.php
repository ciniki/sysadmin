<?php
//
// Description
// ===========
// This method will return the domain information for a tenant domain.
//
// Arguments
// ---------
// user_id:         The user making the request
// 
// Returns
// -------
//
function ciniki_sysadmin_domainGet($ciniki) {
    //  
    // Find all the required and optional arguments
    //  
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'prepareArgs');
    $rc = ciniki_core_prepareArgs($ciniki, 'no', array(
        'domain_id'=>array('required'=>'yes', 'blank'=>'no', 'name'=>'Domain'), 
        )); 
    if( $rc['stat'] != 'ok' ) { 
        return $rc;
    }   
    $args = $rc['args'];
    
    //
    // Sysadmins are allowed full access
    //
    if( ($ciniki['session']['user']['perms'] & 0x01) != 0x01 ) {
        return array('stat'=>'fail', 'err'=>array('code'=>'ciniki.sysadmin.22', 'msg'=>'Access denied'));
    }

    ciniki_core_loadMethod($ciniki, 'ciniki', 'users', 'private', 'dateFormat');
    $date_format = ciniki_users_dateFormat($ciniki);

    $strsql = "SELECT id, tnid, domain, flags, status, "
        . "DATE_FORMAT(expiry_date, '" . ciniki_core_dbQuote($ciniki, $date_format) . "') AS expiry_date, "
        . "managed_by, "
        . "date_added, last_updated "
        . "FROM ciniki_tenant_domains "
        . "WHERE id = '" . ciniki_core_dbQuote($ciniki, $args['domain_id']) . "' "
        . "";
    
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbHashQuery');
    $rc = ciniki_core_dbHashQuery($ciniki, $strsql, 'ciniki.sysadmin', 'domain');
    if( $rc['stat'] != 'ok' ) {
        return $rc;
    }
    if( !isset($rc['domain']) ) {
        return array('stat'=>'ok', 'err'=>array('code'=>'ciniki.sysadmin.15', 'msg'=>'Unable to find domain'));
    }

    return array('stat'=>'ok', 'domain'=>$rc['domain']);
}
?>
