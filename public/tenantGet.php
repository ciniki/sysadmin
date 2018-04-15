<?php
//
// Description
// -----------
// This function will get detail values for a tenant.  These values
// are used many places in the API and MOSSi.
//
// Arguments
// ---------
// api_key:
// auth_token:
// tnid:         The ID of the tenant to get the details for.
// keys:                The comma delimited list of keys to lookup values for.
//
// Returns
// -------
// <details>
//      <tenant name='' tagline='' />
//      <contact>
//          <person name='' />
//          <phone number='' />
//          <fax number='' />
//          <email address='' />
//          <address street1='' street2='' city='' province='' postal='' country='' />
//          <tollfree number='' restrictions='' />
//      </contact>
// </details>
//
function ciniki_sysadmin_tenantGet($ciniki) {
    //
    // Find all the required and optional arguments
    //
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'prepareArgs');
    $rc = ciniki_core_prepareArgs($ciniki, 'no', array(
        'tnid'=>array('required'=>'yes', 'blank'=>'no', 'name'=>'Tenant'), 
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

    $rsp = array('stat'=>'ok', 'details'=>array());

    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbQuote');
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbHashQuery');
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbDetailsQuery');
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbDetailsQueryDash');
    //
    // Get the basic details
    $strsql = "SELECT name, category, flags, sitename, tagline, reseller_id "
        . "FROM ciniki_tenants "
        . "WHERE id = '" . ciniki_core_dbQuote($ciniki, $args['tnid']) . "' ";
    $rc = ciniki_core_dbHashQuery($ciniki, $strsql, 'ciniki.tenants', 'tenant');
    if( $rc['stat'] != 'ok' ) {
        return $rc;
    }
    $rsp['details']['tenant.name'] = $rc['tenant']['name'];
    $rsp['details']['tenant.category'] = $rc['tenant']['category'];
    $rsp['details']['tenant.sitename'] = $rc['tenant']['sitename'];
    $rsp['details']['tenant.tagline'] = $rc['tenant']['tagline'];
    $rsp['details']['tenant.flags'] = $rc['tenant']['flags'];
    $rsp['details']['tenant.reseller_id'] = $rc['tenant']['reseller_id'];

    //
    // Get the ciniki details
    //
    $rc = ciniki_core_dbDetailsQuery($ciniki, 'ciniki_tenant_details', 'tnid', $args['tnid'], 'ciniki.tenants', 'details', $detail_key);
    if( $rc['stat'] != 'ok' ) {
        return $rc;
    }
    if( $rc['details'] != null ) {
        $rsp['details'] += $rc['details'];
    }

    //
    // Get the social details
    //
    $rc = ciniki_core_dbDetailsQueryDash($ciniki, 'ciniki_tenant_details', 'tnid', $args['tnid'], 'ciniki.tenants', 'details', $detail_key);
    if( $rc['stat'] != 'ok' ) {
        return $rc;
    }
    if( $rc['details'] != null ) {
        $rsp['details'] += $rc['details'];
    }

    //
    // Get the list of resellers
    //
    $strsql = "SELECT id, name "
        . "FROM ciniki_tenants "
        . "WHERE (flags&0x01) = 0x01 "
        . "AND id <> '" . ciniki_core_dbQuote($ciniki, $args['tnid']) . "' "
        . "";
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbHashQueryArrayTree');
    $rc = ciniki_core_dbHashQueryArrayTree($ciniki, $strsql, 'ciniki.tenants', array(
        array('container'=>'resellers', 'fname'=>'id', 'fields'=>array('id', 'name')),
        ));
    if( $rc['stat'] != 'ok' ) {
        return $rc;
    }
    $rsp['resellers'] = isset($rc['resellers']) ? $rc['resellers'] : array();
    array_unshift($rsp['resellers'], array('id'=>0, 'name'=>'None'));

    return $rsp;
}
?>
