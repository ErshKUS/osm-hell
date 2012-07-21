<?php


require_once 'Zend/Loader.php';
Zend_Loader::loadClass('Zend_Gdata_AuthSub');
Zend_Loader::loadClass('Zend_Gdata_ClientLogin');
Zend_Loader::loadClass('Zend_Gdata_Spreadsheets');
Zend_Loader::loadClass('Zend_Gdata_Docs');
Zend_Loader::loadClass('Zend_Dom_Query');

error_reporting(E_ALL);



$key = '0Audf4lLOzWyIdHloYmhZN05ia1cwTks4VndiUGswdGc';

$username = 'username';
$password = 'password';


$service = Zend_Gdata_Spreadsheets::AUTH_SERVICE_NAME;
$client = Zend_Gdata_ClientLogin::getHttpClient($username, $password, $service);
$spreadSheetService = new Zend_Gdata_Spreadsheets($client);

$query = new Zend_Gdata_Spreadsheets_ListQuery();
$query->setSpreadsheetKey($key);
$query->setWorksheetId(1);
$listFeed = $spreadSheetService->getListFeed($query);

$client = new Zend_Http_Client('http://nominatim.openstreetmap.org/search', array(
		'maxredirects' => 0,
		'timeout'      => 30));
$client->setMethod(Zend_Http_Client::GET);


$cols = array();
$data = array();

$i = 0;

foreach ($listFeed as $item) {
	$rowData = $item->getCustom();
	$row = array();
	$j = 0;
	$geo = array();
	foreach($rowData as $customEntry) {
		if ( $i == 0 ) {
			array_push($cols, $customEntry->getColumnName());
		}		
		if ( $j == 4 || $j == 5 ) {
			array_push( $geo, $customEntry->getText() );
		}
 		array_push($row, $customEntry->getText());
 		$j++;
	}

	if ( isset($geo[0]) && isset($geo[1])) {
		$str = $geo[1] . ' ' . $geo[0];
		$a = getCoord($str);
		if ( $a ) {
			array_push($row, $a);
		}
	}
	array_shift($row);
	array_push($data, $row);
	$i++;
}

array_shift($cols);

?>


<?php foreach ($data as $row) {?>

INSERT INTO hell_data(nameperson, dob, age, city, street, source, sourceperson, status, details,  sourcecontact)
  VALUES (
  '<?php echo $row[0] ?>'
  <?php echo $row[1] ?>
  <?php echo $row[2] ?>
  '<?php echo $row[3] ?>'
  '<?php echo $row[4] ?>'
  '<?php echo $row[5] ?>'
  '<?php echo $row[6] ?>'
  '<?php echo $row[7] ?>'
  '<?php echo $row[8] ?>'
  '<?php echo $row[9] ?>'
  );<br>
<?php } ?>
<br>

<?php 


function getCoord($str) {
	$client = new Zend_Http_Client();
	$client->setUri('http://nominatim.openstreetmap.org/search');
	$client->setParameterGet(array(
			'q' => $str,
			'format' => 'xml'
	));
	
	$response = $client->request();
	
	$dom = new Zend_Dom_Query($response->getBody());
	$result = $dom->query('searchresults > place');
	if ( count($result) ) {
		return 'Lat: '. $result->current()->getAttribute('lat').'; Lon: '. $result->current()->getAttribute('lon');
	} 
	return false;
}

?>
