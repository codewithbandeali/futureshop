<?php

include 'verify.php';

use Google\Auth\ApplicationDefaultCredentials;
use GuzzleHttp\Client;
use GuzzleHttp\HandlerStack;


$middleware = ApplicationDefaultCredentials::getMiddleware();
$stack = HandlerStack::create();
$stack->push($middleware);

$client = new Client([
    'handler' => $stack,
    'base_uri' => 'https://www.googleapis.com/storage/v1/',
    'auth' => 'google_auth'
]);

$response = $client->get('buckets');
$buckets = json_decode($response->getBody(), true);
print_r($buckets);

use Google\Auth\Credentials\ServiceAccountCredentials;

$keyFilePath = '/path/to/service-account-key.json';
$scopes = ['https://www.googleapis.com/auth/cloud-platform'];

$credentials = new ServiceAccountCredentials($scopes, $keyFilePath);
$token = $credentials->fetchAuthToken();
echo $token['access_token']; 


$json = file_get_contents('/path/to/credentials.json');
$loader = Google\Auth\CredentialsLoader::loadFromJson($json, $scopes);