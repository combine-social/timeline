create table registrations (
  id serial primary key,
  instance_url varchar not null,
  registration_id varchar,
  name varchar,
  website varchar,
  redirect_uri varchar not null,
  client_id varchar not null,
  client_secret varchar not null,
  vapid_key varchar,
  nonce varchar not null
);

create table tokens (
  id serial primary key,
  username varchar not null,
	access_token varchar not null,
	token_type varchar,
	scope varchar,
	created_at int,
  registration_id int not null,
  fail_count int,

  constraint uniq_username
    unique(username),

  constraint fk_registration
    foreign key(registration_id) 
	  references registrations(id)
    on delete cascade
);
