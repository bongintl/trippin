<?php

namespace Craft;

class TrippinVariable {
    
    public function guide_thumbnail_elements () {
        return [
            'coverImage',
            'destination',
            'spots',
            'city',
            'city.continent'
        ];
    }
    
    public function city_thumbnail_elements () {
        return [
            'continent'
        ];
    }
    
    public function feature_thumbnail_elements () {
        return [
            'featureType',
            'hero'
        ];
    }
    
    public function sortByNear ( $criteria, $latLng ) {
        // https://tighten.co/blog/craft-cms-building-complex-queries-by-extending-the-elementcriteriamodel
        $dbCommand = craft() -> elements -> buildElementsQuery( $criteria );
        return EntryModel::populateModels( $dbCommand -> queryAll() );
    }
    
}