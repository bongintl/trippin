<?php

namespace Craft;

class SeoVariable
{

	public function custom (
		$title = '',
		$description = '',
		$includeTitleSuffix = true,
		$social = []
	) {
		$text = [
			'title' => $title ? $title . ($includeTitleSuffix ? ' ' . craft()->seo->settings()->titleSuffix : '') : '',
			'description' => $description ?: '',
		];

		$ret = $text;
		$ret['social'] = SeoFieldType::$defaultValue['social'];

		foreach ($social as $key => $value)
		{
			$ret['social'][$key] = array_merge(
				$ret['social'][$key],
				$value
			);
		}

		return $ret;
	}

	// Social
	// =========================================================================

	/**
	 * Gets social values with fallbacks
	 *
	 * @param $value
	 *
	 * @return array
	 */
	public function social ($value)
	{
		$social = [];

		if (!array_key_exists('social', $value)) {
			return SeoFieldType::$defaultValue['social'];
		}

		foreach ($value['social'] as $name => $v) {
			$social[$name] = [
				'title' => $v['title'] ?: $value['title'],
				'image' => $v['image'],
				'description' => $v['description'] ?: $value['description'],
			];
		}

		return $social;
	}

	// Social: Images
	// -------------------------------------------------------------------------

	/**
	 * @param AssetFileModel|null $image
	 *
	 * @return string
	 */
	public function twitterImage ($image)
	{
		return $this->_socialImage($image, [
			'width'  => 1200,
			'height' => 675,
		]);
	}

	/**
	 * @param AssetFileModel|null $image
	 *
	 * @return string
	 */
	public function facebookImage ($image)
	{
		return $this->_socialImage($image, [
			'width'  => 1200,
			'height' => 600,
		]);
	}

	/**
	 * @param AssetFileModel|null $image
	 * @param array               $transform
	 *
	 * @return string
	 */
	private function _socialImage ($image, array $transform)
	{
		if (!$image) return '';

		$transformUrl = $image->getUrl($transform);

		if (strpos($transformUrl, 'http') === false)
			$transformUrl = UrlHelper::getSiteUrl($transformUrl);

		return $transformUrl;
	}

}