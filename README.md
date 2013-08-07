# Icinga To Go

Simplified icinga status list esp. for mobile use

## Installation

1. Clone this repo or download an archive and extract it on your webserver that hosts Icinga/Nagios.

2. Open the file index.html and find the section:

    ```HTML
    <script type="text/javascript">
    var demo = true;
    var url = '/icinga/cgi-bin/status.cgi?jsonoutput';
    </script>
    ```
  
    Set the variable `demo` to `false` and change the url to the one of your Icinga/Nagios installation if required.

3. Open the file m.html and repeat the previous step, but do not include the status.cgi in the url.

4. Point your browser to your webserver and installation directory. The index.html will load first. To go to the jQuery mobile interface, append m.html to the directory path.

## Screenshots

Screenshot can be found at the announcement page: http://ewus.de/en/sw/en/icinga-go