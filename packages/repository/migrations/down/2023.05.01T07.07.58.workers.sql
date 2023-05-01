alter table tokens drop constraint fk_worker;
alter table tokens drop column worker_id;
drop table workers;
