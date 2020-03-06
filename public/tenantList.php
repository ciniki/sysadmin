<?php
//
// Description
// -----------
// This function will retrieve the list of tenants, by category and their owners
//
// Arguments
// ---------
// api_key:
// auth_token:
//
// Returns
// -------
//
function ciniki_sysadmin_tenantList($ciniki) {

    //
    // Sysadmins are allowed full access
    //
    if( ($ciniki['session']['user']['perms'] & 0x01) != 0x01 ) {
        return array('stat'=>'fail', 'err'=>array('code'=>'ciniki.sysadmin.10', 'msg'=>'Access denied'));
    }

    //
    // Query for tenants and users
    //
    $strsql = "SELECT IF(ciniki_tenants.category='','Uncategorized', ciniki_tenants.category) AS category, "
        . "ciniki_tenants.id, "
        . "ciniki_tenants.name, "
        . "ciniki_tenants.status AS status_text, "
        . "ciniki_tenant_users.user_id, "
        . "ciniki_users.display_name, "
        . "ciniki_users.firstname, "
        . "ciniki_users.lastname, "
        . "ciniki_users.email "
        . "FROM ciniki_tenants "
        . "LEFT JOIN ciniki_tenant_users ON ("
            . "ciniki_tenants.id = ciniki_tenant_users.tnid "
            . "AND ciniki_tenant_users.status = 10 "
            . ") "
        . "LEFT JOIN ciniki_users ON ("
            . "ciniki_tenant_users.user_id = ciniki_users.id "
            . ") "
        . "ORDER BY category, ciniki_tenants.name, ciniki_users.firstname, ciniki_users.lastname "
        . "";
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbHashQueryArrayTree');
    $rc = ciniki_core_dbHashQueryArrayTree($ciniki, $strsql, 'ciniki.sysadmin', array(
        array('container'=>'categories', 'fname'=>'category', 'fields'=>array('name'=>'category')),
        array('container'=>'tenants', 'fname'=>'id', 
            'fields'=>array('id', 'name', 'status_text'),
            'maps'=>array('status_text'=>array('1'=>'Active', '50'=>'Suspended', '60'=>'Deleted')),
            ),
        array('container'=>'users', 'fname'=>'user_id', 
            'fields'=>array('user_id', 'display_name', 'firstname', 'lastname', 'email'),
            ),
        ));
    if( $rc['stat'] != 'ok' ) {
        return array('stat'=>'fail', 'err'=>array('code'=>'ciniki.sysadmin.17', 'msg'=>'Unable to get tenant list', 'err'=>$rc['err']));
    }
    foreach($rc['categories'] as $cid => $category) {
        foreach($category['tenants'] as $tid => $tenant) {
            $users = '';
            if( isset($tenant['users']) ) {
                foreach($tenant['users'] as $uid => $user) {
                    $users .= ($users != '' ? ', ' : '') . $user['firstname'] . ' ' . $user['lastname'];
                }
            }
            $rc['categories'][$cid]['tenants'][$tid]['userlist'] = $users;
        }
    }
    return $rc;
}
?>
