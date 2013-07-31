var StatusShort = {
    CRITICAL: 'CRIT',
    WARNING: 'WARN',
    UNKNOWN : 'UNK',
    PENDING: 'PEND',
    OK: 'OK',
    UP: 'UP'
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
        var overview = data.tac.tac_overview

        var totalhosts = overview.total_hosts;
        jQuery('#totalsHosts table td.ok').html(overview.hosts_up + '/' + totalhosts);
        jQuery('#totalsHosts table td.cri').html(overview.hosts_down + '/' + totalhosts);
        jQuery('#totalsHosts table td.unr').html(overview.hosts_unreachable + '/' + totalhosts);
        jQuery('#totalsHosts table td.pend').html(overview.hosts_pending + '/' + totalhosts);
        
        var totalservices = overview.total_services;
        jQuery('#totalsServices table td.ok').html(overview.services_ok + '/' + totalservices);
        jQuery('#totalsServices table td.warn').html(overview.services_warning + '/' + totalservices);
        jQuery('#totalsServices table td.unkn').html(overview.services_unknown + '/' + totalservices);
        jQuery('#totalsServices table td.cri').html(overview.services_critical + '/' + totalservices);
        jQuery('#totalsServices table td.pend').html(overview.services_pending + '/' + totalservices);
        
        var allok = totalhosts == overview.hosts_up && totalservices == overview.services_ok;
        jQuery('#all-ok').show(allok);
        jQuery('#tableOverview').show(!allok);
        if (!allok) {
            
        }
    }

    if (demo) {processResult(tacresponse)} else
    jQuery.getJSON(url + 'tac.cgi?jsonoutput', processResult);
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