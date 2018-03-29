const base = 'http://127.0.0.1:8800/api/';
const url = base + 'transaction';

const chai = require('chai');
const chaiHTTP = require('chai-http');
const expect = chai.expect;

chai.use(chaiHTTP);

//deposit
describe('Add Deposits (POST /api/transaction/deposit)', function(){
	
	it('add 500 credits to card 1f7aa98945', function(done){
		chai.request(url)
		    .post('/deposit')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    credits:500,
			    cardUID:'1f7aa98945'
		    })
		    .end(function(e, r){
			    expect(e).to.be.null;
			    expect(r).to.have.status(200);
			    expect(r.body.status).to.be.equal(true);
			    done();
		    });
	});
	
	it('add 400 credits to card 8311598942', function(done){
		chai.request(url)
		    .post('/deposit')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    credits:400,
			    cardUID:'8311598942'
		    })
		    .end(function(e, r){
			    expect(e).to.be.null;
			    expect(r).to.have.status(200);
			    expect(r.body.status).to.be.equal(true);
			    done();
		    });
	});
	
	it('add 300 credits to card C12345', function(done){
		chai.request(url)
		    .post('/deposit')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    credits:300,
			    cardUID:'C12345'
		    })
		    .end(function(e, r){
			    expect(e).to.be.null;
			    expect(r).to.have.status(200);
			    expect(r.body.status).to.be.equal(true);
			    done();
		    });
	});
	
	it('throw 500 error when adding 333 credits', function(done){
		chai.request(url)
		    .post('/deposit')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    credits:333,
			    cardUID:'1f7aa98945'
		    })
		    .end(function(e, r){
			    expect(e).to.exist;
			    expect(r).to.have.status(500);
			    expect(r.body.status).to.be.equal(false);
			    done();
		    });
	});
	
	it('throw 500 error when adding 1100 credits (over limit)', function(done){
		chai.request(url)
		    .post('/deposit')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    credits:1100,
			    cardUID:'8311598942'
		    })
		    .end(function(e, r){
			    expect(e).to.exist;
			    expect(r).to.have.status(500);
			    expect(r.body.status).to.be.equal(false);
			    done();
		    });
	});
	
	it('throw 500 error when adding negative credits', function(done){
		chai.request(url)
		    .post('/deposit')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    credits:-200,
			    cardUID:'1f7aa98945'
		    })
		    .end(function(e, r){
			    expect(e).to.exist;
			    expect(r).to.have.status(500);
			    expect(r.body.status).to.be.equal(false);
			    done();
		    });
	});
	
	it('throw 500 error when adding 0 credits', function(done){
		chai.request(url)
		    .post('/deposit')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    credits:0,
			    cardUID:'C12345'
		    })
		    .end(function(e, r){
			    expect(e).to.exist;
			    expect(r).to.have.status(500);
			    expect(r.body.status).to.be.equal(false);
			    done();
		    });
	});
	
	it('throw 500 error when adding 0 credits to unknown card XXXX', function(done){
		chai.request(url)
		    .post('/deposit')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    credits:0,
			    cardUID:'XXXX'
		    })
		    .end(function(e, r){
			    expect(e).to.exist;
			    expect(r).to.have.status(500);
			    expect(r.body.status).to.be.equal(false);
			    done();
		    });
	});
	
});

