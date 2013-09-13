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

function sendCommand(command, hostname, servicename, src) {
  var resetSrc = function() {};
  if (src != null) {
    src = jQuery(src);
    src.after('<img class="command" src="css/images/ajax-loader.gif" width="14" height="14"/>').hide();
    resetSrc = function() {
      src.show();
      src.nextAll("img").remove();
    }
  }

  // basic variables
  hostname = hostname.toLowerCase();
  cmds = {'ack': 33, 'reschedule': 96};
  cmd_url = url + 'cmd.cgi';
  service_query = '';

  // run command for service not for host
  if ( servicename != undefined ) {
    cmds = {'ack': 34, 'reschedule': 7};
    servicename = servicename.replace(/ /, "+");
    service_query = '&service='+servicename;
  }

  // Acknowledge host or service problem
  if ( command == 'ack' ) {
    window.location.href = (cmd_url+'?cmd_typ='+cmds[command]+'&host='+hostname+service_query);

  // Reschedule next check of host or service
  } else if ( command == 'reschedule' ) {
    var t = new Date();
    var time = z(t.getDate()) + '-' + z(t.getMonth()+1) + '-' + z(t.getFullYear()) + '+' + z(t.getHours()) + '%3A' + z(t.getMinutes()) + '%3A' + z(t.getSeconds());

    var dataString = 'cmd_typ=' + cmds[command] + '&cmd_mod=2&host=' + hostname + service_query + '&start_time=' + time + '&force_check=on&submit=Commit';
    jQuery.post(cmd_url, dataString, resetSrc);
  }
}

var z = function (num) {
  if ( num < 10 ) {
    num = '0'+num;
  }
  return num;
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
		    serviceserrors += '<td class="servicehost">' + service.host_display_name + '</td>';
		    lasthost = service.host_name;
		} else serviceserrors += '<td/>'
		var ackcmd =  "sendCommand(&quot;ack&quot;,&quot;" + encodeURI(service.host_name) + "&quot;,&quot;" + encodeURI(service.service_display_name) + "&quot;);";
		var ack = '<a class="command ack" href="#" onclick="' + ackcmd + '"><img src="img/ack.png" width="14" height="14" alt="Aknowledge" /></a>';
		var recheckcmd = "sendCommand(&quot;reschedule&quot;,&quot;" + encodeURI(service.host_name) + "&quot;,&quot;" + encodeURI(service.service_display_name) + "&quot;, this);";
		var recheck = '<a class="command recheck" href="#" onclick="' + recheckcmd + '"><img src="img/rck.png" width="14" height="14" alt="Recheck" /></a>';
		var servicelink = '<a target="_blank" href="' + url + "extinfo.cgi?type=2&amp;host=" + encodeURI(service.host_name) + "&amp;service=" + encodeURI(service.service_display_name) + '">' + service.service_display_name + "</a>";
		serviceserrors += '<td class="' + StatusShort[service.status] + '">' + servicelink + '</td><td>' + recheck + ack + '</td></tr>';
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
