import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database.js';
import { 
  filterDataWithAI, 
  analyzeDataRelevance, 
  batchFilterData,
  saveFilterResult,
  getFilterResults,
  getFilterResultById,
  deleteFilterResult
} from '../services/aiFilterService.js';

const router = express.Router();

router.post('/filter', async (req, res) => {
  try {
    const { data_items, filter_rule_id, filter_rule } = req.body;

    if (!data_items || !Array.isArray(data_items) || data_items.length === 0) {
      return res.status(400).json({ error: '请提供数据条目数组' });
    }

    if (data_items.length > 100) {
      return res.status(400).json({ error: '单次处理数据量不能超过100条' });
    }

    console.log(`开始AI筛选处理，共 ${data_items.length} 条数据`);

    const results = await filterDataWithAI(data_items, filter_rule || null);

    if (results && results.length > 0) {
      const firstResult = results[0];
      saveFilterResult(
        data_items,
        filter_rule_id || null,
        results,
        firstResult.relevance_score || 0,
        firstResult.category || '未分类',
        firstResult.summary || ''
      );
    }

    res.json({
      success: true,
      count: results.length,
      results: results
    });
  } catch (error) {
    console.error('AI筛选失败:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/analyze', async (req, res) => {
  try {
    const { data_item } = req.body;

    if (!data_item) {
      return res.status(400).json({ error: '请提供数据条目' });
    }

    console.log('开始AI相关性分析');

    const result = await analyzeDataRelevance(data_item);

    res.json({
      success: true,
      result: result
    });
  } catch (error) {
    console.error('AI分析失败:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/batch-filter', async (req, res) => {
  try {
    const { data_items, filter_rule_id, filter_rule } = req.body;

    if (!data_items || !Array.isArray(data_items) || data_items.length === 0) {
      return res.status(400).json({ error: '请提供数据条目数组' });
    }

    if (data_items.length > 500) {
      return res.status(400).json({ error: '批量处理数据量不能超过500条' });
    }

    console.log(`开始AI批量筛选处理，共 ${data_items.length} 条数据`);

    const results = await batchFilterData(data_items, filter_rule || null);

    saveFilterResult(
      data_items,
      filter_rule_id || null,
      results,
      results.reduce((sum, r) => sum + (r.relevance_score || 0), 0) / results.length,
      '批量处理',
      `处理了 ${results.length} 条数据`
    );

    res.json({
      success: true,
      count: results.length,
      results: results
    });
  } catch (error) {
    console.error('AI批量筛选失败:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/results', (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    const results = getFilterResults(parseInt(limit), parseInt(offset));
    res.json(results);
  } catch (error) {
    console.error('获取筛选结果失败:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/results/:id', (req, res) => {
  try {
    const result = getFilterResultById(req.params.id);
    if (!result) {
      return res.status(404).json({ error: '筛选结果不存在' });
    }
    res.json(result);
  } catch (error) {
    console.error('获取筛选结果详情失败:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/results/:id', (req, res) => {
  try {
    const result = deleteFilterResult(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: '筛选结果不存在' });
    }
    res.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('删除筛选结果失败:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