//payment
describe('Add Payments (POST /api/transaction/pay)', function(){
	
	it('do payment over 50 credits from card 1f7aa98945', function(done){
		chai.request(url)
		    .post('/pay')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .set('terminal', 'BBBBTOKEN1234')
		    .send({
			    credits:-50,
			    cardUID:'1f7aa98945'
		    })
		    .end(function(e, r){
			    expect(e).to.be.null;
			    expect(r).to.have.status(200);
			    expect(r.body.status).to.be.equal(true);
			    done();
		    });
	});
	
	it('do payment over 150 credits from card 1f7aa98945', function(done){
		chai.request(url)
		    .post('/pay')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .set('terminal', 'BBBBTOKEN1234')
		    .send({
			    credits:-150,
			    cardUID:'1f7aa98945'
		    })
		    .end(function(e, r){
			    expect(e).to.be.null;
			    expect(r).to.have.status(200);
			    expect(r.body.status).to.be.equal(true);
			    done();
		    });
	});
	
	it('do payment over 50 credits from card C12345', function(done){
		chai.request(url)
		    .post('/pay')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .set('terminal', 'BBBBTOKEN1234')
		    .send({
			    credits:-150,
			    cardUID:'C12345'
		    })
		    .end(function(e, r){
			    expect(e).to.be.null;
			    expect(r).to.have.status(200);
			    expect(r.body.status).to.be.equal(true);
			    done();
		    });
	});
	
	it('do payment over 100 credits from card C12345', function(done){
		chai.request(url)
		    .post('/pay')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .set('terminal', 'BBBBTOKEN1234')
		    .send({
			    credits:-100,
			    cardUID:'C12345'
		    })
		    .end(function(e, r){
			    expect(e).to.be.null;
			    expect(r).to.have.status(200);
			    expect(r.body.status).to.be.equal(true);
			    done();
		    });
	});
	
	it('throw 500 error when paying without terminal token header', function(done){
		chai.request(url)
		    .post('/pay')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    credits:-50,
			    cardUID:'1f7aa98945'
		    })
		    .end(function(e, r){
			    expect(e).to.exist;
			    expect(r).to.have.status(500);
			    expect(r.body.status).to.be.equal(false);
			    done();
		    });
	});
	
	it('throw 500 error when paying from unknown terminal CCCCTOKEN1234', function(done){
		chai.request(url)
		    .post('/pay')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .set('terminal', 'CCCCTOKEN1234')
		    .send({
			    credits:-50,
			    cardUID:'1f7aa98945'
		    })
		    .end(function(e, r){
			    expect(e).to.exist;
			    expect(r).to.have.status(500);
			    expect(r.body.status).to.be.equal(false);
			    done();
		    });
	});
	
	it('throw 500 error when paying 0 credits', function(done){
		chai.request(url)
		    .post('/pay')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .set('terminal', 'BBBBTOKEN1234')
		    .send({
			    credits:0,
			    cardUID:'1f7aa98945'
		    })
		    .end(function(e, r){
			    expect(e).to.exist;
			    expect(r).to.have.status(500);
			    expect(r.body.status).to.be.equal(false);
			    done();
		    });
	});
	
	it('throw 500 error when paying 110 credits', function(done){
		chai.request(url)
		    .post('/pay')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .set('terminal', 'BBBBTOKEN1234')
		    .send({
			    credits:-110,
			    cardUID:'1f7aa98945'
		    })
		    .end(function(e, r){
			    expect(e).to.exist;
			    expect(r).to.have.status(500);
			    expect(r.body.status).to.be.equal(false);
			    done();
		    });
	});
	
	it('throw 500 error when paying 1200 credits', function(done){
		chai.request(url)
		    .post('/pay')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .set('terminal', 'BBBBTOKEN1234')
		    .send({
			    credits:-1200,
			    cardUID:'1f7aa98945'
		    })
		    .end(function(e, r){
			    expect(e).to.exist;
			    expect(r).to.have.status(500);
			    expect(r.body.status).to.be.equal(false);
			    done();
		    });
	});
	
	it('throw 500 error for positive payment values', function(done){
		chai.request(url)
		    .post('/pay')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .set('terminal', 'BBBBTOKEN1234')
		    .send({
			    credits:100,
			    cardUID:'1f7aa98945'
		    })
		    .end(function(e, r){
			    expect(e).to.exist;
			    expect(r).to.have.status(500);
			    expect(r.body.status).to.be.equal(false);
			    done();
		    });
	});
	
	it('throw 500 error when paying from unknown card XXXX', function(done){
		chai.request(url)
		    .post('/pay')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .set('terminal', 'BBBBTOKEN1234')
		    .send({
			    credits:-50,
			    cardUID:'XXXX'
		    })
		    .end(function(e, r){
			    expect(e).to.exist;
			    expect(r).to.have.status(500);
			    expect(r.body.status).to.be.equal(false);
			    done();
		    });
	});
	
	it('throw 500 error when paying from inactive card 8311598942', function(done){
		chai.request(url)
		    .post('/pay')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .set('terminal', 'BBBBTOKEN1234')
		    .send({
			    credits:-50,
			    cardUID:'8311598942'
		    })
		    .end(function(e, r){
			    expect(e).to.exist;
			    expect(r).to.have.status(500);
			    expect(r.body.status).to.be.equal(false);
			    done();
		    });
	});
	
	it('throw 500 error when paying from card CnoUSR (no assigned user)', function(done){
		chai.request(url)
		    .post('/pay')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .set('terminal', 'BBBBTOKEN1234')
		    .send({
			    credits:-50,
			    cardUID:'CnoUSR'
		    })
		    .end(function(e, r){
			    expect(e).to.exist;
			    expect(r).to.have.status(500);
			    expect(r.body.status).to.be.equal(false);
			    done();
		    });
	});
	
	it('throw 500 error when there is not enough credit balance', function(done){
		chai.request(url)
		    .post('/pay')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .set('terminal', 'BBBBTOKEN1234')
		    .send({
			    credits:-500,
			    cardUID:'1f7aa98945'
		    })
		    .end(function(e, r){
			    expect(e).to.exist;
			    expect(r).to.have.status(500);
			    expect(r.body.status).to.be.equal(false);
			    done();
		    });
	});
});

