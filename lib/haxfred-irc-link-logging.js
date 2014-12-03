var request = require('request');

var haxfred_irc_link_logging = function(haxfred) {
  // Checks if message has a link
  var hasLink = function(message) {
    // @TODO Make these configurable
  	if(message.indexOf("https://gist.github.com") > -1 || message.indexOf("http://gist.github.com") > -1 || message.indexOf("http://haxfred.hax10m.com") > -1 || message.indexOf("haxiom.io") > -1) {
  		return false;
  	} else if(message.indexOf("http://") > -1 || message.indexOf("https://") > -1) {
  		return true;
  	}
  	return false;
  };

  //function for haxfred to log links to website
  var logThis = function(from, message) {
  	// Pull out link from message
  	message = message.trim();

  	var startLink = message.indexOf("http://");
  	var onlyLink = false;
  	if (startLink == -1) {
  		startLink = message.indexOf("https://");
  	}
  	var endLink = message.indexOf(" ", startLink);
  	var link = "";
  	if(endLink == -1) {
  		link = message.substring(startLink);
  		if(startLink === 0) {
  			onlyLink = true;
  		}
  	} else {
  		link = message.substring(startLink, endLink);
  	}

  	// If message starts before or (but not and) after link, remove link
  	var eMessage = message;
  	if (onlyLink) {
  		eMessage = "";
  	} else if (startLink === 0) {
  		eMessage = message.substring(endLink + 1).trim();
  	} else if (link.length == (message.length - message.indexOf(link))) {
  		eMessage = message.substring(startLink, endLink).trim();
  	}


  	// Determine what kind of link it is
  	var linkType = "";

  	if(link.toLowerCase().indexOf(".gif") > -1 || link.toLowerCase().indexOf(".png") > -1 || link.toLowerCase().indexOf(".jpg") > -1 || link.toLowerCase().indexOf(".jpeg") > -1) {
  		linkType = "image";
  	} else if (link.toLowerCase().substring(0, 23) == "https://www.youtube.com" || link.toLowerCase().substring(0, 22) == "http://www.youtube.com" || link.toLowerCase().substring(0, 15) == "http://youtu.be" || link.toLowerCase().substring(0, 16) == "https://youtu.be") {
  		linkType = "YouTube";
  	} else if (link.toLowerCase().substring(0, 17) == "https://vimeo.com" || link.toLowerCase().substring(0, 16) == "http://vimeo.com") {

  		linkType = "Vimeo";
  	} else {

  		linkType = "article";
  	}

    // @TODO Make the url configurable
    request.post('http://localhost:3000/api/links', {
      form: {
        url: link,
        type: linkType.toLowerCase(),
        caption: eMessage,
        user: from,
        postDate: new Date()
      }
    });
    if(linkType == "YouTube" || linkType == "Vimeo") {
      linkType = linkType + " video";
    }

    // @TODO Make the url configurable
  	return "Your " + linkType + " was logged to http://links.haxiom.io";
  };

  haxfred.on('irc.msg', '', function(data, deferred) {
    var from = data.from,
        message = data.content;
    // Do stuff
    if (hasLink(message)) {
      haxfred.irc.say(logThis(from, message));
    }
    //haxfred.irc.say("Your link was logged to hattp://haxfred.hax10m.com");
    deferred.resolve();
  });

};

module.exports = haxfred_irc_link_logging;
