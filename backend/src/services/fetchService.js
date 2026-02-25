import cron from 'node-cron';
import db from '../database.js';
import { fetchAndSaveArticles } from './aiSearchService.js';

let scheduledTask;

export function startScheduledFetch() {
  const settings = db.prepare('SELECT value FROM settings WHERE key = ?').get('update_time');
  const updateTime = settings ? settings.value : '02:00'; // Default to 02:00 AM

  const [hour, minute] = updateTime.split(':');
  const cronExpression = `0 ${minute} ${hour} * * *`;

  if (scheduledTask) {
    scheduledTask.stop();
  }

  scheduledTask = cron.schedule(cronExpression, async () => {
    console.log(`
================================================================================
🚀 每日资讯抓取任务启动 (${new Date().toLocaleString()})
================================================================================
`);
    try {
      await fetchAndSaveArticles();
    } catch (error) {
      console.error('❌ 每日资讯抓取任务失败:', error);
    }
    console.log(`
================================================================================
✅ 每日资讯抓取任务完成 (${new Date().toLocaleString()})
================================================================================
`);
  }, {
    scheduled: true,
    timezone: "Asia/Shanghai"
  });

  console.log(`⏰ 资讯抓取任务已安排在每天 ${updateTime} 执行`);
}

export function updateScheduledFetch() {
  startScheduledFetch();
}
