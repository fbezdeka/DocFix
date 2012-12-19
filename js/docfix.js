
/**
 * DocFix, a javascript based documentation generator
 * https://github.com/Flonix/DocFix
 *
 * Copyright (C) 2012 Florian Bezdeka

 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.

 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.

 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 **/

/**
 * @fileOverview Documentation loading and indexing
 *
 * @author Florian Bezdeka
 */

/**
 * Use a new empty object as doc namespace if it was not
 * defined yet, otherwise use the existing doc object.
 *
 * @namespace docfix namespace
 */
var docfix = docfix || {};

/**
 * This function is fired when DOM is ready to be
 * manipulated by JavaScript.
 */
$(function () {
	'use strict';
	
	/**
	 * Indicates if the doc application has already been initialized;
	 */
	docfix.initialized = false;
	
	/**
	 * The docfix version
	 */
	docfix.versionInfo = {
		patch : 0,
		minor : 0,
		major : 1
	};
	
	docfix.version = docfix.versionInfo.major + "." + docfix.versionInfo.minor + "." + docfix.versionInfo.patch;
	
	/**
	 * The main method. Run it on body load.
	 * 
	 * @param start The number were to start numeration of headers. Default is 0.
	 */
	docfix.run = function(start) {
		
		if(docfix.initialized === false) {
			docfix.createFileArray();
			
			if(start) {
				docfix.generateTableOfContents(start);
			} else {
				docfix.generateTableOfContents(0);
			}

			// Create the nav bar and TOC
			var $toc = $('<ul class="summary"></ul>');

			for(var file = 0; file < docfix.contentArray.length; file++) {

				var currentFile = docfix.contentArray[file];

				for(var header = 0; header < currentFile.headerList.length; header++) {

					var currentHeader = docfix.contentArray[file].headerList[header];

					if(currentHeader.getLayer() === 1) {
						// We found a heading of layer 1
						// Add it to the nav bar
						var nav = $('<li><a class="header-menu">' + currentHeader.getText() + '</a></li>');

						nav.on('click', {file: docfix.contentArray[file], headerID: currentHeader.getHeaderID()}, function(e) {
							e.data.file.search('header-' + e.data.headerID);
							$(this).parent().children().removeClass("active");
							$('#' + docfix.settings.nav).parent().parent().children().removeClass("active");
							$(this).addClass("active");
						});

						nav.css('cursor', 'pointer');

						$('#' + docfix.settings.nav).append(nav);
					}

					var $h = docfix.createLi(currentHeader.getCaption(), currentHeader.getText(), currentHeader.getLayer(), currentHeader.getHeaderID());
					$toc.append($h);
				}

			}

			// Write content of toc
			$('#' + docfix.settings.toc).append($toc);

		}
		
		// Hide the navTags
		$('#' + docfix.settings.navTags).hide();
			
		// Hide the summary div
		$('#' + docfix.settings.summary).parent().hide();

		// Hide the doc content
		$('#' + docfix.settings.content).hide();
		
		// Show table of content
		$('#' + docfix.settings.toc).show();
		
		if(docfix.initialized === true) {
			// Push history
			docfix.pushHistory('Documentation TOC', '');
		}
		
		if(docfix.initialized === false) {
			// Remember application initialisation
			docfix.initialized = true;
		}
		
		// Show version information
		$('#' + docfix.settings.versionInfo).html(docfix.version);
		
	};
	
	/**
	 * Search for an a tag with given id. If a matching tag is found,
	 * the content of the containing document will be loaded. 
	 * Afterwards the window scrolls to the correct location. The found tag will be shown.
	 * @param id The id you want to search for
	 */
	docfix.search = function(id) {
		
		for(var i = 0; i < docfix.settings.files.length; i++) {
			var result = docfix.contentArray[i].search(id);
			
			if(result)
				break;
		}
		
	};
	
	/**
	 * Scroll to the given id with (with nice offset)
	 * @param id The id you want to scroll to
	 */
	docfix.scrollToId = function(id) {
		var new_position = $('#' + id).offset();
		
		$('html, body').animate({
			scrollTop: new_position.top - 110
		}, 700);
	};
	
	/**
	 * The global fileArray. An array of filenames that will be loaded during doc parsing.
	 * Do not modify this array directly. Use settings instead.
	 */
	docfix.fileArray = new Array();
	
	/**
	 * The global contentArray. An array of docfix.ContentFile objects.
	 * Do not modify this array directly. Use settings instead.
	 */
	docfix.contentArray = new Array();
	
	/**
	 * Create a list item used for header representation in TOC or chapter summary.
	 * @param caption The caption / number of the header
	 * @param text The text of the header
	 * @param level The level of the header. 1. = 1; 1.1. = 2; ...
	 * @param headerID This id should be unique to allow header finding inside the hole document.
	 * @returns Returns the created jQuery object.
	 */
	docfix.createLi = function(caption, text, level, headerID) {
		
		var $a = $('<a></a>');
		$a.append('<span class="number">' + caption + ' ' + text + '</span>');
		$a.css('cursor', 'pointer');
		
		var $li = $('<li class="level-' + level + '"></li>');
		$li.append($a);
		
		$a.on('click', function() {
			docfix.search('header-' + headerID);
		});
		
		return $li;
	};
	
	/**
	 * Create the list of files that hold the documentation content
	 */
	docfix.createFileArray = function() {
		
		for(var i = 0; i < docfix.settings.files.length; i++) {
			docfix.fileArray.push(docfix.settings.basePath + docfix.settings.files[i]);
		}

	};
	
	/**
	 * Generate the TOC (Table of contents)
	 * @param start The caption that will be assigned to the first found level 1 header.
	 */
	docfix.generateTableOfContents = function(start) {
		
		var headerID = 0;
		
		for(var i = 0; i < docfix.fileArray.length; i++) {
			docfix.contentArray[i] = new docfix.ContentFile(docfix.fileArray[i], start, headerID);
			docfix.contentArray[i].generateTableOfContents();
			
			start = docfix.contentArray[i].getHighestLevel();
			headerID = docfix.contentArray[i].getHighestHeaderID();
		}
		
	};
	
	/////////////////////////////////////////////////////////////////////////////////////////
	////
	//// The Header object
	////
	/////////////////////////////////////////////////////////////////////////////////////////
	
	
	/**
	 * The Header object.
	 * @param text The text of the header you want to create.
	 * @param layer The layer of the header. Use 1 for 1. or 2 for 1.1.
	 * @param caption The caption of the header, e.g. 1.1.2
	 * @param headerID The global unique header id used for header searching and scrolling.
	 * @returns {docfix.Header}
	 */
	docfix.Header = function(text, layer, caption, headerID) {
		
		this.text = text;
		this.layer = layer;
		this.caption = caption;
		this.headerID = headerID;
	};
	
	/**
	 * Get the assigned header text
	 * @returns The header text
	 */
	docfix.Header.prototype.getText = function() {
		return this.text;
	};
	
	/**
	 * Get the assigned header layer
	 * @returns The header layer
	 */
	docfix.Header.prototype.getLayer = function() {
		return this.layer;
	};
	
	/**
	 * Get the assigned header caption
	 * @returns The header caption
	 */
	docfix.Header.prototype.getCaption = function() {
		return this.caption;
	};
	
	/**
	 * Get the assigned header id
	 * @returns The header id
	 */
	docfix.Header.prototype.getHeaderID = function() {
		return this.headerID;
	};
	
	/////////////////////////////////////////////////////////////////////////////////////////
	////
	//// The NavTag object
	////
	/////////////////////////////////////////////////////////////////////////////////////////
	
	docfix.NavTag = function(text, target) {
		
		this.text = text;
		this.target = target;
	};
	
	docfix.NavTag.prototype.getText = function() {
		
		return this.text;
	};
	
	docfix.NavTag.prototype.getTarget = function() {
		
		return this.target;
	};
	
	
	/////////////////////////////////////////////////////////////////////////////////////////
	////
	//// The ContentFile object
	////
	/////////////////////////////////////////////////////////////////////////////////////////
	
	/**
	 * The ContentFile object.
	 * @param filename The name/path of the content file
	 * @param firstLevel The number that will be assigned to the first top level header
	 * @param startHeaderCount The number that will be assigned as unique header id to the first top level header
	 * @returns {docfix.ContentFile}
	 */
	docfix.ContentFile = function(filename, firstLevel, startHeaderCount) {
		
		this.filename = filename;
		this.isLoaded = false;
		this.prettyPrint = false;
		this.content = null;
		
		this.firstLevel = firstLevel;
		this.secondLevel = 0;
		this.thirdLevel = 0;
		this.forthLevel = 0;
		
		this.firstHeaderID = startHeaderCount;
		this.lastHeaderID = startHeaderCount;
		
		this.headerList = new Array();
		this.navTags = new Array();
	};
	
	/**
	 * Return the highest top level header level
	 * @returns {Number} The highest top level
	 */
	docfix.ContentFile.prototype.getHighestLevel = function() {
		
		return this.firstLevel;
	};
	
	/**
	 * Get the next free unique header id
	 * @returns {Number} The next free unique header id
	 */
	docfix.ContentFile.prototype.getHighestHeaderID = function() {
		
		return this.lastHeaderID;
	};
	
	/**
	 * Add a header to the internal list of assigned headers
	 * @param caption The caption of the header you want to add
	 * @param text The text of the header you want to add
	 * @param level The level of the header you want to add (1.2.2 ==> 3)
	 * @returns {Number}
	 */
	docfix.ContentFile.prototype.addHeader = function (caption, text, level) {
		
		
		this.headerList.push(new docfix.Header(text, level, caption, this.lastHeaderID));
		
		this.lastHeaderID++;
		
		return this.lastHeaderID - 1;
	};
	
	/**
	 * Load the content of the ContentFile instance into memory
	 */
	docfix.ContentFile.prototype.load = function() {
		
		if(this.isLoaded)
			return;
		
		var that = this;
		
		$.ajax({
			url: that.filename,
			success: function(data) {
				that.content = data;
				that.isLoaded = true;
			},
			async: false,
			error: function() {
				// Will be called if an error occurred during loading
				// => Useful for debugging.
			}
		});
		
	};
	
	/**
	 * Draw the content. Display content and generate document / chapter summary.
	 */
	docfix.ContentFile.prototype.display = function() {
		
		// Hide tableOfContents
		$('#' + docfix.settings.toc).hide();
		
		// Generate the summary
		var $summary = $('<ul class="summary"></ul>');
		
		for(var h = 0; h < this.headerList.length; h++) {
			
			var $header = docfix.createLi(this.headerList[h].getCaption(), this.headerList[h].getText(), this.headerList[h].getLayer(), this.headerList[h].getHeaderID());
			$summary.append($header);
		}
		
		$('#' + docfix.settings.summary).html($summary);
		$('#' + docfix.settings.summary).parent().show();
		
		// Show the content
		$('#' + docfix.settings.content).html(this.content);
		$('#' + docfix.settings.content).show();
		
		// Show the navtags (and clear it first)
		$('#' + docfix.settings.navTags).html('');
		
		var that = this;
		
		for(var tag = 0; tag < this.navTags.length; tag++) {
				
			var $li = $('<li></li>');
			var $a = $('<a href="#' + this.navTags[tag].getTarget() + '"><i class="icon-chevron-right"></i>' + this.navTags[tag].getText() + '</a>');
			
			$a.on('click', {value: tag} , function(e) {
				
				e.preventDefault();
				
				if(e.data.value == 0) {
					// Handle goto top button
					docfix.scrollToId(docfix.settings.topId);
				} else {
					// Handle navtags via search algorithm
					docfix.search(that.navTags[e.data.value].getTarget());
					$(this).parent().addClass('active');	
				}
				
			});
			
			$a.css('cursor', 'pointer');
			
			$li.append($a);
			
			$('#' + docfix.settings.navTags).append($li);
		}
		
		$('#' + docfix.settings.navTags).show();
		
		// Call source code plugin
		if(!this.prettyPrint) {
			// Convert content of pre and code blocks back to text

			var pre = $('pre');
			var code = $('code');
			
			$.each(pre, function(){
				$(this).text($(this).html());
			});
			
			$.each(code, function(){
				$(this).text($(this).html());
			});
			
			prettyPrint();
			this.prettyPrint = true;
		}
		
		// Set onclick handler for cross references
		$('.docfix-crossref').on('click', function(e) {
			e.preventDefault();
			docfix.search($(this).attr('href'));
		});
		
		// Update scrollspy
		$('[data-spy="scroll"]').each(function () {
			$(this).scrollspy('refresh');
		});
			
	};
	
	/**
	 * Search for an a tag with given id.
	 * @param id The id you want to search for.
	 * @return True if the given id could be found, false otherwise.
	 */
	docfix.ContentFile.prototype.search = function(id) {
		
		var that = this;
		var result = false;
		
		function searchFunction(k,v) {
			
			var $v = $(v);
			
			if($v.children().length > 0) {
				// Continue recursion
				$.each($v.children(), function(k, v) {
					searchFunction(k, v);
				});
			}
			
			if($v.attr('id') === id) {
				that.display();
				docfix.scrollToId($v.attr('id'));				
				docfix.pushHistory('Documentation', '?' + id);
				result = true;
			}
			
		}
		
		$.each(this.content, function(k, v) {
			
			// Start recursion
			searchFunction(k, v);
		});
		
		return result;
	};
	
	/**
	 * Generate the document / chapter summary (Part of TOC) / navTags
	 */
	docfix.ContentFile.prototype.generateTableOfContents = function() {
		
		var that = this;
		
		if(!this.isLoaded) {
			this.load();
		}
		
		function parseFunction(k, v) {
			
			var $v = $(v);
			var text = $v.text();
			var isHeading = false;
			var caption = "";
			var layer = 0;
			
			if($v.is("pre")) {
				return;
			}
			
			if($v.children().length > 0) {
				// Continue recursion
				$.each($v.children(), function(k, v) {
					parseFunction(k, v);
				});
			}
			
			if($v.is("h2")) {
				that.firstLevel++;
				that.secondLevel = 0;
				that.thirdLevel = 0;
				that.forthLevel = 0;
				caption = that.firstLevel + ". ";
				$v.text(caption + text);
				isHeading = true;
				layer = 1;
			} 
			
			if($v.is("h3")) {
				that.secondLevel++;
				that.thirdLevel = 0;
				that.forthLevel = 0;
				caption = that.firstLevel + "." + that.secondLevel + ". ";
				$v.text(caption + text);
				isHeading = true;
				layer = 2;
			}
			
			if($v.is("h4")) {
				that.thirdLevel++;
				that.forthLevel = 0;
				caption = that.firstLevel + "." + that.secondLevel + "." + that.thirdLevel + ". ";
				$v.text(caption + text);
				isHeading = true;
				layer = 3;
			}
			
			if($v.is("h5")) {
				that.forthLevel++;
				caption = that.firstLevel + "." + that.secondLevel + "." + that.thirdLevel + "." + that.forthLevel + ". ";
				$v.text(caption + text);
				isHeading = true;
				layer = 4;
			}
			
			if($v.is("a") && $v.attr('class') === 'docfix-navtag') {
				// We found a navi tag
				// => Add it to the list of navi tags
				
				if(that.navTags.length == 0) {
					// We are going to add the first navtag
					// => Insert "goto top" navtag first
					
					// Create top link in navTags
					that.navTags.push(new docfix.NavTag(docfix.settings.topText, docfix.settings.topId));
				}
				
				that.navTags.push(new docfix.NavTag($v.text(), $v.attr('id')));
			}
				
			if(isHeading) {
				var assignedID = $v.attr('id');
				
				if(assignedID) {
					// An id attribute was already assigned
					// => Do not override it
					that.addHeader(caption, text, layer);
				} else {
					// There was no id attribute defined
					// => Assign auto generated id
					var headerID = that.addHeader(caption, text, layer);
					$v.attr('id', 'header-' + headerID);
				}
				
			}
			
		};
		
		var $content = $(this.content);
		
		$.each($content, function(k, v) {
			
			// Start recursion
			parseFunction(k, v);
		});
		
		this.content = $content;
	};
	
	/////////////////////////////////////////////////////////////////////////////////////////
	////
	//// History support
	////
	/////////////////////////////////////////////////////////////////////////////////////////
	
	/**
	 * Push to history API
	 * 
	 * @param title The title you want to assign
	 * @param url The url you want to push
	 */
	docfix.pushHistory = function (title, url) {
		
		History.pushState(null, title, url);
	};
	
	/**
	 * Restore from history API
	 * @param url The url you want to load
	 */
	docfix.restoreHistory = function(url) {
			
		docfix.search(url);
	};
	
	var applicationStart = true;
	
	// Prepare
	var History = window.History; // Note: We are using a capital H instead of a lower h
	if ( !History.enabled ) {
		// History.js is disabled for this browser.
		// This is because we can optionally choose to support HTML4 browsers or not.
		return false;
	}

	// Bind to StateChange Event
	History.Adapter.bind(window, 'statechange', function(){ // Note: We are using statechange instead of popstate
		
		var state = History.getState(); // Note: We are using History.getState() instead of event.state
		
		if (state.internal === true) {
			// no need for pushstate caused changes
			return;
		}
		
		var uri = state.url;
		var split = uri.split('?');
		
		if(split.length > 1) {
			docfix.restoreHistory(split[1]);
		} else {
			docfix.run();
		}
		
	});

	if(applicationStart) {
	
		var uri = decodeURIComponent($(location).attr('href').replace(/\/$/, ''));
		var split = uri.split('?');
		
		docfix.run();
		
		if(split.length > 1) {	
			docfix.restoreHistory(split[1]);
		}
		
		applicationStart = false;
	}

});
