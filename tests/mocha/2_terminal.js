const url = 'http://127.0.0.1:8800/api/terminal';

const chai = require('chai');
const chaiHTTP = require('chai-http');
const expect = chai.expect;

chai.use(chaiHTTP);

describe('Add Terminals (POST /api/terminal)', function(){
	it('create terminal BBBB with token BBBBTOKEN1234', function(done){
		chai.request(url)
		    .post('/')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    name:'BBBB',
			    token:'BBBBTOKEN1234'
		    })
		    .end(function(e, r){
			    expect(e).to.be.null;
			    expect(r).to.have.status(200);
			    expect(r.body.status).to.be.equal(true);
			    done();
		    });
	});
	
	it('throw 500 error (duplicate terminal token) for BBBBTOKEN1234', function(done){
		chai.request(url)
		    .post('/')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    name:'CCCC',
			    token:'BBBBTOKEN1234'
		    })
		    .end(function(e, r){
			    expect(e).to.exist;
			    expect(r).to.have.status(500);
			    done();
		    });
	});
	
	it('create terminal Bar 1', function(done){
		chai.request(url)
		    .post('/')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    name:'Bar 1',
			    token:'f438bdf1824977731d8eef509ceba532e48b1b1e6b5bbb6415aa85875079a788'
		    })
		    .end(function(e, r){
			    expect(e).to.be.null;
			    expect(r).to.have.status(200);
			    expect(r.body.status).to.be.equal(true);
			    done();
		    });
	});
	
	it('create terminal Bar 2', function(done){
		chai.request(url)
		    .post('/')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    name:'Bar 2',
			    token:'f136f182eba3f5343b4fa51f976b7bf036cecc8b435aa93b32c9c47820aa52cb'
		    })
		    .end(function(e, r){
			    expect(e).to.be.null;
			    expect(r).to.have.status(200);
			    expect(r.body.status).to.be.equal(true);
			    done();
		    });
	});
	
	it('create terminal Lager', function(done){
		chai.request(url)
		    .post('/')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    name:'Lager',
			    token:'d51f95f340e203056f978fbace949aff945ab9537dcce28da85b1e79d3dd4043'
		    })
		    .end(function(e, r){
			    expect(e).to.be.null;
			    expect(r).to.have.status(200);
			    expect(r.body.status).to.be.equal(true);
			    done();
		    });
	});
	
});

describe('Verify Added Terminal Data (GET /api/terminal/:id|:token)', function(){
	it('respond with correct data for terminal BBBBTOKEN1234', function(done){
		chai.request(url).get('/BBBBTOKEN1234').end((e, r) =>{
			try{
				expect(e).to.be.null;
				expect(r).to.have.status(200);
				expect(r.body.status).to.be.equal(true);
				expect(r.body.data['ID']).to.be.equal(1);
				expect(r.body.data['Enabled']).to.be.equal(1);
				expect(r.body.data['Name']).to.be.equal('BBBB');
				expect(r.body.data['Token']).to.be.equal('BBBBTOKEN1234');
				done();
			}catch(ex){
				done(ex);
			}
		})
	});
	
	it('throw 404 error for unknown terminal CCCCTOKEN1234', function(done){
		chai.request(url).get('/CCCCTOKEN1234').end((e, r) =>{
			try{
				expect(e).to.exist;
				expect(r).to.have.status(404);
				done();
			}catch(ex){
				done(ex);
			}
		})
	});
	
	it('respond with 4 terminals (GET /api/terminal)', function(done){
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

describe('Update Terminals (PATCH /api/terminal/:id)', function(){
	it('throw 500 error ( no update params were transmitted)', function(done){
		chai.request(url)
		    .patch('/1')
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
	
	it('update terminal 1 to Enabled=1', function(done){
		chai.request(url)
		    .patch('/1')
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
	
	it('update terminal 1 to Name=Frittenbude', function(done){
		chai.request(url)
		    .patch('/1')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    'name':'Frittenbude'
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
	
	it('update terminal 1 to Token=AAAABBBBCCCCDDDDEEEEFFFF', function(done){
		chai.request(url)
		    .patch('/1')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    'token':'AAAABBBBCCCCDDDDEEEEFFFF'
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
	
	it('verify that terminal 1 updated correctly (via get info by ID)', function(done){
		chai.request(url)
		    .get('/1')
		    .end((e, r) =>{
			    try{
				    expect(e).to.be.null;
				    expect(r.body.status).to.be.equal(true);
				    expect(r).to.have.status(200);
				    expect(r.body.data['Enabled']).to.be.equal(1);
				    expect(r.body.data['ID']).to.be.equal(1);
				    expect(r.body.data['Name']).to.be.equal('Frittenbude');
				    expect(r.body.data['Token']).to.be.equal('AAAABBBBCCCCDDDDEEEEFFFF');
				    done();
			    }catch(ex){
				    done(ex);
			    }
		    })
	});
	
	it('update terminal 1 back to original', function(done){
		chai.request(url)
		    .patch('/1')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    'enabled':1,
			    'name':'BBBB',
			    'token':'BBBBTOKEN1234'
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
	
	it('verify that terminal 1 updated correctly (via get info by token)', function(done){
		chai.request(url)
		    .get('/BBBBTOKEN1234')
		    .end((e, r) =>{
			    try{
				    expect(e).to.be.null;
				    expect(r.body.status).to.be.equal(true);
				    expect(r).to.have.status(200);
				    expect(r.body.data['Enabled']).to.be.equal(1);
				    expect(r.body.data['ID']).to.be.equal(1);
				    expect(r.body.data['Name']).to.be.equal('BBBB');
				    expect(r.body.data['Token']).to.be.equal('BBBBTOKEN1234');
				    done();
			    }catch(ex){
				    done(ex);
			    }
		    })
	});
	
	it('update terminal 3 (Bar 2 ) to Enabled=0', function(done){
		chai.request(url)
		    .patch('/3')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    'enabled':0
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
	
});