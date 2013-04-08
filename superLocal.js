/*!
 * SuperLocal: A tiny Javascript library that makes HTML5 LocalStorage more useful!
 * Author: Benjamin Allison

#############################
########### QUE? ############
#############################

Someone who's used to relational databases like MYSQL might find the key/value nature of LocalStorage to be insufficient or hard to use. How do you find the most recent entry? How can I delete the oldest record? What if I run out of space?

superLocal adds some very simply tools that make localStorage a bit more useful. While localStorage is fairly easy to use right out of the box, some of the convenience methods included are sure to be a timesaver for many.

#############################
########## METHODS ##########
#############################

capable()
  - Runs a test to see if localStorage is available in the user's browser. Returns true or false.

save(uID,data,customTime)
	- Saves data, along with associated "created" and "modified" fields.
	- Takes the following parameters:
		- uID: the unique ID you want to save this record as (usually the ID taken from your database)
		- data: the data you want saved (typically a string, integer, or JSON)
		- customTime: typically not needed, but this will let you save with a custom timestamp; useful if you want to make sure the 'modifed' date in localStorage exactly matches a time supplied by the server, for example
			- *IMPORTANT*: this time must be in seconds (standard in PHP). If supplying a Javascript time, divide by 1000.

fetch(param)
	- Collects 'data', 'modified', and 'created' records for the specified record, and returns them in object that you can acces with dot notation; it also adds the 'uID' to the object, also available via dot notation.
	- Takes one parameter: 'param'
		- If you supply an integer, it will fetch based on the unique ID of the record you want to grab (usually the primary key from your database).
		- If you supply a search type, it will use one of the magical find types, and return the data object.
		- There are four serach strings which are shortcuts to the four magic find types (further explained below). The four search strings are: 'newest', 'oldest', 'smallest', and 'biggest'.

remove(uID)
	- Deletes the 'data', 'modified', and 'created' records for the specified ID.
	- Takes the following parameter:
		- uID: the unique ID of the record you want to delete (usually the ID taken from your database)

clearAll()
	- Clears all records from localStorage. Takes no parameters.

In addition to the more standard 'CRUD' type methods, there are also a few convenient find methods:
	- findNewest()
	- findOldest()
	- findSmallest()
	- findBiggest()

They each do what they say! They return the record uID (not the data object), which you can then pass on to the 'fetch' method. These methods take no parameters.

##############################
########## SETTINGS ##########
##############################

superLocal accepts a few custom parameters. You set them on the "superLocal.settings" object, using dot notation.

dbPrefix
	- A string that defines the database prefix you want to use.
	- default: 'db'

dataFieldName:
	- A string that defines the name you want to give to your data column.
	- default: 'data'

separator:
	- A string that defines the separator you want to use between database prefix, record ID, and field names.
	- default: '_'

saveType:
	- A string that defines what 'save' does if localStorage is full
		- 'relaxed': simply gives up if localStorage is full
		- 'greedy': deletes the oldest record (and repeatedly does so) until enough space has been freed up
		- default: 'relaxed'
*/