describe('Admin Actions', function(){
	it('throw 500 error when admin payment is out of range of database field', function(done){
		chai.request(url)
		    .post('/admin')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .set('terminal', 'BBBBTOKEN1234')
		    .send({
			    credits:133700,
			    cardUID:'1f7aa98945'
		    })
		    .end(function(e, r){
			    expect(e).to.exist;
			    expect(r).to.have.status(500);
			    expect(r.body.status).to.be.equal(false);
			    done();
		    });
	});
	
	it('do ADMIN deposit over 5000 credits for card 1f7aa98945', function(done){
		chai.request(url)
		    .post('/admin')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .set('terminal', 'BBBBTOKEN1234')
		    .send({
			    credits:5000,
			    cardUID:'1f7aa98945'
		    })
		    .end(function(e, r){
			    expect(e).to.be.null;
			    expect(r).to.have.status(200);
			    expect(r.body.status).to.be.equal(true);
			    done();
		    });
	});
	
	it('do ADMIN deposit over -5000 credits for card 1f7aa98945', function(done){
		chai.request(url)
		    .post('/admin')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .set('terminal', 'BBBBTOKEN1234')
		    .send({
			    credits:-5000,
			    cardUID:'1f7aa98945'
		    })
		    .end(function(e, r){
			    expect(e).to.be.null;
			    expect(r).to.have.status(200);
			    expect(r.body.status).to.be.equal(true);
			    done();
		    });
	});
});

//get transaction count
describe('Transaction Infos', function(){
	
	it('respond with 750 total credits (GET /api/transaction/total)', function(done){
		chai.request(url).get('/total').end((e, r) =>{
			try{
				expect(e).to.be.null;
				expect(r).to.have.status(200);
				expect(r.body.status).to.be.equal(true);
				expect(r.body.data).to.be.equal(750);
				done();
			}catch(ex){
				done(ex);
			}
		})
	});
	
	it('respond with correct amount of total transactions (GET /api/transaction)', function(done){
		chai.request(url).get('/').end((e, r) =>{
			try{
				expect(e).to.be.null;
				expect(r).to.have.status(200);
				expect(r.body.status).to.be.equal(true);
				expect(r.body.data).to.have.lengthOf(9);
				
				expect(r.body.data[0]['Type']).to.be.equal('Admin');
				expect(r.body.data[0]['Value']).to.be.equal(-5000);
				expect(r.body.data[0]['CardREF']).to.be.equal('1f7aa98945');
				expect(r.body.data[0]['TerminalREF']).to.be.null;
				
				expect(r.body.data[2]['Type']).to.be.equal('Payment');
				expect(r.body.data[2]['Value']).to.be.equal(-100);
				expect(r.body.data[2]['CardREF']).to.be.equal('C12345');
				expect(r.body.data[2]['TerminalREF']).to.be.equal(1);
				
				expect(r.body.data[5]['Type']).to.be.equal('Payment');
				expect(r.body.data[5]['CardREF']).to.be.equal('1f7aa98945');
				expect(r.body.data[5]['Value']).to.be.equal(-50);
				expect(r.body.data[5]['TerminalREF']).to.be.equal(1);
				
				expect(r.body.data[8]['Type']).to.be.equal('Deposit');
				expect(r.body.data[8]['CardREF']).to.be.equal('1f7aa98945');
				expect(r.body.data[8]['Value']).to.be.equal(500);
				expect(r.body.data[8]['TerminalREF']).to.be.null;
				
				done();
			}catch(ex){
				done(ex);
			}
		})
	});
	
	it('respond with error for transaction 1337 (GET /api/transaction/1337)', function(done){
		chai.request(url)
		    .get('/1337')
		    .end((e, r) =>{
			    try{
				    expect(e).to.exist;
				    expect(r).to.have.status(404);
				    expect(r.body.status).to.be.equal(false);
				    done();
			    }catch(ex){
				    done(ex);
			    }
		    })
	});
	
	it('respond with correct data for transaction 1 (GET /api/transaction/1)', function(done){
		chai.request(url)
		    .get('/1')
		    .end((e, r) =>{
			    try{
				    expect(e).to.be.null;
				    expect(r).to.have.status(200);
				    expect(r.body.status).to.be.equal(true);
				
				    expect(r.body.data['Type']).to.be.equal('Deposit');
				    expect(r.body.data['Value']).to.be.equal(500);
				    expect(r.body.data['CardREF']).to.be.equal('1f7aa98945');
				    expect(r.body.data['TerminalREF']).to.be.null;
				
				    done();
			    }catch(ex){
				    done(ex);
			    }
		    })
	});
});

