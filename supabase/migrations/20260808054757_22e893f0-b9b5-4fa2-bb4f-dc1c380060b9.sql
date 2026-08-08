
-- product-images: admin write, everyone read
create policy "product images readable" on storage.objects for select to anon, authenticated
  using (bucket_id = 'product-images');
create policy "admins write product images" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());
create policy "admins update product images" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
create policy "admins delete product images" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- store-assets: admin write, everyone read
create policy "store assets readable" on storage.objects for select to anon, authenticated
  using (bucket_id = 'store-assets');
create policy "admins write store assets" on storage.objects for insert to authenticated
  with check (bucket_id = 'store-assets' and public.is_admin());
create policy "admins update store assets" on storage.objects for update to authenticated
  using (bucket_id = 'store-assets' and public.is_admin());
create policy "admins delete store assets" on storage.objects for delete to authenticated
  using (bucket_id = 'store-assets' and public.is_admin());

-- payment-proofs: customer uploads own, admin reads all
create policy "customers upload payment proof" on storage.objects for insert to authenticated
  with check (bucket_id = 'payment-proofs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "payment proof read" on storage.objects for select to authenticated
  using (bucket_id = 'payment-proofs' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
create policy "admins delete payment proof" on storage.objects for delete to authenticated
  using (bucket_id = 'payment-proofs' and public.is_admin());
