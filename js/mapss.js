/*

Anti-Spam Email Links 1.8
=========================
by Andrew Gregory
http://www.scss.com.au/family/andrew/webdesign/emaillinks/

This work is licensed under the Creative Commons Attribution License. To view a
copy of this license, visit http://creativecommons.org/licenses/by/1.0/ or send
a letter to Creative Commons, 559 Nathan Abbott Way, Stanford, California 94305,
USA.

IMPORTANT NOTE:
Variables and functions with names starting with an underscore (_) are
'internal' and not to be used.

*/

// search for (with subject "subject") in the element text and use the text
// inside the double quotes as the email subject
function emaillinks_subject(text, link) {
  var subject = emaillinks_config.subj.exec(text);
  if (subject) {
    link.setAttribute('href', link.getAttribute('href') + '?subject=' + subject[1]);
  }
}

// Process the element
function _emaillinks_process(ele) {
  var i, r, title, newText;
  var cfg = emaillinks_config;
  var node = ele.childNodes[0];
  // get recipient name and obfuscated email address
  var txtLink = node.nodeType == 3;
  var imgLink = node.nodeType == 1 && node.tagName.toLowerCase() == 'img';
  var text = null;
  if (txtLink) text = node.nodeValue;
  if (imgLink) text = node.getAttribute('alt');
  if (!text) return;
  var name = (cfg.name) ? cfg.name.exec(text) : null;
  var addr = (cfg.addr) ? cfg.addr.exec(text) : null;
  if (addr) {
    title = ele.getAttribute('title');
    // un-obfuscate email address
    addr = addr[1];
    if (cfg.unobs) {
      for (i = 0; i < cfg.unobs.length; i++) {
        r = cfg.unobs[i];
        addr = addr.replace(r.re, r.txt);
      }
    }
    // set link text
    newText = (name) ? name[1] : (!title) ? addr : title;
    if (txtLink) node.nodeValue = newText;
    if (imgLink) node.setAttribute('alt', newText);
    // set link address
    ele.setAttribute('href', 'mailto:' + addr);
    // last minute processing
    if (cfg.process) {
      for (i = 0; i < cfg.process.length; i++) {
        cfg.process[i](text, ele);
      }
    }
  }
}

// Process selected elements with the configured class name
function _emaillinks_processAll() {
  var classNameRE = new RegExp('\\b' + ((emaillinks_config.className) ? emaillinks_config.className : 'email') + '\\b');
  var i, ele, eles = document.getElementsByTagName('a');
  for (i = 0; i < eles.length; i++) {
    ele = eles[i];
    if (ele.className && classNameRE.test(ele.className) && !ele.getAttribute('href')) {
      _emaillinks_process(ele);
    }
  }
}

// default configuration
var emaillinks_config = {
  className:'email',
  addr:/<([^>]*)>/,
  name:/"([^"]*)"/,
  subj:/with subject "([^"]*)"/,
  process:[emaillinks_subject],
  unobs:[
    {re:/\s+at\s+/ig , txt:'@'},
    {re:/\s+dot\s+/ig, txt:'.'},
    {re:/\s+-at-\s+/ig , txt:'@'},
    {re:/\s+-dot-\s+/ig, txt:'.'},
    {re:/\s+\(at\)\s+/ig , txt:'@'},
    {re:/\s+\(dot\)\s+/ig, txt:'.'},
    {re:/[\.]?invalid$/i, txt:''},
    {re:/\s+/g, txt:''}
  ]
};

// process emails when the document finishes loading
addEvent(window, 'load', _emaillinks_processAll, false);