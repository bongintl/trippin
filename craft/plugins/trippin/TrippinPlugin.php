<?php
namespace Craft;

class TrippinPlugin extends BasePlugin
{
	public function getName()
	{
		 return Craft::t('Trippin');
	}
	
	public function getVersion()
	{
		return '1.0.0';
	}

	public function getDeveloper()
	{
		return 'BONG';
	}

	public function getDeveloperUrl()
	{
		return 'http://bong.international';
	}

	public function addTwigExtension()
    {
        Craft::import('plugins.trippin.twigextensions.TrippinTwigExtension');
        return new TrippinTwigExtension();
    }
}