//mark ransactions
describe('Mark Transactions (PATCH /api/transaction/:transID)', function(){
	
	it('throw 500 error ( no terminal header )', function(done){
		chai.request(url)
		    .patch('/1')
		    .end((e, r) =>{
			    try{
				    expect(e).to.exist;
				    expect(r.body.status).to.be.equal(false);
				    expect(r).to.have.status(500);
				    done();
			    }catch(ex){
				    done(ex);
			    }
		    })
	});
	
	it('throw 404 error ( invalid transaction )', function(done){
		chai.request(url)
		    .patch('/100')
		    .set('terminal', 'BBBBTOKEN1234')
		    .end((e, r) =>{
			    try{
				    expect(e).to.exist;
				    expect(r.body.status).to.be.equal(false);
				    expect(r).to.have.status(404);
				    done();
			    }catch(ex){
				    done(ex);
			    }
		    })
	});
	
	it('mark transaction 1', function(done){
		chai.request(url)
		    .patch('/1')
		    .set('terminal', 'BBBBTOKEN1234')
		    .end((e, r) =>{
			    try{
				    expect(e).to.be.null;
				    expect(r.body.status).to.be.equal(true);
				    expect(r).to.have.status(200);
				    done();
			    }catch(ex){
				    done(ex);
			    }
		    })
	});
	
	it('verify that transaction 1 is now marked', function(done){
		chai.request(url).get('/marked/').end((e, r) =>{
			try{
				expect(e).to.be.null;
				expect(r).to.have.status(200);
				expect(r.body.status).to.be.equal(true);
				expect(r.body.data).to.have.lengthOf(1);
				expect(r.body.data[0]['M_ID']).to.be.equal(1);
				expect(r.body.data[0]['M_SOLVED']).to.be.equal(0);
				expect(r.body.data[0]['M_TREF']).to.be.equal(1);
				expect(r.body.data[0]['T_CardREF']).to.be.equal('1f7aa98945');
				expect(r.body.data[0]['T_Type']).to.be.equal('Deposit');
				expect(r.body.data[0]['T_Value']).to.be.equal(500);
				done();
			}catch(ex){
				done(ex);
			}
		})
	});
	
	it('solve the marked transaction 1', function(done){
		chai.request(url)
		    .patch('/mark/1')
		    .end((e, r) =>{
			    try{
				    expect(e).to.be.null;
				    expect(r).to.have.status(200);
				    expect(r.body.status).to.be.equal(true);
				    done();
			    }catch(ex){
				    done(ex);
			    }
		    })
	});
	
	it('verify that mark:1 was solved', function(done){
		chai.request(url).get('/marked/').end((e, r) =>{
			try{
				expect(e).to.be.null;
				expect(r).to.have.status(200);
				expect(r.body.status).to.be.equal(true);
				expect(r.body.data).to.have.lengthOf(0);
				done();
			}catch(ex){
				done(ex);
			}
		})
	});
});

