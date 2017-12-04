<?php
//
// Description
// -----------
// This method returns the list of labels available for a tenant and the messages counts were applicable.
//
// Arguments
// ---------
// api_key:
// auth_token:
// tnid:         The ID of the tenant to add the mail mailing to.
//
// Returns
// -------
// <rsp stat='ok' id='34' />
//
function ciniki_sysadmin_mailStats(&$ciniki) {
    //
    // Sysadmins are allowed full access
    //
    if( ($ciniki['session']['user']['perms'] & 0x01) != 0x01 ) {
        return array('stat'=>'fail', 'err'=>array('code'=>'ciniki.sysadmin.1', 'msg'=>'Access denied'));
    }

    //
    // Get the mail stats
    //
    $strsql = "SELECT ciniki_tenants.id, ciniki_tenants.name, "
        . "ciniki_mail.status, COUNT(ciniki_mail.id) AS num_messages "
        . "FROM ciniki_mail, ciniki_tenants "
        . "WHERE ciniki_mail.status IN (7, 10, 15, 20, 50) "
        . "AND ciniki_mail.tnid = ciniki_tenants.id "
        . "GROUP BY ciniki_mail.tnid, ciniki_mail.status "
        . "";
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbHashQueryTree');
    $rc = ciniki_core_dbHashQueryTree($ciniki, $strsql, 'ciniki.mail', array(
        array('container'=>'mail', 'fname'=>'id', 'name'=>'messages',
            'fields'=>array('id', 'name')),
        array('container'=>'status', 'fname'=>'status', 'name'=>'status',
            'fields'=>array('status', 'num_messages')),
        ));
    if( $rc['stat'] != 'ok' ) {
        return $rc;
    }

    return $rc;
}
?>
