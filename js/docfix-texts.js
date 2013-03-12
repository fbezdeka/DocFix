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


var docfix = docfix || {};
/**
 * This function is fired when DOM is ready to be
 * manipulated by JavaScript.
 */
$(function () {
	'use strict';
	
	/**
	 * Some textual constants
	 */
	docfix.texts = {
		warning: {
			historySupportMissing: '<strong>Warning:</strong> Your browser has no history support enabled. \
				Using your browsers forward or back button may not work as expected.'
		}
	};

});