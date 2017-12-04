<?php
//
// Description
// -----------
// This script will check for badly formed email addresses in the database
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

print "Checking Emails\n";
$strsql = "SELECT "
    . "ciniki_tenants.name, "
    . "ciniki_customers.display_name, "
    . "ciniki_customer_emails.email "
    . "FROM ciniki_customer_emails, ciniki_customers, ciniki_tenants "
    . "WHERE ciniki_customer_emails.email NOT LIKE '%@%' "
    . "AND ciniki_customer_emails.customer_id = ciniki_customers.id "
    . "AND ciniki_customers.tnid = ciniki_tenants.id "
    . "ORDER BY ciniki_tenants.name, ciniki_customers.display_name "
    . "";

ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbHashQuery');
$rc = ciniki_core_dbHashQuery($ciniki, $strsql, 'ciniki.customers', 'customer');
if( $rc['stat'] != 'ok' ) {
    print_r($rc['err']);
}
if( isset($rc['rows']) ) {
    foreach($rc['rows'] as $row) {
        printf("%-40s%-40s%s\n", $row['name'], $row['display_name'], $row['email']);
    }
}

exit(0);
?>
