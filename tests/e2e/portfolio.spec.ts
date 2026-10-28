import {test,expect} from '@playwright/test';
const token='a'.repeat(64);
test.beforeEach(async({page})=>{
 let settings:any=null,version=0;
 await page.route('**/api/**',async route=>{
  const path=new URL(route.request().url()).pathname;let body:any={ok:true};
  if(path==='/api/settings')body={settings,version};
  if(path==='/api/admin/settings'&&route.request().method()==='PUT'){settings=route.request().postDataJSON().settings;body={version:++version};}
  if(path==='/api/admin/settings/history')body=[];
  if(path==='/api/admin/login')body={ok:true,token};
  if(path==='/api/analytics/stats')body={total:12,today:2,history:[{date:'2026-10-28',count:2}]};
  if(path==='/api/analytics/lang-stats'||path==='/api/messages')body=[];
  if(path==='/api/admin/health')body={ok:true,emailConfigured:true,messagesStorage:'supabase-postgres',statsStorage:'supabase-postgres',uptimeSeconds:10};
  if(path==='/api/admin/cron/status')body={jobName:'supabase-keepalive',schedule:'0 3 * * 1,4',nextScheduledAt:'2026-10-29T03:00:00Z',totalRuns:0,successRuns:0,failedRuns:0,runs:[]};
  await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body)});
 });
});
test('public identity, responsive layout, language and theme work',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await expect(page.getByTestId('profile-name')).toHaveText('aka.');await expect(page.getByText('Saya Abdul Khaliq Arrasyid',{exact:false})).toHaveCount(1);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.getByTestId('lang-toggle').click();await expect(page.locator('html')).toHaveAttribute('lang','en');await page.getByTestId('theme-toggle').click();await expect(page.locator('html')).not.toHaveClass(/dark/);expect(errors).toEqual([]);
});
test('navigation traps focus, closes on Escape and restores focus',async({page})=>{
 await page.goto('/');const toggle=page.getByTestId('sidebar-toggle');await toggle.click();const dialog=page.getByRole('dialog',{name:'Navigasi'});await expect(dialog).toBeVisible();await expect(page.getByRole('button',{name:'Tutup navigasi'})).toBeFocused();await page.keyboard.press('Shift+Tab');await expect(page.getByTestId('nav-contact')).toBeFocused();await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);await expect(toggle).toBeFocused();
});
test('contact validation preserves inputs and reports successful persistence',async({page})=>{
 await page.goto('/');await page.getByTestId('contact-send').click();await expect(page.getByText('Nama wajib diisi.')).toBeVisible();await page.getByTestId('contact-name').fill('Fixture');await page.getByTestId('contact-email').fill('fixture@example.com');await page.getByTestId('contact-message').fill('Valid fixture message');await page.getByTestId('contact-send').click();await expect(page.locator('#contact [role=status]')).toBeVisible();
});
test('all AdminDashboard tabs, preview and publication work',async({page})=>{
 await page.goto('/x7k9adm2p4q');await page.getByTestId('admin-password-input').fill('Fixture password');await page.getByTestId('admin-login-btn').click();for(const tab of ['analytics','cron','home','about','tech','projects','friends','social','audio','settings']){await page.getByTestId(`admin-tab-${tab}`).click();await expect(page.getByTestId(`admin-tab-${tab}`)).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 await page.getByTestId('admin-tab-home').click();await page.getByTestId('admin-name').fill('Draft Aka');const popupPromise=page.waitForEvent('popup');await page.getByRole('button',{name:'Pratinjau',exact:true}).click();const preview=await popupPromise;await expect(preview.getByTestId('profile-name')).toHaveText('Draft Aka.');await expect(preview.locator('meta[name=robots]')).toHaveAttribute('content','noindex, nofollow');await preview.close();await page.getByTestId('admin-save').click();await expect(page.getByText('Perubahan dipublikasikan dan terlihat oleh semua pengunjung',{exact:true})).toBeVisible();await page.goto('/');await expect(page.getByTestId('profile-name')).toHaveText('Draft Aka.');
});
