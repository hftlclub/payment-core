const url = 'http://127.0.0.1:8800/email';
const chai = require('chai');
const chaiHTTP = require('chai-http');
const expect = chai.expect;

chai.use(chaiHTTP);

const mail = require('../mailServer');

describe('Email Tests', function(){
	
	it('respond with correct JSON preview ALL NEXT MAILS', function(done){
		chai.request(url)
		    .get('/')
		    .end(function(e, r){
			    try{
				    expect(e).to.be.null;
				    expect(r).to.have.status(200);
				    expect(r.body.status).to.be.equal(true);
				
				    expect(r.body.data).to.have.lengthOf(2);
				
				    expect(r.body.data[0]['email']).to.be.equal('AA@test.local');
				    expect(r.body.data[0]['user']).to.be.equal('AAAA');
				    expect(r.body.data[0]['data']).to.have.lengthOf(2);
				
				    expect(r.body.data[1]['email']).to.be.equal('BB@test.local');
				    expect(r.body.data[1]['user']).to.be.equal('BBBB');
				    expect(r.body.data[1]['data']).to.have.lengthOf(1);
				
				    done();
			    }catch(ex){
				    done(ex);
			    }
		    })
	});
	
	it('respond with correct JSON preview for user AAAA', function(done){
		chai.request(url)
		    .get('/preview/AAAA/1MINUTE')
		    .end((e, r) =>{
			    try{
				    expect(e).to.be.null;
				    expect(r).to.have.status(200);
				    expect(r.body.status).to.be.equal(true);
				    expect(r.body.data['email']).to.be.equal('AA@test.local');
				    expect(r.body.data['user']).to.be.equal('AAAA');
				    expect(r.body.data['data']).to.have.lengthOf(2);
				    done();
			    }catch(ex){
				    done(ex);
			    }
		    })
	});
	
	it('respond with correct HTML preview for user AAAA', function(done){
		chai.request(url)
		    .get('/preview/AAAA/1MINUTE/html')
		    .end(function(e, r){
			    try{
				    expect(e).to.be.null;
				    expect(r).to.have.status(200);
				    expect(r.text).to.include('1f7aa98945');
				    expect(r.text).to.include('C12345');
				    done();
			    }catch(ex){
				    done(ex);
			    }
		    })
	});
	
	it('throw 404 error for unknown user XXXX', function(done){
		chai.request(url)
		    .get('/XXXX/1MINUTE')
		    .end(function(e, r){
			    try{
				    expect(e).to.exist;
				    expect(r).to.have.status(404);
				    expect(r.body.status).to.be.equal(false);
				    done();
			    }catch(ex){
				    done(ex);
			    }
		    });
	});
	
	it('send emails correctly', function(done){
		chai.request(url)
		    .post('/1DAY')
		    .end(function(e, r){
			    try{
				    expect(e).to.be.null;
				    expect(r).to.have.status(200);
				    expect(r.body.status).to.be.equal(true);
				    mail.on('new', function(email){
					    if(email.headers.to === 'AA@test.local' || email.headers.to === 'BB@test.local'){
						    done();
					    }
					
				    });
			    }catch(ex){
				    done(ex);
			    }
		    });
	})
	
});