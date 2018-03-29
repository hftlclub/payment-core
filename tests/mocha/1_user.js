const url = 'http://127.0.0.1:8800/api/user';

const chai = require('chai');
const chaiHTTP = require('chai-http');
const expect = chai.expect;

chai.use(chaiHTTP);

describe('Add Users (POST /api/user)', function(){
	it('create user AAAA with AA@AA.AA', function(done){
		chai.request(url)
		    .post('/')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    username:'AAAA',
			    email:'AA@AA.AA',
			    admin:false,
		    })
		    .end(function(e, r){
			    expect(e).to.be.null;
			    done();
		    });
	});
	
	it('throw 500 duplicate username error for AAAA', function(done){
		chai.request(url)
		    .post('/')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    username:'AAAA',
			    email:'AA@AA.AA',
			    admin:false,
		    })
		    .end(function(e, r){
			    expect(e).to.exist;
			    expect(r).to.have.status(500);
			    done();
		    });
	});
	
	it('throw 500 duplicate email error for AA@AA.AA', function(done){
		chai.request(url)
		    .post('/')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    username:'AAAA',
			    email:'AA@AA.AA',
			    admin:false,
		    })
		    .end(function(e, r){
			    expect(e).to.exist;
			    expect(r).to.have.status(500);
			    done();
		    });
	});
	
	it('create admin user BBBB with BB@test.local', function(done){
		chai.request(url)
		    .post('/')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    username:'BBBB',
			    email:'BB@test.local',
			    admin:true,
		    })
		    .end(function(e, r){
			    expect(e).to.be.null;
			    done();
		    });
	});
	
	it('create user CCCC with CC@CC.CC', function(done){
		chai.request(url)
		    .post('/')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    username:'CCCC',
			    email:'CC@CC.CC',
			    admin:false,
		    })
		    .end(function(e, r){
			    expect(e).to.be.null;
			    done();
		    });
	});
	
	it('respond with 3 users (GET /api/user)', function(done){
		chai.request(url).get('/').end((e, r) =>{
			try{
				expect(e).to.be.null;
				expect(r).to.have.status(200);
				expect(r.body.data).to.have.lengthOf(3);
				expect(r.body.data[0]['Username']).to.be.equal('AAAA');
				expect(r.body.data[0]['EMail']).to.be.equal('AA@AA.AA');
				expect(r.body.data[0]['Admin']).to.be.equal(0);
				expect(r.body.data[1]['Username']).to.be.equal('BBBB');
				expect(r.body.data[1]['EMail']).to.be.equal('BB@test.local');
				expect(r.body.data[1]['Admin']).to.be.equal(1);
				expect(r.body.data[2]['Username']).to.be.equal('CCCC');
				expect(r.body.data[2]['EMail']).to.be.equal('CC@CC.CC');
				expect(r.body.data[2]['Admin']).to.be.equal(0);
				done();
			}catch(ex){
				done(ex);
			}
		})
	});
	
});

describe('Get Userdata by Name (GET /api/:username)', function(){
	it('throw 404 error (user not found) for XXXX', function(done){
		chai.request(url).get('/XXXXX').end((e, r) =>{
			try{
				expect(e).to.exist;
				expect(r).to.have.status(404);
				done();
			}catch(ex){
				done(ex);
			}
		})
	});
	
	it('respond with correct data for AAAA', function(done){
		chai.request(url).get('/AAAA').end((e, r) =>{
			try{
				expect(e).to.be.null;
				expect(r).to.have.status(200);
				expect(r.body.data['Username']).to.be.equal('AAAA');
				expect(r.body.data['EMail']).to.be.equal('AA@AA.AA');
				expect(r.body.data['Admin']).to.be.equal(0);
				done();
			}catch(ex){
				done(ex);
			}
		})
	});
});

describe('Update Users (PATCH /api/user/:username)', function(){
	it('throw 500 error (no update params)', function(done){
		chai.request(url)
		    .patch('/AAAA')
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
	
	it('throw 404 error (user DDD does not exists)', function(done){
		chai.request(url)
		    .patch('/DDDD')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({admin:1})
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
	
	it('update user AAAA to Admin=1', function(done){
		chai.request(url)
		    .patch('/AAAA')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    'admin':1
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
	
	it('update user AAAA to EMail=AA@test.local', function(done){
		chai.request(url)
		    .patch('/AAAA')
		    .set('content-type', 'application/x-www-form-urlencoded')
		    .send({
			    'email':'AA@test.local'
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
		    .get('/AAAA')
		    .end((e, r) =>{
			    try{
				    expect(e).to.be.null;
				    expect(r.body.status).to.be.equal(true);
				    expect(r).to.have.status(200);
				    expect(r.body.data['Username']).to.be.equal('AAAA');
				    expect(r.body.data['EMail']).to.be.equal('AA@test.local');
				    expect(r.body.data['Admin']).to.be.equal(1);
				    done();
			    }catch(ex){
				    done(ex);
			    }
		    })
	});
});


