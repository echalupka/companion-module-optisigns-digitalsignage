'use strict'

const { InstanceBase, InstanceStatus, runEntrypoint } = require('@companion-module/base')
const { graphqlRequest, extractEdges, GET_DEVICES, GET_PLAYLISTS, GET_ASSETS } = require('./api')
const updateActions = require('./actions')
const updateFeedbacks = require('./feedbacks')
const updateVariableDefinitions = require('./variables')
const { updateVariableValues } = require('./variables')
const UpgradeScripts = require('./upgrades')

class OptiSignsInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		// Local cache of data from OptiSigns
		this.devices = []
		this.playlists = []
		this.assets = []

		this._pollTimer = null
	}

	// ─── Lifecycle ────────────────────────────────────────────────────────────

	async init(config) {
		this.config = config
		this.updateStatus(InstanceStatus.Connecting)

		if (!this.config.api_key) {
			this.updateStatus(InstanceStatus.BadConfig, 'API key is required')
			return
		}

		await this.refreshData()
		this._startPolling()
	}

	async destroy() {
		this._stopPolling()
	}

	async configUpdated(config) {
		this._stopPolling()
		this.config = config

		if (!this.config.api_key) {
			this.updateStatus(InstanceStatus.BadConfig, 'API key is required')
			return
		}

		this.updateStatus(InstanceStatus.Connecting)
		await this.refreshData()
		this._startPolling()
	}

	getConfigFields() {
		return [
			{
				id: 'api_key',
				type: 'textinput',
				label: 'API Key',
				tooltip: 'Generate at app.optisigns.com → Settings → API Keys',
				width: 12,
			},
			{
				id: 'poll_interval',
				type: 'number',
				label: 'Poll Interval (seconds)',
				tooltip: 'How often to refresh screens, playlists, and assets from OptiSigns. Set to 0 to disable polling.',
				default: 300,
				min: 0,
				max: 3600,
				width: 4,
			},
		]
	}

	// ─── Data Refresh ─────────────────────────────────────────────────────────

	async refreshData() {
		let newDevices, newPlaylists, newAssets

		try {
			const [devicesData, playlistsData, assetsData] = await Promise.all([
				graphqlRequest(this.config.api_key, GET_DEVICES),
				graphqlRequest(this.config.api_key, GET_PLAYLISTS),
				graphqlRequest(this.config.api_key, GET_ASSETS),
			])

			newDevices = extractEdges(devicesData?.devices)
			newPlaylists = extractEdges(playlistsData?.playlists)
			newAssets = extractEdges(assetsData?.assets)

			this.log('debug', `Loaded ${newDevices.length} screens, ${newPlaylists.length} playlists, ${newAssets.length} assets`)
			this.updateStatus(InstanceStatus.Ok)
		} catch (err) {
			this.log('error', `Failed to fetch data from OptiSigns: ${err.message}`)
			this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
			return
		}

		// Only rebuild action/feedback definitions if the lists changed —
		// rebuilding wipes existing feedback instances from buttons.
		const listsChanged =
			_listSignature(newDevices) !== _listSignature(this.devices) ||
			_listSignature(newPlaylists) !== _listSignature(this.playlists) ||
			_listSignature(newAssets) !== _listSignature(this.assets)

		this.devices = newDevices
		this.playlists = newPlaylists
		this.assets = newAssets

		if (listsChanged) {
			this.updateActions()
			this.updateFeedbacks()
			this.updateVariableDefinitions()
		}

		// Always update variable values and re-evaluate feedbacks
		this.updateVariables()
		this.checkFeedbacks()
	}

	// ─── Helpers called by actions/feedbacks ──────────────────────────────────

	updateActions() {
		updateActions(this)
	}

	updateFeedbacks() {
		updateFeedbacks(this)
	}

	updateVariableDefinitions() {
		updateVariableDefinitions(this)
	}

	updateVariables() {
		updateVariableValues(this)
	}

	// ─── Polling ──────────────────────────────────────────────────────────────

	_startPolling() {
		this._stopPolling()
		const intervalMs = (this.config.poll_interval ?? 300) * 1000
		if (intervalMs === 0) return
		this._pollTimer = setInterval(() => {
			this.refreshData().catch((err) => this.log('error', `Poll error: ${err.message}`))
		}, intervalMs)
	}

	_stopPolling() {
		if (this._pollTimer) {
			clearInterval(this._pollTimer)
			this._pollTimer = null
		}
	}
}

// Returns a string that changes only when the set of IDs/names in a list changes.
// Used to avoid rebuilding action/feedback definitions on every poll.
function _listSignature(list) {
	return list.map((item) => item._id).sort().join(',')
}

runEntrypoint(OptiSignsInstance, UpgradeScripts)
