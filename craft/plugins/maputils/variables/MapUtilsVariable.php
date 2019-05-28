<?php

namespace Craft;

class MapUtilsVariable {
    
    public function satelliteImageUrl ( $center, $zoom = 14 ) {
        $apiKey = craft()->plugins->getPlugin('simpleMap')->getSettings()->browserApiKey;
        $query = [
            'center' => $center,
            'zoom' => $zoom,
            'size' => '640x1280',
            'maptype' => 'satellite',
            'scale' => 2,
            'key' => $apiKey
        ];
        return "https://maps.googleapis.com/maps/api/staticmap?" . http_build_query( $query );
    }
    
    public function placeID ( $address ) {
        $apiKey = craft()->plugins->getPlugin('simpleMap')->getSettings()->browserApiKey;
        $query = [
            'key' => $apiKey,
            'input' => $address,
            'inputtype' => 'textquery'
        ];
        $url = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?" . http_build_query( $query );
        $data = json_decode( file_get_contents( $url ), true );
        if ( $data[ 'status' ] !== "OK" ) return null;
        return $data[ 'candidates' ][ 0 ][ 'place_id' ];
    }
    
    private function isOpenNow ( $periods ) {
        if (
            count( $periods ) === 1 &&
            !array_key_exists( 'close', $periods[ 0 ] )
        ) return true;
        $minutes = function ( $hhmm ) {
            $h = ( int ) substr( $hhmm, 0, 2 );
            $m = ( int ) substr( $hhmm, 2 );
            return $h * 60 + $m;
        };
        $today = (int) date('w');
        $now = $minutes( date( 'Hi' ) );
        foreach ( $periods as $period ) {
            $openDay = $period[ 'open' ][ 'day' ];
            $openTime = $minutes( $period[ 'open' ][ 'time' ] );
            $closeDay = $period[ 'close' ][ 'day' ];
            $closeTime = $minutes( $period[ 'close' ][ 'time' ] );
            if (
                $today >= $openDay &&
                $now >= $openTime &&
                $today <= $closeDay &&
                $now <= $closeTime
            ) return true;
        }
        return false;
    }
    
    public function placeData ( $address, $fields = [ 'website', 'international_phone_number', 'price_level' , 'opening_hours' ] ) {
        $cacheKey = "placeDetails:$address";
        if ( $cached = craft() -> cache -> get( $cacheKey ) ) {
            $data = json_decode( $cached );
        } else {
            $id = $this->placeID( $address );
            if ( $id === null ) return null;
            $apiKey = craft()->plugins->getPlugin('simpleMap')->getSettings()->browserApiKey;
            $query = [
                'key' => $apiKey,
                'placeid' => $id,
                'fields' => implode( ',', $fields )
            ];
            $url = "https://maps.googleapis.com/maps/api/place/details/json?" . http_build_query( $query );
            $data = json_decode( file_get_contents( $url ), true );
            craft() -> cache -> set( $cacheKey, json_encode( $data ), 60 * 60 * 24 );
        }
        if (
            array_key_exists( 'opening_hours', $data ) &&
            array_key_exists( 'periods', $data[ 'opening_hours' ] )
        ) {
            $open_now = $this -> isOpenNow( $data[ 'opening_hours' ][ 'periods' ] );
            $data[ 'opening_hours' ][ 'open_now' ] = $open_now;
        }
        return $data;
    }
}