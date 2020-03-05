<?php
//
// Description
// -----------
// This method will run the update to get the latest code.
//
// Arguments
// ---------
// api_key:
// auth_token:
//
// Returns
// -------
// <rsp stat='ok' />
//
function ciniki_sysadmin_cinikiUpdateCode(&$ciniki) {
    
    //
    // Sysadmins are allowed full access
    //
    if( ($ciniki['session']['user']['perms'] & 0x01) != 0x01 ) {
        return array('stat'=>'fail', 'err'=>array('code'=>'ciniki.sysadmin.13', 'msg'=>'Access denied'));
    }

    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'syncUpgradeSystem');
    $rc = ciniki_core_syncUpgradeSystem($ciniki);
    if( $rc['stat'] != 'ok' ) {
        return array('stat'=>'fail', 'err'=>array('code'=>'ciniki.sysadmin.12', 'msg'=>'Unable to upgrade code', 'err'=>$rc['err']));
    }

    return array('stat'=>'ok');
}
?>
