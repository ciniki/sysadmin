<?php
//
// Description
// -----------
// This script checks for and upgrades the database. This is done as the last part of an upgrade.
// 

//
// Initialize Ciniki by including the ciniki_api.php
//
global $ciniki_root;
$ciniki_root = dirname(__FILE__);
if( !file_exists($ciniki_root . '/ciniki-api.ini') ) {
    $ciniki_root = dirname(dirname(dirname(dirname(__FILE__))));
}
// loadMethod is required by all function to ensure the functions are dynamically loaded
require_once($ciniki_root . '/ciniki-mods/core/private/loadMethod.php');
require_once($ciniki_root . '/ciniki-mods/core/private/init.php');
require_once($ciniki_root . '/ciniki-mods/core/private/checkModuleFlags.php');

$rc = ciniki_core_init($ciniki_root, 'rest');
if( $rc['stat'] != 'ok' ) {
    error_log("unable to initialize core");
    exit(1);
}

//
// Setup the $ciniki variable to hold all things ciniki.  
//
$ciniki = $rc['ciniki'];
$ciniki['session']['user']['id'] = -4;  // Setup to Ciniki Robot

print "Upgrading tables\n";
ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbUpgradeTables');
$rc = ciniki_core_dbUpgradeTables($ciniki);
if( $rc['stat'] != 'ok' ) {
    print_r($rc['err']);
}

exit(0);
?>
