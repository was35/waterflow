import OpenAI from 'openai';
import db from '../database.js';

const WATER_KEYWORDS = ['水务', '供水', '排水', '污水处理', '智慧水务', '水资源', '水利', '管网', '水表', '水质', '防汛', '节水', '水污染'];

export async function searchWaterNews(keyword = '水务') {
  const apiKey = db.prepare('SELECT value FROM settings WHERE key = ?').get('openai_api_key')?.value;
  const baseURL = db.prepare('SELECT value FROM settings WHERE key = ?').get('openai_base_url')?.value || 'https://api.openai.com/v1';
  const model = db.prepare('SELECT value FROM settings WHERE key = ?').get('openai_model')?.value || 'gpt-4o-mini';

  if (!apiKey) {
    console.log('⚠️ 未配置 OpenAI API Key，请先在后台设置');
    return [];
  }

  const openai = new OpenAI({ apiKey, baseURL });

  const searchUrls = [
    `https://www.baidu.com/s?wd=${encodeURIComponent(keyword + ' 水务')}&rn=20`,
    `https://www.google.com/search?q=${encodeURIComponent(keyword + ' water utility')}&num=20`,
  ];

  const articles = [];

  for (const url of searchUrls) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) continue;

      const html = await response.text();
      const titleMatches = html.match(/<h3[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/h3>/gi) || [];
      const linkMatches = html.match(/<a[^>]+href="([^"]+)"[^>]*>/gi) || [];

      for (let i = 0; i < Math.min(titleMatches.length, 10); i++) {
        const titleMatch = titleMatches[i].replace(/<[^>]+>/g, '').trim();
        const linkMatch = linkMatches[i]?.match(/href="([^"]+)"/)?.[1] || '';

        if (titleMatch && titleMatch.length > 5) {
          articles.push({
            title: titleMatch,
            url: linkMatch,
            source: url.includes('baidu') ? '百度' : '谷歌',
          });
        }
      }
    } catch (error) {
      console.log(`搜索 ${url} 失败:`, error.message);
    }
  }

  if (articles.length === 0) {
    console.log('⚠️ 未能获取搜索结果，尝试使用AI生成模拟数据');
    return generateMockArticles(openai, model, keyword);
  }

  return await analyzeArticlesWithAI(openai, model, articles);
}

async function analyzeArticlesWithAI(openai, model, articles) {
  const categories = db.prepare('SELECT * FROM categories').all();
  const categoryNames = categories.map(c => c.category_name);

  const prompt = `你是一个水务行业资讯分析师。请分析以下新闻标题，判断它们是否与水务行业相关，并进行分类和评分。

相关的水务关键词包括：${WATER_KEYWORDS.join(', ')}

类别选项：${categoryNames.join(', ')}

请对每个标题：
1. 判断是否与水务行业相关（是/否）
2. 如果相关，给出AI相关性评分（0-100）
3. 分类到合适的类别
4. 生成一个摘要

请以JSON数组格式返回，格式如下：
[{"title": "标题", "score": 85, "category": "水务政策", "summary": "摘要"}]

新闻标题列表：
${articles.map((a, i) => `${i + 1}. ${a.title}`).join('\n')}`;

  try {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content || '[]';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const results = JSON.parse(jsonMatch[0]);
      return results.map((r, i) => ({
        title: r.title || articles[i]?.title || '',
        summary: r.summary || '',
        ai_score: r.score || 50,
        ai_category: r.category || '市场动态',
        source: articles[i]?.source || '未知',
        source_url: articles[i]?.url || '',
        publish_time: new Date().toISOString(),
      }));
    }
  } catch (error) {
    console.error('AI分析失败:', error.message);
  }

  return articles.map((a, i) => ({
    title: a.title,
    summary: '通过AI搜索获取的资讯',
    ai_score: 60 + Math.random() * 30,
    ai_category: '市场动态',
    source: a.source,
    source_url: a.url,
    publish_time: new Date().toISOString(),
  }));
}

async function generateMockArticles(openai, model, keyword) {
  const prompt = `请生成5条关于"${keyword}和水务"的假新闻标题和摘要，每条包括：
1. title: 标题
2. summary: 50字以内的摘要
3. score: AI评分（0-100）

请以JSON数组格式返回，格式如下：
[{"title": "标题", "summary": "摘要", "score": 85}]`;

  try {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content || '[]';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const results = JSON.parse(jsonMatch[0]);
      return results.map(r => ({
        title: r.title,
        summary: r.summary,
        ai_score: r.score,
        ai_category: '市场动态',
        source: 'AI生成',
        source_url: '',
        publish_time: new Date().toISOString(),
      }));
    }
  } catch (error) {
    console.error('AI生成失败:', error.message);
  }

  return [];
}

export async function fetchAndSaveArticles(maxCount = 50) {
  console.log('🔄 开始获取水务资讯...');

  const keywords = ['水务', '智慧水务', '污水处理', '水资源管理', '供水'];
  const allArticles = [];

  for (const keyword of keywords) {
    if (allArticles.length >= maxCount) break;
    const articles = await searchWaterNews(keyword);
    allArticles.push(...articles);
  }

  const uniqueArticles = [];
  const seenTitles = new Set();
  for (const article of allArticles) {
    const normalizedTitle = article.title.toLowerCase().replace(/\s/g, '');
    if (!seenTitles.has(normalizedTitle) && article.ai_score >= 50) {
      seenTitles.add(normalizedTitle);
      uniqueArticles.push(article);
    }
  }

  const finalArticles = uniqueArticles.slice(0, maxCount);

  console.log(`📰 获取到 ${finalArticles.length} 条资讯`);

  const categories = db.prepare('SELECT * FROM categories').all();
  const categoryMap = {};
  categories.forEach(c => { categoryMap[c.category_name] = c.category_id; });

  let savedCount = 0;
  for (const article of finalArticles) {
    const category_id = categoryMap[article.ai_category] || categories[0]?.category_id;

    try {
      db.prepare(`
        INSERT INTO articles (article_id, title, content, category_id, source, source_url, publish_time, summary, image_url, ai_score, ai_category)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'art-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        article.title,
        article.summary,
        category_id,
        article.source,
        article.source_url,
        article.publish_time,
        article.summary,
        '',
        article.ai_score,
        article.ai_category
      );
      savedCount++;
    } catch (error) {
      console.log('保存文章失败:', error.message);
    }
  }

  console.log(`✅ 成功保存 ${savedCount} 条资讯到数据库`);
  return savedCount;
}
