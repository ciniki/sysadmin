<?php
//
// Description
// ===========
// This function will remove a domain from the database.
//
// Arguments
// ---------
// user_id:         The user making the request
// 
// Returns
// -------
// <rsp stat='ok' id='34' />
//
function ciniki_sysadmin_domainDelete($ciniki) {
    //  
    // Find all the required and optional arguments
    //  
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'prepareArgs');
    $rc = ciniki_core_prepareArgs($ciniki, 'no', array(
        'tenant_id'=>array('required'=>'yes', 'blank'=>'no', 'name'=>'Tenant'), 
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
        return array('stat'=>'fail', 'err'=>array('code'=>'ciniki.sysadmin.10', 'msg'=>'Access denied'));
    }

    //  
    // Turn off autocommit
    //  
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbTransactionStart');
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbTransactionRollback');
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbTransactionCommit');
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbQuote');
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbDelete');
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbAddModuleHistory');
    $rc = ciniki_core_dbTransactionStart($ciniki, 'ciniki.sysadmin');
    if( $rc['stat'] != 'ok' ) { 
        return $rc;
    }   

    //
    // Start building the delete SQL
    //
    $strsql = "DELETE FROM ciniki_tenant_domains "
        . "WHERE id = '" . ciniki_core_dbQuote($ciniki, $args['domain_id']) . "' "
        . "";

    $rc = ciniki_core_dbDelete($ciniki, $strsql, 'ciniki.sysadmin');
    if( $rc['stat'] != 'ok' ) {
        ciniki_core_dbTransactionRollback($ciniki, 'ciniki.sysadmin');
        return $rc;
    }
    if( !isset($rc['num_affected_rows']) || $rc['num_affected_rows'] != 1 ) {
        ciniki_core_dbTransactionRollback($ciniki, 'ciniki.sysadmin');
        return array('stat'=>'fail', 'err'=>array('code'=>'ciniki.sysadmin.14', 'msg'=>'Unable to update art'));
    }

    //
    // Log the deletion
    //
    $rc = ciniki_core_dbAddModuleHistory($ciniki, 'ciniki.sysadmin', 'ciniki_tenant_history', $args['tenant_id'], 
        3, 'ciniki_tenant_domains', $args['domain_id'], '*', '');

    //
    // Commit the database changes
    //
    $rc = ciniki_core_dbTransactionCommit($ciniki, 'ciniki.sysadmin');
    if( $rc['stat'] != 'ok' ) {
        return $rc;
    }

    return array('stat'=>'ok');
}
?>
