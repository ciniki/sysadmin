<?php
//
// Description
// -----------
// This function will retrieve all the owners and their tenants.  This is
// only available to sys admins.
//
// Arguments
// ---------
// api_key:
// auth_token:
//
// Returns
// -------
//
function ciniki_sysadmin_resellers($ciniki) {
    //
    // Find all the required and optional arguments
    //
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'prepareArgs');
    $rc = ciniki_core_prepareArgs($ciniki, 'no', array(
        'reseller_id'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Reseller'), 
        ));
    if( $rc['stat'] != 'ok' ) {
        return $rc;
    }
    $args = $rc['args'];

    //
    // Reset reseller id to zero if not specified
    //
    if( !isset($args['reseller_id']) || $args['reseller_id'] == '' || $args['reseller_id'] == 0 ) {
        $args['reseller_id'] = $ciniki['config']['ciniki.core']['master_tnid'];
    }

    //
    // Sysadmins are allowed full access
    //
    if( ($ciniki['session']['user']['perms'] & 0x01) != 0x01 ) {
        return array('stat'=>'fail', 'err'=>array('code'=>'ciniki.sysadmin.2', 'msg'=>'Access denied'));
    }

    //
    // Get the list of resellers
    //
    $strsql = "SELECT resellers.id, resellers.name, COUNT(tenants.id) AS num_tenants "
        . "FROM ciniki_tenants AS resellers "
        . "LEFT JOIN ciniki_tenants AS tenants ON ("
            . "resellers.id = tenants.reseller_id "
            . ") "
        . "WHERE (resellers.flags&0x01) = 0x01 "
        . "GROUP BY resellers.id "
        . "";
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbHashQueryArrayTree');
    $rc = ciniki_core_dbHashQueryArrayTree($ciniki, $strsql, 'ciniki.sysadmin', array(
        array('container'=>'tenants', 'fname'=>'id', 'fields'=>array('id', 'name', 'num_tenants')),
        ));
    if( $rc['stat'] != 'ok' ) {
        return array('stat'=>'fail', 'err'=>array('code'=>'ciniki.sysadmin.5', 'msg'=>'Unable to load tenants', 'err'=>$rc['err']));
    }
    if( isset($rc['tenants']) ) {
        $resellers = $rc['tenants'];
        $reseller_ids = array();
        foreach($resellers as $k => $v) {
            $reseller_ids[] = $v['id'];
        }
    } else {
        $resellers = array();
        $reseller_ids = array();
    }

    $rsp = array('stat'=>'ok', 'resellers'=>$resellers, 'reseller_ids'=>$reseller_ids);

    // 
    // Get the list of tenants for the reseller
    //
    $strsql = "SELECT id, name "
        . "FROM ciniki_tenants "
        . "WHERE reseller_id = '" . ciniki_core_dbQuote($ciniki, $args['reseller_id']) . "' "
        . "";
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbHashQueryArrayTree');
    $rc = ciniki_core_dbHashQueryArrayTree($ciniki, $strsql, 'ciniki.sysadmin', array(
        array('container'=>'tenants', 'fname'=>'id', 'fields'=>array('id', 'name')),
        ));
    if( $rc['stat'] != 'ok' ) {
        return array('stat'=>'fail', 'err'=>array('code'=>'ciniki.sysadmin.6', 'msg'=>'Unable to load tenants', 'err'=>$rc['err']));
    }
    if( isset($rc['tenants']) ) {
        $rsp['tenants'] = $rc['tenants'];
        $rsp['tenant_ids'] = array();
        foreach($rsp['tenants'] as $k => $v) {
            $rsp['tenant_ids'][] = $v['id'];
        }
    } else {
        $rsp['tenants'] = array();
        $rsp['tenant_ids'] = array();
    }

    return $rsp;
}
?>
