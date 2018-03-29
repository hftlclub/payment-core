const url = 'http://127.0.0.1:8800/api/card';

const chai = require('chai');
const chaiHTTP = require('chai-http');
const expect = chai.expect;

chai.use(chaiHTTP);

//add cards
describe('Add Cards (POST /api/card)', function(){
	it('create a card with UID C12345', function(done){
		chai.request(url)
		    .post('/')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    uid:'C12345'
		    })
		    .end(function(e, r){
			    expect(e).to.be.null;
			    expect(r).to.have.status(200);
			    expect(r.body.status).to.be.equal(true);
			    done();
		    });
	});
	
	it('throw 500 eror (duplicate UID) for C12345', function(done){
		chai.request(url)
		    .post('/')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    uid:'C12345'
		    })
		    .end(function(e, r){
			    expect(e).to.exist;
			    expect(r).to.have.status(500);
			    done();
		    });
	});
	
	it('create a card with UID 1f7aa98945', function(done){
		chai.request(url)
		    .post('/')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    uid:'1f7aa98945'
		    })
		    .end(function(e, r){
			    expect(e).to.be.null;
			    expect(r).to.have.status(200);
			    expect(r.body.status).to.be.equal(true);
			    done();
		    });
	});
	
	it('create a card with UID 8311598942', function(done){
		chai.request(url)
		    .post('/')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    uid:'8311598942'
		    })
		    .end(function(e, r){
			    expect(e).to.be.null;
			    expect(r).to.have.status(200);
			    expect(r.body.status).to.be.equal(true);
			    done();
		    });
	});
	
	it('create a card with UID CnoUSR', function(done){
		chai.request(url)
		    .post('/')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    uid:'CnoUSR'
		    })
		    .end(function(e, r){
			    expect(e).to.be.null;
			    expect(r).to.have.status(200);
			    expect(r.body.status).to.be.equal(true);
			    done();
		    });
	});
	
	it('respond with 4 cards', function(done){
		chai.request(url).get('/').end((e, r) =>{
			try{
				expect(e).to.be.null;
				expect(r).to.have.status(200);
				expect(r.body.status).to.be.equal(true);
				expect(r.body.data).to.have.lengthOf(4);
				done();
			}catch(ex){
				done(ex);
			}
		})
	});
	
});

describe('Update Cards (PATCH /api/card/:uid)', function(){
	
	it('throw 500 error (no update params)', function(done){
		chai.request(url)
		    .patch('/C12345')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({})
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
	
	it('update card C12345 to Enabled=1', function(done){
		chai.request(url)
		    .patch('/C12345')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    'enabled':1
		    })
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
	
	it('update card C12345 to UserREF=AAAA', function(done){
		chai.request(url)
		    .patch('/C12345')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    'userref':'AAAA'
		    })
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
	
	it('throw 500 error for patching to unknown user ZZZZ', function(done){
		chai.request(url)
		    .patch('/C12345')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    'userref':'ZZZZ'
		    })
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
	
	it('throw 404 error for patching unknown card XXXX', function(done){
		chai.request(url)
		    .patch('/XXXX')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    'userref':'AAAA'
		    })
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
	
	it('update card 1f7aa98945 to Enabled=1 and UserREF=AAAA', function(done){
		chai.request(url)
		    .patch('/1f7aa98945')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    'enabled':1,
			    'userref':'AAAA'
		    })
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
	
	it('update card 8311598942 to UserREF=BBBB', function(done){
		chai.request(url)
		    .patch('/8311598942')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    'userref':'BBBB'
		    })
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
	
	it('update card CnoUSR to Enabled=1', function(done){
		chai.request(url)
		    .patch('/CnoUSR')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    'enabled':1,
		    })
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
	
	it('verify that updates worked correctly', function(done){
		chai.request(url)
		    .get('/')
		    .end((e, r) =>{
			    try{
				    expect(e).to.be.null;
				    expect(r.body.status).to.be.equal(true);
				    expect(r).to.have.status(200);
				    
				    expect(r.body.data[3]['UID']).to.be.equal('1f7aa98945');
				    expect(r.body.data[3]['Enabled']).to.be.equal(1);
				    expect(r.body.data[3]['UserREF']).to.be.equal('AAAA');
				    
				    expect(r.body.data[2]['UID']).to.be.equal('8311598942');
				    expect(r.body.data[2]['Enabled']).to.be.equal(0);
				    expect(r.body.data[2]['UserREF']).to.be.equal('BBBB');
				
				    expect(r.body.data[1]['UID']).to.be.equal('C12345');
				    expect(r.body.data[1]['Enabled']).to.be.equal(1);
				    expect(r.body.data[1]['UserREF']).to.be.equal('AAAA');
				
				    expect(r.body.data[0]['UID']).to.be.equal('CnoUSR');
				    expect(r.body.data[0]['Enabled']).to.be.equal(1);
				    expect(r.body.data[0]['UserREF']).to.be.null;
				    
				    done();
			    }catch(ex){
				    done(ex);
			    }
		    })
	});
	
});