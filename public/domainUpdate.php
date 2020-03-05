<?php
//
// Description
// ===========
// This function will update the domain information
//
// Arguments
// ---------
// user_id:         The user making the request
// 
// Returns
// -------
// <rsp stat='ok' id='34' />
//
function ciniki_sysadmin_domainUpdate($ciniki) {
    //  
    // Find all the required and optional arguments
    //  
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'prepareArgs');
    $rc = ciniki_core_prepareArgs($ciniki, 'no', array(
        'tenant_id'=>array('required'=>'yes', 'blank'=>'no', 'name'=>'Tenant'), 
        'domain_id'=>array('required'=>'yes', 'blank'=>'no', 'name'=>'Domain ID'), 
        'domain'=>array('required'=>'no', 'blank'=>'no', 'name'=>'Domain'), 
        'flags'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Flags'), 
        'status'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Status'),
        'expiry_date'=>array('required'=>'no', 'blank'=>'yes', 'type'=>'date', 'name'=>'Expiry Date'),
        'managed_by'=>array('required'=>'no', 'blank'=>'yes', 'default'=>'', 'name'=>'Managed'),
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
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbUpdate');
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbAddModuleHistory');
    $rc = ciniki_core_dbTransactionStart($ciniki, 'ciniki.sysadmin');
    if( $rc['stat'] != 'ok' ) { 
        return $rc;
    }   

    //
    // Start building the update SQL
    //
    $strsql = "UPDATE ciniki_tenant_domains SET last_updated = UTC_TIMESTAMP()";

    //
    // Add all the fields to the change log
    //
    $changelog_fields = array(
        'domain',
        'flags',
        'status',
        'expiry_date',
        'managed_by',
        );
    foreach($changelog_fields as $field) {
        if( isset($args[$field]) ) {
            $strsql .= ", $field = '" . ciniki_core_dbQuote($ciniki, $args[$field]) . "' ";
            $rc = ciniki_core_dbAddModuleHistory($ciniki, 'ciniki.sysadmin', 'ciniki_tenant_history', $args['tenant_id'], 
                2, 'ciniki_tenant_domains', $args['domain_id'], $field, $args[$field]);
        }
    }
    $strsql .= "WHERE tnid = '" . ciniki_core_dbQuote($ciniki, $args['tenant_id']) . "' "
        . "AND id = '" . ciniki_core_dbQuote($ciniki, $args['domain_id']) . "' ";
    $rc = ciniki_core_dbUpdate($ciniki, $strsql, 'ciniki.sysadmin');
    if( $rc['stat'] != 'ok' ) {
        ciniki_core_dbTransactionRollback($ciniki, 'ciniki.sysadmin');
        return $rc;
    }
    if( !isset($rc['num_affected_rows']) || $rc['num_affected_rows'] != 1 ) {
        ciniki_core_dbTransactionRollback($ciniki, 'ciniki.sysadmin');
        return array('stat'=>'fail', 'err'=>array('code'=>'ciniki.sysadmin.16', 'msg'=>'Unable to update domain'));
    }

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
