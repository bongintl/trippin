<?php
namespace Craft;

class MapUtilsPlugin extends BasePlugin
{
	public function getName()
	{
		 return Craft::t('Map Utils');
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
}