describe('Transaction History (GET /api/card/:uid/transactions)', function(){
	it('get correct history for 1f7aa98945', function(done){
		chai.request(base + '/card')
		    .get('/1f7aa98945/transactions')
		    .set('terminal', 'BBBBTOKEN1234')
		    .end((e, r) =>{
			    try{
				    expect(e).to.be.null;
				    expect(r.body.status).to.be.equal(true);
				    expect(r).to.have.status(200);
				    expect(r.body.data).to.have.lengthOf(5);
				
				    expect(r.body.data[2]['ID']).to.be.equal(5);
				    expect(r.body.data[2]['Value']).to.be.equal(-150);
				    expect(r.body.data[2]['Type']).to.be.equal('Payment');
				    expect(r.body.data[2]['TerminalREF']).to.be.equal(1);
				    expect(r.body.data[2]['CardREF']).to.be.equal('1f7aa98945');
				
				    expect(r.body.data[4]['ID']).to.be.equal(1);
				    expect(r.body.data[4]['Value']).to.be.equal(500);
				    expect(r.body.data[4]['Type']).to.be.equal('Deposit');
				    expect(r.body.data[4]['TerminalREF']).to.be.null;
				    expect(r.body.data[4]['CardREF']).to.be.equal('1f7aa98945');
				
				    done();
			    }catch(ex){
				    done(ex);
			    }
		    })
	});
	
	it('throw 404 error for unknown card XXXX', function(done){
		chai.request(base + '/card')
		    .get('/XXXX/transactions')
		    .set('terminal', 'BBBBTOKEN1234')
		    .end((e, r) =>{
			    try{
				    expect(e).to.exist;
				    expect(r.body.status).to.be.equal(false);
				    expect(r).to.have.status(404);
				    done();
			    }catch(ex){
				    done(ex);
			    }
		    })
	});
	
	it('throw 500 error for card 8311598942 (not enabled)', function(done){
		chai.request(base + '/card')
		    .get('/8311598942/transactions')
		    .set('terminal', 'BBBBTOKEN1234')
		    .end((e, r) =>{
			    try{
				    expect(e).to.exist;
				    expect(r.body.status).to.be.equal(false);
				    expect(r).to.have.status(500);
				    done();
			    }catch(ex){
				    done(ex);
			    }
		    })
	});
	
	it('throw 500 error card CnoUSR (no user)', function(done){
		chai.request(base + '/card')
		    .get('/CnoUSR/transactions')
		    .set('terminal', 'BBBBTOKEN1234')
		    .end((e, r) =>{
			    try{
				    expect(e).to.exist;
				    expect(r.body.status).to.be.equal(false);
				    expect(r).to.have.status(500);
				    done();
			    }catch(ex){
				    done(ex);
			    }
		    })
	});
	
});

//get card balance
describe('Get Credits for Card (GET /api/card/:uid)', function(){
	
	it('throw 500 no terminal_header error', function(done){
		chai.request(base + '/card')
		    .get('/C12345')
		    .end((e, r) =>{
			    try{
				    expect(e).to.exist;
				    expect(r.body.status).to.be.equal(false);
				    expect(r).to.have.status(500);
				    done();
			    }catch(ex){
				    done(ex);
			    }
		    })
	});
	
	it('respond with 300 credits for card 1f7aa98945', function(done){
		chai.request(base + '/card')
		    .get('/1f7aa98945')
		    .set('terminal', 'BBBBTOKEN1234')
		    .end((e, r) =>{
			    try{
				    expect(e).to.be.null;
				    expect(r.body.status).to.be.equal(true);
				    expect(r.body.data).to.be.equal(300);
				    expect(r).to.have.status(200);
				    done();
			    }catch(ex){
				    done(ex);
			    }
		    })
	});
	
	it('throw 500 error for card 8311598942 (not enabled)', function(done){
		chai.request(base + '/card')
		    .get('/8311598942')
		    .set('terminal', 'BBBBTOKEN1234')
		    .end((e, r) =>{
			    try{
				    expect(e).to.exist;
				    expect(r.body.status).to.be.equal(false);
				    expect(r).to.have.status(500);
				    done();
			    }catch(ex){
				    done(ex);
			    }
		    })
	});
	
	it('respond with 50 credits for card C12345', function(done){
		chai.request(base + '/card')
		    .get('/C12345')
		    .set('terminal', 'BBBBTOKEN1234')
		    .end((e, r) =>{
			    try{
				    expect(e).to.be.null;
				    expect(r.body.status).to.be.equal(true);
				    expect(r.body.data).to.be.equal(50);
				    expect(r).to.have.status(200);
				    done();
			    }catch(ex){
				    done(ex);
			    }
		    })
	});
	
	it('throw 404 error for unknown card XXXX', function(done){
		chai.request(base + '/card')
		    .get('/XXXX')
		    .set('terminal', 'BBBBTOKEN1234')
		    .end((e, r) =>{
			    try{
				    expect(e).to.exist;
				    expect(r.body.status).to.be.equal(false);
				    expect(r).to.have.status(404);
				    done();
			    }catch(ex){
				    done(ex);
			    }
		    })
	});
	
	it('throw 500 error card CnoUSR (no user)', function(done){
		chai.request(base + '/card')
		    .get('/CnoUSR')
		    .set('terminal', 'BBBBTOKEN1234')
		    .end((e, r) =>{
			    try{
				    expect(e).to.exist;
				    expect(r.body.status).to.be.equal(false);
				    expect(r).to.have.status(500);
				    done();
			    }catch(ex){
				    done(ex);
			    }
		    })
	});
});