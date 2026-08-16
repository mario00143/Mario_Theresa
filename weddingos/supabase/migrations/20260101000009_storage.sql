-- Private document storage (sections 37-40).
--
-- Objects are stored at `<workspace_id>/<category>/<uuid>-<filename>` so a
-- workspace's files live under one folder — see
-- src/data/documents/storagePath.ts for the exact path builder used by the
-- app. No public URLs are ever generated; the UI always requests a
-- short-lived signed URL (supabase.storage.from('documents').createSignedUrl).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  10485760,
  array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ]
)
on conflict (id) do nothing;

create policy documents_bucket_select on storage.objects
  for select using (
    bucket_id = 'documents'
    and public.is_workspace_member(((storage.foldername(name))[1])::uuid)
  );

create policy documents_bucket_insert on storage.objects
  for insert with check (
    bucket_id = 'documents'
    and public.has_workspace_role(((storage.foldername(name))[1])::uuid, array['Admin','Couple','Finance Lead'])
  );

create policy documents_bucket_delete on storage.objects
  for delete using (
    bucket_id = 'documents'
    and (
      public.has_workspace_role(((storage.foldername(name))[1])::uuid, array['Admin','Couple'])
      or owner = auth.uid()
    )
  );
