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
    jQuery.getJSON(url + '?style=hostdetail&jsonoutput=1', processResult);
}