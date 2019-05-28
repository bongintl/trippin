<?php

namespace Craft;

use Twig_Extension;
use Twig_Filter_Method;
use Twig_Function_Method;

function tag_regex( $tag ) {
    return "/<$tag.*?>.*?<\/$tag>/s";
}

function is_self_closing ( $tag ) {
    $selfClosingTags = [ 'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'menuitem', 'meta', 'param', 'source', 'track', 'wbr' ];
    return in_array( $tag, $selfClosingTags );
}

class TrippinTwigExtension extends \Twig_Extension
{

    public function getName()
    {
        return 'BONG Twig Extension';
    }

    public function getFilters()
    {
        return [
            'delete_tag' => new \Twig_Filter_Method( $this, 'delete_tag' ),
            'extract_tag' => new \Twig_Filter_Method( $this, 'extract_tag' ),
            'index_by' => new \Twig_Filter_Method( $this, 'index_by' ),
            'filter_by' => new \Twig_Filter_Method( $this, 'filter_by' ),
            'pluck' => new \Twig_Filter_Method( $this, 'pluck' ),
            'flatten' => new \Twig_Filter_Method( $this, 'flatten' ),
            'embed_id' => new \Twig_Filter_Method( $this, 'embed_id' ),
            'prefix' => new \Twig_Filter_Method( $this, 'prefix' )
        ];
    }
    
    public function getFunctions ()
    {
        return [
            'attrs' => new \Twig_Function_Method( $this, 'attrs' ),
            'style' => new \Twig_Function_Method( $this, 'style' ),
            'element' => new \Twig_Function_Method( $this, 'element' ),
            'bem' => new \Twig_Function_Method( $this, 'bem' ),
            'cls' => new \Twig_Function_Method( $this, 'cls' ),
            'srcset' => new \Twig_Function_Method( $this, 'srcset' ),
            'lqip' => new \Twig_Function_Method( $this, 'lqip' ),
            'lazy' => new \Twig_Function_Method( $this, 'lazy' ),
            'sizes' => new \Twig_Function_Method( $this, 'sizes' ),
            'img' => new \Twig_Function_Method( $this, 'img' ),
            'hex_to_rgb' => new \Twig_Function_Method( $this, 'hex_to_rgb' ),
            'is_asset' => new \Twig_Function_Method( $this, 'is_asset' )
        ];
    }
    
    public function delete_tag( $content, $tag )
    {
        return preg_replace( tag_regex( $tag ), '', $content );
    }
    
    public function extract_tag( $content, $tag )
    {
        preg_match_all( tag_regex( $tag ), $content, $matches );
        return $matches[ 0 ];
    }
    
    public function index_by( $arr, $key )
    {
        $res = [];
        foreach ( $arr as $item ) {
            $res[ $item[ $key ] ] = $item;
        }
        return $res;
    }
    
    public function filter_by ( $arr, $key, $value = null ) {
        $res = [];
        if ( $value != null ) {
            foreach ( $arr as $item ) {
                if ( $item[ $key ] == $value ) $res []= $item;
            }
        } else {
            foreach ( $arr as $item ) {
                if ( $item[ $key ] ) $res []= $item;
            }
        }
        return $res;
    }
    
    public function pluck ( $arr, $key ) {
        $res = [];
        if ( is_array( $key ) ) {
            foreach ( $arr as $item ) {
                $arr = [];
                foreach ( $key as $k ) {
                    $arr[ $k ] = $item[ $k ];
                }
                $res []= $arr;
            }
        } else {
            foreach ( $arr as $item ) {
                $res []= $item[ $key ];
            }
        }
        return $res;
    }
    
    public function attrs ( $dict ) {
        $attrs = [];
        foreach ( $dict as $key => $value ) {
            if ( $value === false || $value === null ) continue;
            if ( $key == 'style' && is_array( $value ) ) $value = $this -> style( $value );
            if ( $key == 'class' && is_array( $value ) ) $value = $this -> cls( $value );
            if ( $key == 'sizes' && is_array( $value ) ) $value = $this -> sizes( $value );
            $attrs []= $value === true ? $value : "$key=\"$value\"";
        }
        return TemplateHelper::getRaw( implode( ' ', $attrs ) );
    }
    
    public function style ( $dict ) {
        $style = [];
        foreach ( $dict as $key => $value ) {
            $attrs []= "$key: $value";
        }
        return TemplateHelper::getRaw( implode( '; ', $style ) );
    }
    
    public function cls ( $dict ) {
        $classes = [];
        foreach ( $dict as $key => $value ) {
            if ( $value ) $classes []= $key;
        }
        return TemplateHelper::getRaw( implode( ' ', $classes ) );
    }
    
    public function bem ( $be, $ms = [] ) {
        $classes = [ $be => true ];
        foreach ( $ms as $key => $value ) {
            $classes[ "$be--$key" ] = $value;
        }
        return $this -> cls( $classes );
    }
    
    static $transformSizes = [
        [ 'width' => 600 ],
        [ 'width' => 1000 ],
        [ 'width' => 1400 ],
        [ 'width' => 1800 ],
        [ 'width' => 2400 ],
        [ 'width' => 3200 ]
    ];
    
    static $transformPresets = [
        "city" => [
            "ratio" => 0.5,
            'cropZoom' => 1.1,
            'effects' => [
                'normalize' => true,
                'modulate' => [ 100, 180, 100 ]
            ]
        ],
        "guide" => [ "ratio" => 0.666 ]
    ];
    
    static $transformDefaults = [
        'auto' => 'compress,format',
        'imgixParams' => [
            'sharp' => 20
        ]
    ];
    
    static $imagerConfig = [
        'allowUpscale' => false,
        'useRemoteUrlQueryString' => true
    ];
    
    public function transforms ( $asset, $preset = null ) {
        return craft() -> imager -> transformImage(
            $asset,
            static::$transformSizes,
            array_merge_recursive(
                static::$transformDefaults,
                $preset ? static::$transformPresets[ $preset ] : []
            ),
            static::$imagerConfig
        );
    }
    
    public function srcset ( $asset, $preset = null ) {
        return craft() -> imager -> srcset( $this -> transforms( $asset, $preset ) );
    }
    
    public function lqip ( $asset, $preset = null ) {
        return craft() -> imager -> transformImage(
            $asset,
            [ 'width' => 200 ],
            array_merge_recursive(
                static::$transformDefaults,
                $preset ? static::$transformPresets[ $preset ] : [],
                [ 'imgixParams' => [ 'blur' => 100 ] ]
            ),
            static::$imagerConfig
        );
    }
    
    public function lazy ( $asset, $preset = null ) {
        return $this -> attrs([
            'src' => $this -> lqip( $asset, $preset ),
            'data-srcset' => $this -> srcset( $asset, $preset )
        ]);
    }
    
    public function sizes ( $widths ) {
        $breakpoints = craft() -> config -> get('breakpoints', 'bongtwigextensions');
        $sizes = [];
        foreach ( $widths as $name => $size ) {
            $breakpointWidth = $breakpoints[ $name ];
            $sizes []= "( min-width: {$breakpointWidth}px ) $size";
        }
        return TemplateHelper::getRaw( implode( $sizes, ', ' ) );
    }
    
    public function element ( $tag, $attrs, $content = '' ) {
        $attrs = $this -> attrs( $attrs );
        $html = is_self_closing( $tag )
            ? "<$tag $attrs/>"
            : "<$tag $attrs>$content</$tag>";
        return TemplateHelper::getRaw( $html );
    }
    
    public function embed_id ( $url ) {
        
        if (strpos($url, 'youtube') > 0) {
            $player_url = 'https://www.youtube.com/embed/';
            if( preg_match("#(?<=v=)[a-zA-Z0-9-]+(?=&)|(?<=v\/)[^&\n]+(?=\?)|(?<=v=)[^&\n]+|(?<=youtu.be/)[^&\n]+#", $url, $matches)) {
                return $player_url.$matches[0];
            }
            return '';
        } elseif (strpos($url, 'vimeo') > 0) {
            $player_url = 'https://player.vimeo.com/video/';
            if ( preg_match( '%^https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)(?:[?]?.*)$%im', $url, $regs ) ) {
                return $player_url.$regs[ 3 ];
            }
            return '';
        } else {
            return 'unknown';
        }

    }
    
    public function hex_to_rgb ( $hex ) {
        return sscanf( $hex, "#%02x%02x%02x" );
    }
    
    public function prefix ( $arr, $prefix ) {
        return array_map(
            function ( $element ) use ( $prefix ) { return $prefix . $element; },
            $arr
        );
    }
    
    public function flatten ( $arr ) {
        $res = [];
        foreach ( $arr as $value ) {
            if ( is_array( $value ) ) {
                $res = array_merge( $res, $value );
            } else {
                $res []= $value;
            }
        }
        return $res;
    }
    
    public function is_asset ( $x ) {
        return is_a( $x, 'Craft\AssetFileModel' );
    }
    
}
