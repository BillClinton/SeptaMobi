<?php

include 'HttpProxy.class.php';

HttpProxy::relayRequest(array(
    'url' => 'https://maps.googleapis.com/maps/api/geocode/json'
));