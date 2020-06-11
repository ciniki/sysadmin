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
function ciniki_sysadmin_cinikiUpdate(&$ciniki) {
    
    //
    // Sysadmins are allowed full access
    //
    if( ($ciniki['session']['user']['perms'] & 0x01) != 0x01 ) {
        return array('stat'=>'fail', 'err'=>array('code'=>'ciniki.sysadmin.19', 'msg'=>'Access denied'));
    }

    if( isset($ciniki['config']['ciniki.core']['update.script']) 
        && file_exists($ciniki['config']['ciniki.core']['update.script'])
        ) {
        $results = exec($ciniki['config']['ciniki.core']['update.script']); 
        error_log($results);
    }
    elseif( isset($ciniki['config']['ciniki.core']['sync.code.url']) ) {
        ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'syncUpgradeSystem');
        $rc = ciniki_core_syncUpgradeSystem($ciniki);
        if( $rc['stat'] != 'ok' ) {
            return array('stat'=>'fail', 'err'=>array('code'=>'ciniki.sysadmin.11', 'msg'=>'Unable to upgrade system', 'err'=>$rc['err']));
        }
    }
    else {
        return array('stat'=>'fail', 'err'=>array('code'=>'ciniki.sysadmin.7', 'msg'=>'No upgrade ability configured', 'err'=>$rc['err']));
    }

    return array('stat'=>'ok');
}
?>
