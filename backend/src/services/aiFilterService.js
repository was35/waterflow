import OpenAI from 'openai';
import db from '../database.js';

const WATER_KEYWORDS = ['水务', '供水', '排水', '污水处理', '智慧水务', '水资源', '水利', '管网', '水表', '水质', '防汛', '节水', '水污染'];

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithBackoff(fn, retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`重试 ${i + 1}/${retries}: ${error.message}`);
      await sleep(RETRY_DELAY * (i + 1));
    }
  }
}

function getOpenAIClient() {
  const apiKey = db.prepare('SELECT value FROM settings WHERE key = ?').get('openai_api_key')?.value;
  const baseURL = db.prepare('SELECT value FROM settings WHERE key = ?').get('openai_base_url')?.value || 'https://api.openai.com/v1';
  
  if (!apiKey) {
    throw new Error('未配置 OpenAI API Key');
  }
  
  return new OpenAI({ apiKey, baseURL });
}

export async function filterDataWithAI(dataItems, filterRule = null) {
  const openai = getOpenAIClient();
  const model = db.prepare('SELECT value FROM settings WHERE key = ?').get('openai_model')?.value || 'gpt-4o-mini';
  const categories = db.prepare('SELECT * FROM categories').all();
  const categoryNames = categories.map(c => c.category_name);

  let systemPrompt = `你是一个水务行业数据分析师。请分析以下数据条目，判断它们是否与水务行业相关，并进行分类和相关性评分。`;

  if (filterRule) {
    systemPrompt += `\n筛选规则: ${filterRule}`;
  }

  const userPrompt = `水务关键词: ${WATER_KEYWORDS.join(', ')}
类别选项: ${categoryNames.join(', ')}

请对每个数据条目进行分析，返回JSON数组格式:
[{"id": "条目ID", "title": "标题", "is_relevant": true/false, "relevance_score": 0-100, "category": "分类名称", "summary": "简短摘要"}]

数据条目:
${JSON.stringify(dataItems, null, 2)}`;

  return retryWithBackoff(async () => {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI返回内容为空');
    }

    const results = JSON.parse(content);
    return Array.isArray(results) ? results : results.results || [];
  });
}

export async function analyzeDataRelevance(dataItem) {
  const openai = getOpenAIClient();
  const model = db.prepare('SELECT value FROM settings WHERE key = ?').get('openai_model')?.value || 'gpt-4o-mini';
  const categories = db.prepare('SELECT * FROM categories').all();
  const categoryNames = categories.map(c => c.category_name);

  const prompt = `你是一个水务行业数据分析师。请分析以下数据，判断它与水务行业的相关性。

水务关键词: ${WATER_KEYWORDS.join(', ')}
类别选项: ${categoryNames.join(', ')}

请返回JSON格式:
{
  "is_relevant": true/false,
  "relevance_score": 0-100,
  "category": "最合适的分类",
  "summary": "50字以内的摘要",
  "key_points": ["关键点1", "关键点2"]
}

数据: ${JSON.stringify(dataItem)}`;

  return retryWithBackoff(async () => {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI返回内容为空');
    }

    return JSON.parse(content);
  });
}

export async function batchFilterData(dataItems, filterRule = null) {
  const results = [];
  const batchSize = 10;

  for (let i = 0; i < dataItems.length; i += batchSize) {
    const batch = dataItems.slice(i, i + batchSize);
    console.log(`处理批次 ${Math.floor(i / batchSize) + 1}/${Math.ceil(dataItems.length / batchSize)}`);

    try {
      const batchResults = await filterDataWithAI(batch, filterRule);
      results.push(...batchResults);
    } catch (error) {
      console.error(`批次处理失败: ${error.message}`);
      results.push(...batch.map(item => ({
        id: item.id,
        is_relevant: false,
        relevance_score: 0,
        category: '未分类',
        summary: 'AI处理失败',
        error: error.message
      })));
    }
  }

  return results;
}

export function saveFilterResult(sourceData, filterRuleId, filterResult, relevanceScore, category, summary) {
  const stmt = db.prepare(`
    INSERT INTO ai_filter_results (source_data, filter_rule_id, filter_result, relevance_score, category, summary, status, processed_at)
    VALUES (?, ?, ?, ?, ?, ?, 'completed', datetime('now'))
  `);
  
  return stmt.run(
    JSON.stringify(sourceData),
    filterRuleId,
    JSON.stringify(filterResult),
    relevanceScore,
    category,
    summary
  );
}

export function getFilterResults(limit = 50, offset = 0) {
  return db.prepare(`
    SELECT * FROM ai_filter_results 
    ORDER BY created_at DESC 
    LIMIT ? OFFSET ?
  `).all(limit, offset);
}

export function getFilterResultById(id) {
  return db.prepare('SELECT * FROM ai_filter_results WHERE id = ?').get(id);
}

export function deleteFilterResult(id) {
  return db.prepare('DELETE FROM ai_filter_results WHERE id = ?').run(id);
}
