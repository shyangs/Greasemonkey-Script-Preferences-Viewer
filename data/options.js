'use strict';
/* "Greasemonkey Script Preferences Viewer" is licensed under the MIT license. See the LICENSE file. */

let gEl = function(id){
	return document.getElementById(id);
};

self.port.emit('eRequestTableData');
self.port.on('eResponseTableData', function(tableData){
	let hackerList = new List('hacker-list', {
			valueNames: ['name', 'key', 'value', { name: 'title-name', attr: 'title' }, { name: 'title-value', attr: 'title' }, { data: ['id'] }], 
			item: 'hacker-item',
			listClass: 'list-container',
			page: 9007199254740992
		},
		tableData
	);
	gEl('hacker-list').addEventListener('click', function(event){
		let elmt = event.target;
		if(elmt.className.indexOf('fa-copy') !== -1){
			let index = elmt.closest('tr').getAttribute('data-id')|0;
			self.port.emit('eCopy', tableData[index].key+';'+tableData[index]['title-value']);
		}
	}, false);

});