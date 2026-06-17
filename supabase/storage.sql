-- Proof-image bucket for log verification uploads.
-- Run once in Supabase SQL editor after enabling Storage.

insert into storage.buckets (id, name, public) values ('proofs', 'proofs', true)
on conflict (id) do nothing;

create policy "public read proofs" on storage.objects for select using (bucket_id = 'proofs');
create policy "auth upload proofs" on storage.objects for insert
  with check (bucket_id = 'proofs');
