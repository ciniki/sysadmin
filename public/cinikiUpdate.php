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
        return array('stat'=>'fail', 'err'=>array('code'=>'ciniki.sysadmin.10', 'msg'=>'Access denied'));
    }

    if( isset($ciniki['config']['ciniki.core']['update.script']) 
        && file_exists($ciniki['config']['ciniki.core']['update.script'])
        ) {
        $results = exec($ciniki['config']['ciniki.core']['update.script']); 
        error_log($results);
    }

    return array('stat'=>'ok');
}
?>
