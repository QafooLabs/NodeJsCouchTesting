// https://github.com/driverdan/node-XMLHttpRequest
var XMLHttpRequest = require("./XMLHttpRequest.js").XMLHttpRequest;

function query( method, url, data, contentType ) {
    var request = new XMLHttpRequest();

    request.open( method, url, false );
    request.setRequestHeader( "Content-Type", contentType || "application/json" );
    request.send( data || null );

    if ( request.status >= 400 ) {
        console.log( "Error (" + method + " " + url + "): " + request.responseText );
    }

    return request.responseText;
}

function queryParams( params ) {
    var query = "?";
    var key;

    for ( key in params ) {
        query = query + escape( key ) + "=" + escape( params[key] ) + "&";
    }

    return query.substr( 0, query.length - 1 );
}

var database = "http://localhost:5984/jsbook";

query( "DELETE", database );
query( "PUT", database );

query(
    "PUT",
    database + "/user-kore",
    JSON.stringify( {
        type: "user",
        name: "Kore Nordmann",
        emails: ["kore@qafoo.com", "kore@apache.org"],
    } )
);

query(
    "PUT",
    database + "/user-hans",
    JSON.stringify( {
        type: "user",
        name: "Hans Meier",
        emails: [],
    } )
);

query(
    "PUT",
    database + "/user-erika",
    JSON.stringify( {
        type: "user",
        name: "Erika Mustermann",
        emails: [],
    } )
);

query(
    "POST",
    database + "/",
    JSON.stringify( {
        type: "friendship",
        source: "user-kore",
        target: "user-erika",
    } )
);

query(
    "POST",
    database + "/",
    JSON.stringify( {
        type: "friendship",
        source: "user-hans",
        target: "user-erika",
    } )
);

query(
    "POST",
    database + "/",
    JSON.stringify( {
        type: "friendship",
        source: "user-hans",
        target: "user-kore",
    } )
);

query(
    "PUT",
    database + "/_design/friendships",
    JSON.stringify( {
        "_id": "_design/friendships",
        language: "javascript",
        views: {
            friends: {
                map: "function(doc) { if ( doc.type === 'friendship' ) { emit( [doc.source, doc.target], {'_id': doc.target} ); emit( [doc.target, doc.source], {'_id': doc.source} ); } }"
            }
        }
    } )
);

console.log( query(
    "GET",
    database + "/_design/friendships/_view/friends" + queryParams( {
        startkey: JSON.stringify( ["user-kore"] ),
        endkey:   JSON.stringify( ["user-kore", {}] ),
    } )
) );


