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

var database = "http://localhost:5984/usage";

query( "DELETE", database );
query( "PUT", database );

// Create a set of users
users = ["kore", "hans"];
for ( i in users ) {
    query(
        "PUT",
        database + "/user-" + users[i],
        JSON.stringify( {
            type: "user",
            name: users[i],
            emails: [users[i] + "@example.com"],
        } )
    );
}

// Create a set of random usage entries for users
for ( i in users ) {
    date = 1325372400; // 1.1.2012
    while ( date < 1356908400 /* 31.12.2012 */ ) {
        var jsDate = new Date();
        jsDate.setTime( date * 1000 );
        date += Math.random() * 86400 * 7;
        query(
            "POST",
            database,
            JSON.stringify( {
                type: "usage",
                user: "user-" + users[i],
                date: [
                    jsDate.getUTCFullYear(),
                    jsDate.getUTCMonth() + 1,
                    jsDate.getUTCDate(),
                    jsDate.getUTCHours(),
                    jsDate.getUTCMinutes(),
                    jsDate.getUTCSeconds(),
                ],
                way: Math.random() * 100,
                price: Math.random() * 10,
            } )
        );
    }
}

query(
    "PUT",
    database + "/_design/usage",
    JSON.stringify( {
        "_id": "_design/usage",
        language: "javascript",
        views: {
            way: {
                map: "function(doc) { if ( doc.type === 'usage' ) { emit( [doc.user, doc.date[0], doc.date[1], doc.date[2]], doc.way ); } }",
                reduce: "_stats"
            },
            price: {
                map: "function(doc) { if ( doc.type === 'usage' ) { emit( [doc.user, doc.date[0], doc.date[1], doc.date[2]], doc.price ); } }",
                reduce: "_stats"
            }
        }
    } )
);

console.log( query(
    "GET",
    database + "/_design/usage/_view/way" + queryParams( {
        startkey:      JSON.stringify( ["user-kore"] ),
        endkey:        JSON.stringify( ["user-kore", {}] ),
        reduce:        JSON.stringify( true ),
        "group_level": JSON.stringify( 3 ),
    } )
) );

