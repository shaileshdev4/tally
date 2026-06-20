-- 005_challenge_delete_leave.sql — members can leave; hosts can delete their challenges

drop policy if exists "delete own membership" on members;
create policy "delete own membership" on members
  for delete using (auth.uid() = user_id);

drop policy if exists "delete challenges host" on challenges;
create policy "delete challenges host" on challenges
  for delete using (
    auth.uid() is not null
    and created_by = auth.uid()
    and coalesce(is_demo, false) = false
  );
