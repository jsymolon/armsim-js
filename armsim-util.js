/**
 * @fileoverview Client side utils for the ARMSim
 */


 /**
 * Retrieves the list of available files from the server.js
 * @param 
 * @return
 */
function loadfilelist() {
	$.get("http://localhost:3000/get_list", "", loadlist_callback);
}

 /**
 * Retrieves the list of available files from the server.js
 * @param 
 * @return
 */
function loadlist_callback() {

}