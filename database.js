let PostgreSQL = require('pg');


class Database {

    
    constructor( config) {
        this.connection = new PostgreSQL.Client(config)
        this.connection.connect()

    }

    listen(event_name){
        this.connection.query('LISTEN ' + event_name);
    }

    query( postgresql, args ) {
        return new Promise( ( resolve, reject ) => {
            this.connection.query(postgresql, args, ( err, rows ) => {
                if ( err )
                    return reject( err );
                resolve( rows );
            } );
        } );
    }

    close() {
        return new Promise( ( resolve, reject ) => {
            this.connection.end( err => {
                if ( err )
                    return reject( err );
                resolve();
            } );
        } );
    }

  }

  module.exports = {
    Database,
};
  
  