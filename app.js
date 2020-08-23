const express = require('express');
const mysql = require('mysql');
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));

// const connection = mysql.createConnection({
//   host: 'us-cdbr-east-02.cleardb.com',
//   user: 'bf713e8bc55e84',
//   password: '9948d363',
//   database: 'heroku_8364a5dc665cd43'
// });

var db_config = {
  host: 'us-cdbr-east-02.cleardb.com',
  user: 'bf713e8bc55e84',
  password: '9948d363',
  database: 'heroku_8364a5dc665cd43'
};

var connection;

function handleDisconnect() {
  console.log('INFO.CONNECTION_DB: ');
  connection = mysql.createConnection(db_config);
  
  //connection取得
  connection.connect(function(err) {
      if (err) {
          console.log('ERROR.CONNECTION_DB: ', err);
          setTimeout(handleDisconnect, 1000);
      }
  });
  
  //error('PROTOCOL_CONNECTION_LOST')時に再接続
  connection.on('error', function(err) {
      console.log('ERROR.DB: ', err);
      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
          console.log('ERROR.CONNECTION_LOST: ', err);
          handleDisconnect();
      } else {
          throw err;
      }
  });
}

handleDisconnect();

// connection.connect((err) => {
//   if (err) {
//     console.log('error connecting: ' + err.stack);
//     return;
//   }
//   console.log('success');
// });

app.get('/', (req, res) => {
  res.render('top.ejs')
});

app.get('/borrow', (req, res) => {
  connection.query(
    'select id from kagi where lender is null',
    (error, results) => {
      res.render('borrow.ejs', {numbers: results});
    }
  );
});

app.get('/borrow-meter', (req, res) => {
  connection.query(
    'select id from meters where lender is null',
    (error, results) => {
      res.render('borrow-meter.ejs', {numbers: results});
    }
  );
});

app.get('/resister/:id', (req, res) => {
  connection.query(
    'SELECT * FROM kagi WHERE id = ?',
    [req.params.id],
    (error, results) => {
      console.log(results);
      res.render('resister.ejs', {bango: results[0]});
    }
  );
});

app.get('/resister-meter/:id', (req, res) => {
  connection.query(
    'SELECT * FROM meters WHERE id = ?',
    [req.params.id],
    (error, results) => {
      console.log(results);
      res.render('resister.ejs', {bango: results[0]});
    }
  );
});

app.post('/update/:id', (req, res) => {
  if (20 >= req.body.params) {
    connection.query(
      'update kagi set lender = ?, proprietary = ? where id = ?',
      [req.body.bangoLender, req.body.bangoProprietary, req.params.id],
      (error, results) => {
        connection.query(
          'select * from html where id = 1',
          (error, results) => {
            console.log(results);
            res.render('display.ejs', {status: results[0]});
          }        
        );
      }
    );
  } else {
    connection.query(
      'update meters set lender = ?, proprietary = ? where id = ?',
      [req.body.bangoLender, req.body.bangoProprietary, req.params.id],
      (error, results) => {
        connection.query(
          'select * from html where id = 1',
          (error, results) => {
            console.log(results);
            res.render('display.ejs', {status: results[0]});
          }        
        );
      }
    );
  } 
});

app.get('/return', (req, res) => {
  connection.query(
    'select * from html where id = 3',
    (error, results) => {
      console.log(results);
      res.render('return.ejs', {item: results[0]});
    }
  );
});

app.get('/return-meter', (req, res) => {
  connection.query(
    'select * from html where id = 4',
    (error, results) => {
      console.log(results);
      res.render('return.ejs', {item: results[0]});
    }
  );
});

app.post('/delete', (req, res) => {
  if (20 >= req.body.id) {
    connection.query(
      'delete from kagi where id = ?',
      [req.body.id],
      (error, results) => {
        connection.query(
          'insert into kagi (id, item) values (?, "鍵")',
          [req.body.id],
          (error, results) => {
            connection.query(
              'select * from html where id = 2',
              (error, results) => {
                console.log(results);
                res.render('display.ejs', {status: results[0]});
              }
            );
          }
        );
      }
    );
  } else {
    connection.query(
      'delete from meters where id = ?',
      [req.body.id],
      (error, results) => {
        connection.query(
          'insert into meters (id, item) values (?, "行動計")',
          [req.body.id],
          (error, results) => {
            connection.query(
              'select * from html where id = 2',
              (error, results) => {
                console.log(results);
                res.render('display.ejs', {status: results[0]});
              }
            );
          }
        );
      }
    );
  }
});

app.listen(process.env.PORT || 3000);
