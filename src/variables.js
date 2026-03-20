'use strict'

module.exports = function updateVariableDefinitions(self) {
	const definitions = [
		{ variableId: 'device_count', name: 'Number of Screens' },
		{ variableId: 'playlist_count', name: 'Number of Playlists' },
		{ variableId: 'asset_count', name: 'Number of Assets' },
	]

	// One set of variables per screen, keyed by sanitized device name
	for (const device of self.devices) {
		const key = sanitizeKey(device.deviceName)
		definitions.push(
			{ variableId: `screen_${key}_content_type`, name: `${device.deviceName}: Current Content Type` },
			{ variableId: `screen_${key}_content_name`, name: `${device.deviceName}: Current Content Name` },
		)
	}

	self.setVariableDefinitions(definitions)
}

// Called whenever local state changes — pushes current values to Companion
function updateVariableValues(self) {
	const values = {
		device_count: self.devices.length,
		playlist_count: self.playlists.length,
		asset_count: self.assets.length,
	}

	for (const device of self.devices) {
		const key = sanitizeKey(device.deviceName)

		let contentType = device.currentType ?? 'NONE'
		let contentName = ''

		if (device.currentType === 'PLAYLIST') {
			const playlist = self.playlists.find((p) => p._id === device.currentPlaylistId)
			contentName = playlist?.name ?? device.currentPlaylistId ?? ''
		} else if (device.currentType === 'ASSET') {
			const asset = self.assets.find((a) => a._id === device.currentAssetId)
			contentName = asset?.filename ?? device.currentAssetId ?? ''
		}

		values[`screen_${key}_content_type`] = contentType
		values[`screen_${key}_content_name`] = contentName
	}

	self.setVariableValues(values)
}

// Replace characters that aren't valid in variable IDs with underscores
function sanitizeKey(name) {
	return name.toLowerCase().replace(/[^a-z0-9_]/g, '_')
}

module.exports.updateVariableValues = updateVariableValues
