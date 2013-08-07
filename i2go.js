var StatusShort = {
    CRITICAL: 'CRIT',
    WARNING: 'WARN',
    UNKNOWN : 'UNK',
    PENDING: 'PEND',
    OK: 'OK',
    UP: 'UP',
    DOWN: 'DOWN'
}

var groupByAttr = function(data, attr) {
	var groups = {}
	jQuery.each(data, function(i,e) {
		group = e[attr];
		if (!(group in groups)) groups[group] = [];
		groups[group].push(e);
		});
	return groups;
}

var QueryOverview = function () {
    var processResult = function(data) {
        var totalhosts = data.status.host_status.length;
	var hosterrors = '';
	var hostscount = {UP:0,DOWN:0,PENDING:0,UNREACHABLE:0};
	for (h in data.status.host_status) {
	    var host = data.status.host_status[h];
	    hostscount[host.status] += 1;
	    if (host.status != "UP") {
		hosterrors += '<tr><td>' + host.host_display_name + '</td><td class="' + host.status + '">' + host.status + '</td></tr>';
	    }
	}
	
        jQuery('#totalsHosts table td.ok').html(hostscount.UP + '/' + totalhosts);
        jQuery('#totalsHosts table td.cri').html(hostscount.DOWN + '/' + totalhosts);
        jQuery('#totalsHosts table td.unr').html(hostscount.UNREACHABLE + '/' + totalhosts);
        jQuery('#totalsHosts table td.pend').html(hostscount.PENDING + '/' + totalhosts);
        
        var totalservices = data.status.service_status.length;
	var serviceserrors = '';
	var servicescount = {OK:0,WARNING:0,UNKNOWN:0,CRITICAL:0,PENDING:0};
	var lasthost = '';
	for (s in data.status.service_status) {
	    var service = data.status.service_status[s];
	    servicescount[service.status] += 1;
	    if (service.status != 'OK') {
		serviceserrors += '<tr>';
		if (lasthost != service.host_name) {
		    serviceserrors += '<td>' + service.host_display_name + '</td>';
		    lasthost = service.host_name;
		} else serviceserrors += '<td/>'
		serviceserrors += '<td class="' + StatusShort[service.status] + '">' + service.service_display_name + '</td></tr>';
	    }
	}

        jQuery('#totalsServices table td.ok').html(servicescount.OK + '/' + totalservices);
        jQuery('#totalsServices table td.warn').html(servicescount.WARNING + '/' + totalservices);
        jQuery('#totalsServices table td.unkn').html(servicescount.UNKNOWN + '/' + totalservices);
        jQuery('#totalsServices table td.cri').html(servicescount.CRITICAL + '/' + totalservices);
        jQuery('#totalsServices table td.pend').html(servicescount.PENDING + '/' + totalservices);
        
        var allok = totalhosts == hostscount.UP && totalservices == servicescount.OK;
        jQuery('#all-ok').toggle(allok);
        var table = jQuery('#tableOverview').toggle(!allok);
        if (!allok) {
	    var html = '';
	    if (hosterrors != '') {
		html += '<h3>Host errors</h3>';
		html += '<table id="tableHosts">'+hosterrors+'</table>';
	    }
            
	    if (serviceserrors != '') {
		html += '<h3>Service errors</h3>';
		html += '<table id="tableServices">' + serviceserrors + '</table>';
	    }
	    
	    table.html(html);
        }
    }

    if (demo) {processResult(completeresponse)} else
    jQuery.getJSON(url + 'status.cgi?host=all&style=hostservicedetail&jsonoutput', processResult);
}

var QueryHosts = function() {
    var processResult = function(data) {
	var html = '';
        var template = '<tr class="{STATUSSHORT}">\
                        <td class="hs">{HOSTNAME}</td>\
                        <td>{STATUS}</td>\
                       </tr>\n';
	
	jQuery.each(data.status.host_status, function(index, elem) {
            html += template.
                replace('{HOSTNAME}', elem.host_display_name).
                replace('{STATUS}', elem.status).
                replace('{STATUSSHORT}', StatusShort[elem.status]);
	});

	jQuery('tbody#hosts').html(html);
    }

    if (demo) {processResult(hostresponse)} else
    jQuery.getJSON(url + 'status.cgi?style=hostdetail&jsonoutput', processResult);
}

var QueryServices = function() {
    var processResult = function(data) {
	var html = '';
        var template = '<tr class="{STATUSSHORT}">\
                        <td>{HOSTNAME}</td>\
                        <td class="srv">{SERVNAME}</td>\
                        <td class="tdss">{STATUS}</td>\
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
                replace('{STATUS}', elem.status).
                replace('{STATUSSHORT}', StatusShort[elem.status]);
            prevhost = elem.host_display_name;
	});

	jQuery('tbody#services').html(html);
    }

    if (demo) {processResult(response)} else
    jQuery.getJSON(url + 'status.cgi?style=servicedetail&jsonoutput', processResult);
}