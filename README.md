SuperLocal
==========

A tiny Javascript library that makes HTML5 LocalStorage more useful!

Author: Benjamin Allison

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
