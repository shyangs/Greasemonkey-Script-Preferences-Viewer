'use strict';
/* "Greasemonkey Script Preferences Viewer" is licensed under the MIT license. See the LICENSE file. */

let tabs = require('sdk/tabs');
let sp = require('sdk/simple-prefs');
let self = require('sdk/self');
let utils = require('sdk/window/utils');

let tableData = function(){
	let gm = {};
	let activeBrowserWindow = utils.getMostRecentBrowserWindow();
	let alert = activeBrowserWindow.alert;
	let { Cu } = require('chrome');
	try{
		Cu.import('chrome://greasemonkey-modules/content/util.js', gm);
	}catch(err){
		if(err.name==='NS_ERROR_FILE_NOT_FOUND')alert('ERROR: Greasemonkey is not enabled, or its version is lower than 3.3!');
		throw err;
	}

	let arr = [];
	let scripts = gm.GM_util.getService().config.scripts;
	let htmlentities = require('./data/thirdparty/html');
	let index = 0;

	for(let ii = 0, mm = scripts.length; ii<mm; ii++){
		let script = scripts[ii];
		let gmsVals = gm.GM_util.getService().handleScriptValMsg({
			data: {
				scriptId: script.id
			},
			name: 'greasemonkey:scriptVal-list'
		});

		for(let jj = 0, len = gmsVals.length; jj<len; jj++){
			let value = gm.GM_util.getService().handleScriptValMsg({
				data: {
					scriptId: script.id,
					name: gmsVals[jj]
				},
				name: 'greasemonkey:scriptVal-get'
			});

			arr.push({
				"id": index++,
				"name": htmlentities.escape(script.name),
				"key": htmlentities.escape(gmsVals[jj]),
				"value": htmlentities.escape(value),
				"title-name": script.name,
				"title-value": value
			});
		}
	}

	return arr;
};

let openOptionsTab = function(){
	tabs.open({
		url: self.data.url('options.html'),
		onReady: function(tab){
			let worker = tab.attach({
				contentScriptFile: [
					//cdnjs.cloudflare.com/ajax/libs/list.js/1.2.0/list.min.js
					self.data.url('thirdparty/list.min.js'),
					self.data.url('options.js')
				]
			});

			worker.port.on('eRequestTableData', function(){
				worker.port.emit('eResponseTableData', tableData());
			});
			worker.port.on('eCopy', function(str){
				require('sdk/clipboard').set(str);
			});
		}
	});

};

sp.on('GSPV', openOptionsTab);