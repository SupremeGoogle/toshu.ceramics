create table site_content (
  id int primary key,
  content jsonb not null
);

alter table site_content enable row level security;

create policy "read" on site_content for select using (true);
create policy "write" on site_content for insert with check (true);
create policy "update" on site_content for update using (true);
