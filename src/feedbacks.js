'use strict'

const { combineRgb } = require('@companion-module/base')

module.exports = function updateFeedbacks(self) {
	const deviceChoices = self.devices.map((d) => ({ id: d._id, label: d.deviceName }))
	const playlistChoices = self.playlists.map((p) => ({ id: p._id, label: p.name }))
	const assetChoices = self.assets.map((a) => ({ id: a._id, label: a.filename }))

	self.setFeedbackDefinitions({
		screen_shows_playlist: {
			type: 'boolean',
			name: 'Screen is Showing Playlist',
			description: 'Active when the selected screen is currently displaying the selected playlist',
			defaultStyle: {
				bgcolor: combineRgb(0, 150, 0),
				color: combineRgb(255, 255, 255),
			},
			showInvert: true,
			options: [
				{
					id: 'device_id',
					type: 'dropdown',
					label: 'Screen',
					choices: deviceChoices,
					default: deviceChoices[0]?.id ?? '',
					allowCustom: true,
				},
				{
					id: 'playlist_id',
					type: 'dropdown',
					label: 'Playlist',
					choices: playlistChoices,
					default: playlistChoices[0]?.id ?? '',
					allowCustom: true,
				},
			],
			callback: (feedback) => {
				const device = self.devices.find((d) => d._id === feedback.options.device_id)
				if (!device) return false
				return device.currentType === 'PLAYLIST' && device.currentPlaylistId === feedback.options.playlist_id
			},
		},

		screen_shows_asset: {
			type: 'boolean',
			name: 'Screen is Showing Asset/File',
			description: 'Active when the selected screen is currently displaying the selected asset',
			defaultStyle: {
				bgcolor: combineRgb(0, 100, 200),
				color: combineRgb(255, 255, 255),
			},
			showInvert: true,
			options: [
				{
					id: 'device_id',
					type: 'dropdown',
					label: 'Screen',
					choices: deviceChoices,
					default: deviceChoices[0]?.id ?? '',
					allowCustom: true,
				},
				{
					id: 'asset_id',
					type: 'dropdown',
					label: 'Asset / File',
					choices: assetChoices,
					default: assetChoices[0]?.id ?? '',
					allowCustom: true,
				},
			],
			callback: (feedback) => {
				const device = self.devices.find((d) => d._id === feedback.options.device_id)
				if (!device) return false
				return device.currentType === 'ASSET' && device.currentAssetId === feedback.options.asset_id
			},
		},
	})
}
