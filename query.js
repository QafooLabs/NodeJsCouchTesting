// https://github.com/driverdan/node-XMLHttpRequest
var XMLHttpRequest = require("./XMLHttpRequest.js").XMLHttpRequest;

function query( method, url, data, contentType ) {
    var request = new XMLHttpRequest();

    request.open( method, url, false );
    request.setRequestHeader( "Content-Type", contentType || "application/json" );
    request.send( data || null );

    if ( request.status >= 300 ) {
        console.log( "Error: " + request.responseText );
    }

    return request.responseText;
}

// query( "PUT", "http://localhost:5984/test" );

var response = query(
    "POST",
    "http://localhost:5984/test/",
    JSON.stringify( {
        type: "user",
        name: "Kore Nordmann",
    } )
);

console.log( response );

