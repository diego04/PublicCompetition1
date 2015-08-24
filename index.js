var restify = require('restify');
var squel = require("squel");
var _ = require('lodash');

//localhost:8080/api/foo?Type=PPI&name=123mark&mission_id=misid

var mysql = require('mysql');
var connection = mysql.createConnection({

});

function respond(req, res, next) {

    var obj = req.params
    var key, keys = Object.keys(obj);
    console.log(key)
    console.log('key')
    var n = keys.length;
    var queryParams = {}
    while (n--) {
        key = keys[n];
        queryParams[key.toLowerCase()] = obj[key].toLowerCase();
    }
    console.log(queryParams)

    // api/search?type=LROX/PPI&dataset_name=mark&dataset_id=something
    if ('dataset_name' in queryParams) {
        console.log('has datasetname')
    }
    if ('dataset_id' in queryParams) {
        console.log('has dataset_id')
    }

    console.log(req.params)
    console.log(req.params.Type)
    if (req.params.Type == 'LROC') console.log('LROX')
    else if (req.params.Type == 'PPI') console.log('PPIX')

    var useGreaterThanOnColumn = [ 'date_min' ]
    var useLessThanOnColumn = [ 'date_max' ]

    //with date min: SELECT * FROM table where Columnn > min-query_date
    function setGreaterThan(theQuery) {
        var theQuery = theQuery
        var x = _(useGreaterThanOnColumn).forEach(function (sqlColumnn) {
            if (sqlColumnn in queryParams) {
                theQuery.where(sqlColumnn +" = "+ queryParams[sqlColumnn])
            }
        }).value();
        return theQuery
    }
    function setLessThan(theQuery) {
        var theQuery = theQuery
        var x = _(useGreaterThanOnColumn).forEach(function (sqlColumnn) {
            if (sqlColumnn in queryParams) {
                theQuery.where(sqlColumnn +" = "+ queryParams[sqlColumnn])
            }
        }).value();
        return theQuery
    }

    // search?date_type=on.YYYY-MM-DD.YYYY-MM-DD
    function dateQuery(theQuery){
        var theQuery = theQuery
        if ('date_type' in queryParams){
            var dateParams = queryParams["date_type"].split('.')
            console.log(dateParams)

            var impose = dateParams[0]
            var dateImposed = dateParams[1]

            switch(impose){
                case 'before':
                    theQuery.where( 'date' + '<' + dateImposed )
                    break
                case 'after':
                    theQuery.where( 'date' + '>' + dateImposed )
                    break
                case 'on':
                    theQuery.where( 'date' + '=' + dateImposed )
                    break
                case 'between_dates':
                    var dateImposed2 = dateParams[2]
                    theQuery.where( dateImposed + ' < date < ' + dateImposed2)
                    break
                case 'before_current_date':
                    var dateImposed2 = dateParams[2]
                    theQuery.where( 'date' + '<' + Date.now() )
                    break
                case 'after_current_date':
                    theQuery.where( 'date' + '>' + Date.now() )
            }
            return theQuery
        }
    }

    var useIntRangeOnColumn = {
        "latitude_max": {
            min: -90, max: 90
        }
        , "latitude_min": {
            min: 0, max: 90
        }
        ,"western_most_longitude": {
            min: 0, max: 360
        }
        , "eastern_most_longitude": {
            min: 0, max: 360
        }
    }
    var useFloatRangeColumn = {
        "illumination_min":{
            min: -9007199254740992, max: 9007199254740992
        }
        , "camera_angle_min":{
            min: 0.0000, max: 179.910
        }
        , "camera_angle_max":{
            min: 0.0000, max: 179.910
        }
    }
    var useMergeOnColumn = [
        "mission_name"
    ]

    function searchRange(){
        var columnsWithRange = {
            "camera":['camera_angle_min','camera_angle_max']
            ,"illumination":["illumination_min"]
            ,"searchableInteger":['latitude_max','latitude_min', 'western_most_longitude', 'eastern_most_longitude']
        }

        if ('' in useFloatRangeColumn) console.log()
    }

    function setEquals(theQuery, useEqualOnColumn) {
        var theQuery = theQuery
        var x = _(useEqualOnColumn).forEach(function (sqlColumnn) {
            if (sqlColumnn in queryParams) {
                theQuery.where(sqlColumnn +" = "+ queryParams[sqlColumnn])
            }
        }).value();
        return theQuery
    }

    var theQuery = ""
    //LROX or PPI: paramter is required
    if ('type' in queryParams) {
        if(queryParams.type == "ppi") {
            theQuery = squel.select()
                .from("map_image")
            var useEqualOnColumn = [
                "name", "mission_id", "camera_type", "product_type", "camera_spec",
            ]
            theQuery = setEquals(theQuery, useEqualOnColumn)
            theQuery = dateQuery(theQuery)
            console.log(theQuery.toString())

        }
        else if(queryParams.type == "lroc") {
            res.send(query)
        }
    }

     connection.query('SELECT * from map_image where (date < 2009-01-01 )', function(err, rows, fields) {
     if (err) throw res.send({err:err});
     console.log('map_image')
     console.log(rows)
     res.send('hello ' + JSON.stringify({fields:fields,rows:rows}));

     })
    //res.send(setEquals(theQuery).toString())

    next();
}

//connection.end();

var server = restify.createServer();
server.use(restify.queryParser());
server.get('/api/:name', respond);

server.listen(8080, function () {
    console.log('%s listening at %s', server.name, server.url);
});