var superLocal = (function () {
	"use strict";
	var superLocal = {
		settings : {
			dbPrefix:		'db',
			dataFieldName:	'data',
			separator:		'_',
			saveType:		'relaxed'
		},
		// made a function so it's "private"
		prefixRegex : function() {
			return new RegExp(this.settings.dbPrefix,'g');
		},
		// made a function so it's "private"
		createdRegex : function() {
			return new RegExp('created','g');
		},
		// made a function so it's "private"
		modifiedRegex : function() {
			return new RegExp('modified','g');
		},
		// made a function so it's "private"
		datafieldRegex : function() {
			return new RegExp(this.settings.dataFieldName,'g');
		},
		capable : function() {
			var testData = 'ls';
			try {
				localStorage.setItem(testData, testData);
				localStorage.removeItem(testData);
				return true;
			} catch(e) {
				return false;
			}
		},
		findNewest : function() {
			var timestamp = 0;
			var newestRecordID = 0;
			var localKeys = Object.keys(localStorage);
			var totalKeys = localKeys.length;
			for ( var i=0; i<totalKeys; i++ ) {
				if (this.prefixRegex().test(localKeys[i]) && this.modifiedRegex().test(localKeys[i])) {
					var currentKey = localKeys[i].replace(this.settings.dbPrefix + this.settings.separator,'').replace(this.settings.separator + 'modified','');
					var thisModified = localStorage[this.settings.dbPrefix + this.settings.separator + currentKey + this.settings.separator + 'modified'];
					if ( thisModified > timestamp) {
						newestRecordID = currentKey;
						// makes 'timestamp' we're comparing against the current one, for the next comparison to run against
						timestamp = thisModified;
					}
				}
			}
			return newestRecordID;
		},
		findOldest : function() {
			var timestamp = 0;
			var oldestRecordID = 0;
			var localKeys = Object.keys(localStorage);
			var totalKeys = localKeys.length;
			for ( var i=0; i<totalKeys; i++ ) {
				if (this.prefixRegex().test(localKeys[i]) && this.modifiedRegex().test(localKeys[i])) {
					var currentKey = localKeys[i].replace(this.settings.dbPrefix + this.settings.separator,'').replace(this.settings.separator + 'modified','');
					var thisModified = localStorage[this.settings.dbPrefix + this.settings.separator + currentKey + this.settings.separator + 'modified'];
					// have to add '|| 0' because every timestamp will be larger than 0 and nothing will satisfy the if statement!
					if ( thisModified < timestamp || timestamp === 0) {
						oldestRecordID = currentKey;
						// makes 'timestamp' we're comparing against the current one, for the next comparison to run against
						timestamp = thisModified;
					}
				}
			}
			return oldestRecordID;
		},
		findSmallest : function() {
			var dataSize = 0;
			var smallestRecordID = 0;
			var localKeys = Object.keys(localStorage);
			var totalKeys = localKeys.length;
			for ( var i=0; i<totalKeys; i++ ) {
				if (this.prefixRegex().test(localKeys[i]) && this.datafieldRegex().test(localKeys[i])) {
					var currentKey = localKeys[i].replace(this.settings.dbPrefix + this.settings.separator,'').replace(this.settings.separator + 'modified','');
					var thisData = localStorage[this.settings.dbPrefix + this.settings.separator + currentKey + this.settings.separator + this.settings.dataFieldName].length;
					// have to add '|| 0' because every data size will be larger than 0 and nothing will satisfy the if statement!
					if ( thisData < dataSize || dataSize === 0) {
						smallestRecordID = currentKey;
						// makes 'dataSize' we're comparing against the current one, for the next comparison to run against
						dataSize = thisData;
					}
				}
			}
			return smallestRecordID;
		},
		findBiggest : function() {
			var dataSize = 0;
			var biggestRecordID = 0;
			var localKeys = Object.keys(localStorage);
			var totalKeys = localKeys.length;
			for ( var i=0; i<totalKeys; i++ ) {
				if (this.prefixRegex().test(localKeys[i]) && this.datafieldRegex().test(localKeys[i])) {
					var currentKey = localKeys[i].replace(this.settings.dbPrefix + this.settings.separator,'').replace(this.settings.separator + 'modified','');
					var thisData = localStorage[this.settings.dbPrefix + this.settings.separator + currentKey + this.settings.separator + this.settings.dataFieldName].length;
					if ( thisData > dataSize ) {
						biggestRecordID = currentKey;
						// makes 'dataSize' we're comparing against the current one, for the next comparison to run against
						dataSize = thisData;
					}
				}
			}
			return biggestRecordID;
		},
		fetch : function(param) {
			var data = {};
			var uID;
			if (param === 'newest') {
				uID = this.findNewest();
			} else if (param === 'oldest') {
				uID = this.findOldest();
			} else if (param === 'smallest') {
				uID = this.findSmallest();
			} else if (param === 'biggest') {
				uID = this.findBiggest();
			} else if ( isNaN(param) ) {
				uID = param;
			} else {
				return false;
			}
			var recordPrefix = this.settings.dbPrefix + this.settings.separator + uID + this.settings.separator;
			data.uID = uID;
			data[this.settings.dataFieldName] = localStorage[recordPrefix + this.settings.dataFieldName];
			data.created = localStorage[recordPrefix + 'created'];
			data.modified = localStorage[recordPrefix + 'modified'];
			return data;
		},
		remove : function(uID) {
			var recordPrefix = this.settings.dbPrefix + this.settings.separator + uID + this.settings.separator;
			localStorage.removeItem(recordPrefix + this.settings.dataFieldName);
			localStorage.removeItem(recordPrefix + 'created');
			localStorage.removeItem(recordPrefix + 'modified');
		},
		clearAll : function() {
			localStorage.clear();
		},
		listAllCreated : function() {
			var localKeys = Object.keys(localStorage);
			var totalKeys = localKeys.length;
			var allKeys = {};
			for ( var i=0; i<totalKeys; i++ ) {
				if (this.prefixRegex().test(localKeys[i]) && this.createdRegex().test(localKeys[i])) {
					var currentKey = localKeys[i].replace(this.settings.dbPrefix + this.settings.separator,'').replace(this.settings.separator + 'created','');
					allKeys[currentKey] = localStorage[this.settings.dbPrefix + this.settings.separator + currentKey + this.settings.separator + 'created'];
				}
			}
			return allKeys;
		},
		listAllModified : function() {
			var localKeys = Object.keys(localStorage);
			var totalKeys = localKeys.length;
			var allKeys = {};
			for ( var i=0; i<totalKeys; i++ ) {
				if (this.prefixRegex().test(localKeys[i]) && this.modifiedRegex().test(localKeys[i])) {
					var currentKey = localKeys[i].replace(this.settings.dbPrefix + this.settings.separator,'').replace(this.settings.separator + 'modified','');
					allKeys[currentKey] = localStorage[this.settings.dbPrefix + this.settings.separator + currentKey + this.settings.separator + 'modified'];
				}
			}
			return allKeys;
		},
		save : function(uID,data,customTime) {
			if ( this.capable() === true) {
				var timestamp;
				var recordPrefix = this.settings.dbPrefix + this.settings.separator + uID + this.settings.separator;
				// sets timestamp, and sets it to customTime if it's been provided
				if (typeof(customTime)!=='undefined') {
					timestamp = customTime;
				} else {
					timestamp = Math.floor(new Date().getTime()/1000);
				}
				try {
					// attempt to save the record
					localStorage.setItem(recordPrefix + this.settings.dataFieldName, data);
					localStorage.setItem(recordPrefix + 'modified', timestamp);
					// if there's currently no 'created' record for the supplied ID, we know that this is a record, so we'll make the associated 'created' record
					if ( typeof(localStorage[ recordPrefix + 'created' ])==='undefined' ) {
						localStorage.setItem(recordPrefix + 'created', timestamp);
					}
					return true;
				} catch(e) {
					// remove any partially failed data (example, 'modified' might have saved, but 'data' failed)
					this.remove(uID);
					if (this.settings.saveType === 'greedy') {
						// if the save fails, it's likely because localStorage is full
						// we get around this by deleting the oldest record to free space...
						this.remove( this.findOldest() );
						// ...then try the save again!
						this.save(uID,data,customTime);
					}
					return false;
				}
			}
		}
	};
	return superLocal;
}());
