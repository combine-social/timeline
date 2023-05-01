create table workers (
  id serial primary key
);

insert into workers (id) values (1);
alter sequence workers_id_seq RESTART WITH 2;

alter table tokens add column
  worker_id int not null
  default 1;

alter table tokens add
  constraint fk_worker
    foreign key(worker_id) 
	  references workers(id)
    on delete set default;
