var groupByAttr = function(data, attr) {
	var groups = {}
	jQuery.each(data, function(i,e) {
		group = e[attr];
		if (!(group in groups)) groups[group] = [];
		groups[group].push(e);
		});
	return groups;
}

var QueryHosts = function() {
    var processResult = function(data) {
	var html = '';
        var template = '<tr>\
                        <td class="hs">{HOSTNAME}</td>\
                        <td>{STATUS}</td>\
                       </tr>\n';
	
	jQuery.each(data.status.host_status, function(index, elem) {
            html += template.
                replace('{HOSTNAME}', elem.host_display_name).
                replace('{STATUS}', elem.status);
	});

	jQuery('tbody#hosts').html(html);
    }

    if (demo) {processResult(hostresponse)} else
    jQuery.getJSON(url + '?style=hostdetail&jsonoutput', processResult);
}

var QueryServices = function() {
    var processResult = function(data) {
	var html = '';
        var template = '<tr>\
                        <td class="hs">{HOSTNAME}</td>\
                        <td class="srv">{SERVNAME}</td>\
                        <td>{STATUS}</td>\
                       </tr>\n\
                       <tr>\
                        <td></td>\
                        <td colspan="2">{LASTCHECK}</td>\
                       </tr>\
                       <tr>\
                        <td></td>\
                        <td colspan="2">{INFO}</td>\
                       </tr>\
                       ';
	var prevhost = '';
	jQuery.each(data.status.service_status, function(index, elem) {
            html += template.
                replace('{HOSTNAME}', prevhost == elem.host_display_name ? '' : elem.host_display_name).
                replace('{SERVNAME}', elem.service_display_name).
                replace('{LASTCHECK}', elem.last_check).
                replace('{INFO}', elem.status_information).
                replace('{STATUS}', elem.status);
            prevhost = elem.host_display_name;
	});

	jQuery('tbody#services').html(html);
    }

    if (demo) {processResult(response)} else
    jQuery.getJSON(url + '?style=servicedetail&jsonoutput', processResult);
}