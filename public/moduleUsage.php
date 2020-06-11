<?php
//
// Description
// -----------
// Pull the list of modules available, and return usages with flags
// 
// Arguments
// ---------
// ciniki: 
// tnid:            The ID of the current tenant.
// 
// Returns
// ---------
// 
function ciniki_sysadmin_moduleUsage(&$ciniki) {
    
    //
    // Find all the required and optional arguments
    //
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'prepareArgs');
    $rc = ciniki_core_prepareArgs($ciniki, 'no', array(
        'package'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Package'), 
        'module'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Module'), 
        'flags'=>array('required'=>'no', 'blank'=>'yes', 'default'=>0, 'name'=>'Flags'), 
        ));
    if( $rc['stat'] != 'ok' ) {
        return $rc;
    }
    $args = $rc['args'];
    if( $args['package'] == 'null' ) {
        $args['package'] = '';
    }
    if( $args['module'] == 'null' ) {
        $args['module'] = '';
    }

    //
    // Sysadmins are allowed full access
    //
    if( ($ciniki['session']['user']['perms'] & 0x01) != 0x01 ) {
        return array('stat'=>'fail', 'err'=>array('code'=>'ciniki.sysadmin.18', 'msg'=>'Access denied'));
    }

    //
    // Get the list modules
    //
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'getModuleList');
    $rc = ciniki_core_getModuleList($ciniki);
    if( $rc['stat'] != 'ok' ) {
        return array('stat'=>'fail', 'err'=>array('code'=>'ciniki.sysadmin.24', 'msg'=>'Unable to load list of modules', 'err'=>$rc['err']));
    }
    $packages = array();
    $modules = array();
    foreach($rc['modules'] as $module) {
        if( !isset($args['package']) || $args['package'] == '' ) {
            $args['package'] = $module['package'];
        }
        if( !isset($args['module']) || $args['module'] == '' ) {
            $args['module'] = $module['name'];
        }
        if( isset($args['package']) && $module['package'] == $args['package'] ) {
            $modules[] = $module;
        }
        if( !in_array($module['package'], $packages) ) {
            $packages[] = $module['package'];
        }
    }

    $rsp = array('stat'=>'ok', 'package'=>$args['package'], 'module'=>$args['module'], 'flags'=>$args['flags'], 'packages'=>$packages, 'modules'=>$modules);

    //
    // Get the list of modules used and the businesses using them
    //
    if( isset($args['package']) && $args['module'] != ''  
        && isset($args['module']) && $args['module'] != '' 
        ) {
        //
        // Load the flags for the module, if any
        //
        $rsp['module_flags'] = array();
        $rc = ciniki_core_loadMethod($ciniki, $args['package'], $args['module'], 'private', 'flags');
        if( $rc['stat'] == 'ok' ) {
            $fn = $args['package'] . '_' . $args['module'] . '_flags';
            $rc = $fn($ciniki, array());
            $rsp['module_flags'] = $rc['flags'];
        }
        $flag_text = array();
        foreach($rsp['module_flags'] as $flag) {
            $flag_text[pow(2, ($flag['flag']['bit']-1))] = $flag['flag']['name'];
        }

        //
        // Query for the tenants and they modules enabled
        //
        $strsql = "SELECT tenants.id, tenants.name, modules.flags, modules.flags AS flag_text, modules.status "
            . "FROM ciniki_tenant_modules AS modules "
            . "LEFT JOIN ciniki_tenants AS tenants ON ("
                . "modules.tnid = tenants.id "
                . ") "
            . "WHERE modules.package = '" . ciniki_core_dbQuote($ciniki, $args['package']) . "' "
            . "AND modules.module = '" . ciniki_core_dbQuote($ciniki, $args['module']) . "' ";
        if( isset($args['flags']) && $args['flags'] != '' && $args['flags'] > 0 ) {
            $flags = intval($args['flags']);
            $strsql .= "AND (modules.flags&$flags) = $flags ";
        }
        $strsql .= "ORDER BY tenants.name "
            . "";
        ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbHashQueryArrayTree');
        $rc = ciniki_core_dbHashQueryArrayTree($ciniki, $strsql, 'ciniki.sysadmin', array(
            array('container'=>'tenants', 'fname'=>'id', 
                'fields'=>array('id', 'name', 'flags', 'flag_text', 'status'),
                'flags'=>array('flag_text'=>$flag_text),
                ),
            ));
        if( $rc['stat'] != 'ok' ) {
            return array('stat'=>'fail', 'err'=>array('code'=>'ciniki.sysadmin.25', 'msg'=>'Unable to load tenants', 'err'=>$rc['err']));
        }
        $rsp['tenants'] = isset($rc['tenants']) ? $rc['tenants'] : array();
    }

    return $rsp;        
}
?>
