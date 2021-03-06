/*
ShotgunPageParser

Author: D.Potekhin (d@peppers-studio.ru)
Version 0.1
*/

/*
TODO:
- 
*/

(function(){
var taskItems;
var currentTask;
var tasksData;
var currentTaskData;
var assetsItem;
var onParsingComplete;

var sgp = window.sgp = {

	// Page Parsing
	parse: function( _onParsingComplete, useExistingData, shotName ){
		
		console.log('parse', useExistingData );

		if( useExistingData && tasksData && Object.keys( tasksData ).length ){
			console.log('useExistingData: ', tasksData, Object.keys( tasksData ).length );
			if( _onParsingComplete ) _onParsingComplete();
			return;
		}

		taskItems = document.querySelectorAll('.grouped_list_item');
		onParsingComplete = _onParsingComplete;
		tasksData = {};
		currentTask = -1;
		sgp.checkNextTask();

	},

	checkNextTask: function(){
		
		currentTask++;

		// if( currentTask >= taskItems.length || currentTask > 1 ){ // !!!
		if( currentTask >= taskItems.length){
			sgp.parsingCompleted();
			return;
		}

		var taskItem = taskItems[currentTask];
		taskItem.click();
		var taskName = taskItem.querySelectorAll('.link_entity_name')[0].innerText;
		var taskType = taskItem.querySelectorAll('.task_name_box')[0].innerText;
		console.log('taskType:', taskType );
		var taskId = taskName+'--'+taskType;
		tasksData[taskId] = currentTaskData = {
			episode: taskName.split('_')[0],
			taskId: taskId,
			shotgunTaskId: (taskItem.getAttribute('item_id') || '_').split('_')[1],
			name: taskName,
			type: taskType,
			assets: {}
		};
		console.log('task:',currentTask, taskName, currentTaskData);
		sgp.checkTask();
	},

	checkTask: function(){
		var name = document.querySelectorAll('.entity_name .entity_display_name');
		var val = sgp.getTableElement( 'end','[sg_tip="Cut Out"]');
		// console.log('val', val);
		if( !(name && name[0] && name[0].innerText === currentTaskData.name) || val === undefined ){
			// if( !val ){
				setTimeout( sgp.checkTask, 40 );
				return;
			// }
		}

		sgp.getTableElement( 'sequenceName','[sg_tip="Sequence"]');
		sgp.getTableElement( 'start','[sg_tip="Cut In"]');
		sgp.getTableElement( 'description','[sg_tip="Description"]');

		sgp.getAssets();

		//console.log('>>', currentTaskData );

	},

	getTableElement: function( key, selector ){

		var item = document.querySelectorAll(selector);
		// console.log('!!', item );
		if( !item || !item[0] ) return;
		var value = item[0].nextElementSibling.innerText;
		currentTaskData[key] = value;

		return value;

	},

	getAssets: function(){
		console.log('sgp.getAssets');
		assetsItem = document.querySelectorAll('[sg_selector="tab:Assets"]')[0];

		if( !assetsItem || !assetsItem.classList.contains('selected') ){
			// console.log('sgp.getAssets: wrong tab');
			assetsItem.click();
			setTimeout( sgp.getAssets, 40 );
			return;
		}

		var listGroups = document.querySelectorAll('[data-cy="entity-grid"] .group');
		var emptyAssetList = document.querySelectorAll('.grid_empty_state');
		// console.log('sgp.getAssets: listGroups', listGroups );

		if( !listGroups || !listGroups.length ){
			
			if( emptyAssetList.length ){
				console.log('sgp.getAssets: empty assets list');
				
				var isPageReady = document.querySelectorAll('.embedded');
				if( !isPageReady.length ){
					console.log('sgp.getAssets: wait for ready');
					setTimeout( sgp.getAssets, 40 );
					return;
				}

				setTimeout( sgp.checkNextTask, 400 );
				return;
			}

			console.log('sgp.getAssets: not assets found');
			setTimeout( sgp.getAssets, 40 );
			return;
		}

		listGroups.forEach(function( listGroup ){

			var groupItem = listGroup.querySelectorAll('.group_title')[0];
			var groupName = groupItem.innerText;
			if( !groupItem || !groupName ){
				console.log('Group checking failed');
				return;
			}
			var groupData = currentTaskData.assets[groupName] = {};

			// get Assets
			var items = listGroup.querySelectorAll('.group_contents .row');

			items.forEach(function( rowItem ){
				var itemName = rowItem.querySelectorAll('[sg_selector="field:code"]')[0].innerText;
				groupData[itemName] = {
					type: rowItem.querySelectorAll('[sg_selector="field:sg_asset_type"]')[0].innerText
				}
			});
			console.log('groupItem:',groupName, groupData );
			
		});

		sgp.checkNextTask();

	},

	//
	parsingCompleted: function(){
		console.log('COMPLETE: ', tasksData );
		if( onParsingComplete ) onParsingComplete();
	},

	/// Utils
	copyTextToClipboard: function(text) {
	  var textArea = document.createElement("textarea");
	  var st = textArea.style ='position:fixed;top;left;width:2em;height:2em;background:transparent';
	  textArea.value = text;
	  document.body.appendChild(textArea);
	  textArea.focus();
	  textArea.select();
	  try {
	    var successful = document.execCommand('copy');
	    // var msg = successful ? 'successful' : 'unsuccessful';
	    // console.log('Copying text command was ' + msg);
	  } catch (err) {
	    // console.log('Oops, unable to copy');
	  }
	  document.body.removeChild(textArea);
	},

	/// Public generators
	generateBatAddShots: function( useExistingData, shotName ){
		sgp.parse( function(){

			//console.log('getCreateBat', tasksData );
			var output = '';
			Object.keys(tasksData).forEach(function(shotName, i){
				var ad = tasksData[shotName];
				if( i!== 0 ) output += ' && ';
				output += 'shot-from-remote.bat '+ad.name;
				
				// assets
				var assetsParams=[];
				Object.keys(ad.assets).forEach(function(assetGroupName){
					Object.keys(ad.assets[assetGroupName]).forEach(function(assetName){
						assetsParams.push( assetGroupName+'\\'+assetName );
					});
				});
				if( assetsParams.length ) output+=' "'+assetsParams.join(';')+'"'
			});
			console.log( 'ADD SHOTS BAT FILE:\n'+output);
			sgp.copyTextToClipboard(output);
		}, useExistingData, shotName );
	},

	//
	generateTableTasks: function( useExistingData, shotName ){
		sgp.parse( function(){
			var output = '';
			Object.keys(tasksData).forEach(function(shotName, i){
				var ad = tasksData[shotName];
				output += ad.type+'\t';// task type
				output += ad.name+'\t';// shot name
				output += 'https://smf.shotgunstudio.com/my_tasks?task_id='+ad.shotgunTaskId+'\t';// Shotgun task url
				output += 'X:\\KRUTIKSY\\3_anim\\'+ad.episode+'\\'+ad.sequenceName+'\\'+ad.name+'\t';// shot local path
				output += '\t'; // redmine task
				output += (ad.end-ad.start+1)+'\t'; // duration
				output += '\t'; // task state
				output += '\t'; // assignee
				output += '\t'; // fact time
				output += ad.description.replace(/(?:\r\n|\r|\n)/g, '')+'\t'; // description
				output+='\n';
			});
			console.log( 'Tasks:\n'+output);
			sgp.copyTextToClipboard(output);
		}, useExistingData, shotName );
	}

}
})();


// sgp.generateTableTasks();